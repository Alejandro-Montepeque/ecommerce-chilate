import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Injectable,
  Module,
  Param,
  Post,
  UseGuards,
} from "@nestjs/common";
import { Role } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";

interface CreateDiscountBody {
  productId: string;
  percent: number;
  startsAt: string;
  endsAt: string;
}

@Injectable()
class DiscountsService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.discount.findMany({
      include: { product: { select: { nameEs: true } } },
      orderBy: { startsAt: "desc" },
    });
  }

  // Público: para el banner de la tienda. Devuelve el descuento VIGENTE
  // (activo ahora) o, si no hay, el PRÓXIMO por comenzar. Si no hay ninguno
  // devuelve { state: "none" } para que el banner nunca se muestre.
  async banner() {
    const now = new Date();

    const [active] = await this.prisma.discount.findMany({
      where: { startsAt: { lte: now }, endsAt: { gt: now } },
      orderBy: [{ percent: "desc" }, { endsAt: "asc" }],
      take: 1,
      select: { startsAt: true, endsAt: true, percent: true },
    });
    if (active) return { state: "active", ...active };

    const [upcoming] = await this.prisma.discount.findMany({
      where: { startsAt: { gt: now } },
      orderBy: { startsAt: "asc" },
      take: 1,
      select: { startsAt: true, endsAt: true, percent: true },
    });
    if (upcoming) return { state: "upcoming", ...upcoming };

    return { state: "none" };
  }

  create(body: CreateDiscountBody) {
    const start = new Date(body.startsAt);
    const end = new Date(body.endsAt);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new BadRequestException("Fechas inválidas.");
    }
    if (!(body.percent > 0 && body.percent <= 100)) {
      throw new BadRequestException("El porcentaje debe ser entre 1 y 100.");
    }
    // Los descuentos solo pueden empezar a partir del día siguiente (00:00).
    const tomorrow = new Date();
    tomorrow.setHours(0, 0, 0, 0);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (start < tomorrow) {
      throw new BadRequestException(
        "El descuento debe empezar a partir del día siguiente.",
      );
    }
    if (end <= start) {
      throw new BadRequestException(
        "La fecha de fin debe ser posterior al inicio.",
      );
    }

    return this.prisma.discount.create({
      data: {
        productId: body.productId,
        percent: body.percent,
        startsAt: start,
        endsAt: end,
      },
    });
  }

  remove(id: string) {
    return this.prisma.discount.delete({ where: { id } });
  }
}

@Controller("discounts")
class DiscountsController {
  constructor(private service: DiscountsService) {}

  // Público: descuento vigente o próximo (para el banner de la tienda).
  @Get("banner")
  banner() {
    return this.service.banner();
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.CATALOG)
  findAll() {
    return this.service.findAll();
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.CATALOG)
  create(@Body() body: CreateDiscountBody) {
    return this.service.create(body);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.CATALOG)
  remove(@Param("id") id: string) {
    return this.service.remove(id);
  }
}

@Module({
  providers: [DiscountsService],
  controllers: [DiscountsController],
})
export class DiscountsModule {}
