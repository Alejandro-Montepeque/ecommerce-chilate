import {
  Controller,
  Delete,
  Get,
  Injectable,
  Module,
  Param,
  Post,
  UseGuards,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import {
  CurrentUser,
  JwtUser,
} from "../common/decorators/current-user.decorator";

@Injectable()
class WishlistService {
  constructor(private prisma: PrismaService) {}

  // Devuelve los productos en la wishlist del usuario.
  async list(userId: string) {
    const items = await this.prisma.wishlistItem.findMany({
      where: { userId },
      include: { product: { include: { variants: true, images: true } } },
      orderBy: { createdAt: "desc" },
    });
    return (items as { product: unknown }[]).map((i) => i.product);
  }

  async add(userId: string, productId: string) {
    await this.prisma.wishlistItem.upsert({
      where: { userId_productId: { userId, productId } },
      update: {},
      create: { userId, productId },
    });
    return { ok: true };
  }

  async remove(userId: string, productId: string) {
    await this.prisma.wishlistItem.deleteMany({ where: { userId, productId } });
    return { ok: true };
  }
}

@Controller("wishlist")
@UseGuards(JwtAuthGuard) // solo usuarios autenticados
class WishlistController {
  constructor(private service: WishlistService) {}

  @Get()
  list(@CurrentUser() user: JwtUser) {
    return this.service.list(user.userId);
  }

  @Post(":productId")
  add(@CurrentUser() user: JwtUser, @Param("productId") productId: string) {
    return this.service.add(user.userId, productId);
  }

  @Delete(":productId")
  remove(@CurrentUser() user: JwtUser, @Param("productId") productId: string) {
    return this.service.remove(user.userId, productId);
  }
}

@Module({
  providers: [WishlistService],
  controllers: [WishlistController],
})
export class WishlistModule {}
