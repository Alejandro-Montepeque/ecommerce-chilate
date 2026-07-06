import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Injectable,
  Module,
  UseGuards,
} from "@nestjs/common";
import { Role } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";

@Injectable()
class BannersService {
  constructor(private prisma: PrismaService) {}
  findActive() {
    return this.prisma.banner.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });
  }
  findAll() {
    return this.prisma.banner.findMany({ orderBy: { sortOrder: "asc" } });
  }
  create(data: any) {
    return this.prisma.banner.create({ data });
  }
  update(id: string, data: any) {
    return this.prisma.banner.update({ where: { id }, data });
  }
  remove(id: string) {
    return this.prisma.banner.delete({ where: { id } });
  }
}

@Controller("banners")
class BannersController {
  constructor(private service: BannersService) {}

  @Get()
  findActive() {
    return this.service.findActive();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MAINTENANCE)
  @Get("admin/all")
  findAll() {
    return this.service.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MAINTENANCE)
  @Post()
  create(@Body() body: any) {
    return this.service.create(body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MAINTENANCE)
  @Put(":id")
  update(@Param("id") id: string, @Body() body: any) {
    return this.service.update(id, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MAINTENANCE)
  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.service.remove(id);
  }
}

@Module({
  providers: [BannersService],
  controllers: [BannersController],
})
export class BannersModule {}
