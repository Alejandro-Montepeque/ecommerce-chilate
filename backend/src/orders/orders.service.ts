import { BadRequestException, Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { PaymentsService } from "../payments/payments.service";
import { MailService } from "../mail/mail.service";
import { CreateOrderDto } from "./dto/order.dto";

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private payments: PaymentsService,
    private mail: MailService,
  ) {}

  // Crea la orden, valida inventario, cobra (simulado) y descuenta stock.
  // Todo dentro de una transacción para mantener consistencia.
  async checkout(dto: CreateOrderDto, userId?: string) {
    const variantIds = dto.items.map((i) => i.variantId);
    const variants = await this.prisma.productVariant.findMany({
      where: { id: { in: variantIds } },
      include: { product: true },
    });

    if (variants.length !== dto.items.length) {
      throw new BadRequestException("Alguna variante no existe");
    }

    // Calcula totales y valida stock
    let subtotal = new Prisma.Decimal(0);
    const lineItems = dto.items.map((item) => {
      const variant = variants.find((v) => v.id === item.variantId)!;
      if (variant.stock < item.quantity) {
        throw new BadRequestException(
          `Sin stock suficiente para ${variant.product.nameEs}`,
        );
      }
      const unitPrice = variant.priceOverrideUsd ?? variant.product.priceUsd;
      subtotal = subtotal.add(unitPrice.mul(item.quantity));
      return {
        variantId: variant.id,
        productName: variant.product.nameEs,
        size: variant.size,
        color: variant.color,
        unitPriceUsd: unitPrice,
        quantity: item.quantity,
      };
    });

    // Cobro simulado ANTES de confirmar
    const payment = await this.payments.charge(
      dto.card.number,
      subtotal.toNumber(),
    );
    if (payment.status !== "approved") {
      throw new BadRequestException(payment.reason ?? "Pago rechazado");
    }

    // Transacción: crear orden + items + descontar stock
    const order = await this.prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          userId: userId ?? null,
          guestEmail: userId ? null : dto.guestEmail,
          status: "PAID_SIMULATED",
          subtotalUsd: subtotal,
          totalUsd: subtotal,
          shippingName: dto.shippingName,
          shippingAddress: dto.shippingAddress,
          shippingPhone: dto.shippingPhone,
          paymentRef: payment.paymentRef,
          items: { create: lineItems },
        },
        include: { items: true },
      });

      for (const item of dto.items) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      return created;
    });

    // Correo de confirmación (no bloquea la respuesta si falla).
    void this.sendOrderEmail(order, dto, userId).catch(() => undefined);

    return order;
  }

  // Determina el correo destino y envía la confirmación de compra.
  private async sendOrderEmail(
    order: { id: string; paymentRef: string | null; totalUsd: Prisma.Decimal },
    dto: CreateOrderDto,
    userId?: string,
  ) {
    let to = dto.guestEmail ?? null;
    if (!to && userId) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { email: true },
      });
      to = user?.email ?? null;
    }
    if (!to) return;

    const items = await this.prisma.orderItem.findMany({
      where: { orderId: order.id },
    });

    await this.mail.sendOrderConfirmation({
      to,
      orderId: order.id,
      paymentRef: order.paymentRef,
      totalUsd: Number(order.totalUsd),
      items: (
        items as {
          productName: string;
          size: string | null;
          color: string | null;
          unitPriceUsd: Prisma.Decimal;
          quantity: number;
        }[]
      ).map((i) => ({
        productName: i.productName,
        size: i.size,
        color: i.color,
        unitPriceUsd: Number(i.unitPriceUsd),
        quantity: i.quantity,
      })),
    });
  }

  findAll() {
    return this.prisma.order.findMany({
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });
  }

  findMine(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });
  }
}
