import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { Role } from "@prisma/client";
import { OrdersService } from "./orders.service";
import { CreateOrderDto } from "./dto/order.dto";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { Auth } from "../common/decorators/auth.decorator";
import {
  CurrentUser,
  JwtUser,
} from "../common/decorators/current-user.decorator";
import { OptionalJwtGuard } from "../common/guards/optional-jwt.guard";

@Controller("orders")
export class OrdersController {
  constructor(private orders: OrdersService) {}

  // Checkout público: funciona como invitado o con sesión (opcional).
  @UseGuards(OptionalJwtGuard)
  @Post("checkout")
  checkout(@Body() dto: CreateOrderDto, @CurrentUser() user?: JwtUser) {
    return this.orders.checkout(dto, user?.userId);
  }

  // Cliente autenticado: sus propias órdenes.
  @UseGuards(JwtAuthGuard)
  @Get("me")
  findMine(@CurrentUser() user: JwtUser) {
    return this.orders.findMine(user.userId);
  }

  // Solo ADMIN puede ver todas las órdenes.
  @Auth(Role.ADMIN)
  @Get()
  findAll() {
    return this.orders.findAll();
  }
}
