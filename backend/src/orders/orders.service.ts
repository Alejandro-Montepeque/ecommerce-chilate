import { BadRequestException, Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { PaymentsService } from "../payments/payments.service";
import { CreateOrderDto } from "./dto/order.dto";

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private payments: PaymentsService,
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
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
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

      return order;
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
