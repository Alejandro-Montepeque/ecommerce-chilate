import {
  Body,
  Controller,
  Delete,
  Get,
  Injectable,
  Module,
  Param,
  Post,
  Put,
  UseGuards,
} from "@nestjs/common";
import { Role } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";

@Injectable()
class SizesService {
  constructor(private prisma: PrismaService) {}
  findAll() {
    return this.prisma.size.findMany({ orderBy: { sortOrder: "asc" } });
  }
  create(data: { label: string; sortOrder?: number }) {
    return this.prisma.size.create({ data });
  }
  update(id: string, data: { label?: string; sortOrder?: number }) {
    return this.prisma.size.update({ where: { id }, data });
  }
  remove(id: string) {
    return this.prisma.size.delete({ where: { id } });
  }
}

@Controller("sizes")
class SizesController {
  constructor(private service: SizesService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.CATALOG)
  @Post()
  create(@Body() body: { label: string; sortOrder?: number }) {
    return this.service.create(body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.CATALOG)
  @Put(":id")
  update(@Param("id") id: string, @Body() body: { label?: string }) {
    return this.service.update(id, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.CATALOG)
  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.service.remove(id);
  }
}

@Module({
  providers: [SizesService],
  controllers: [SizesController],
})
export class SizesModule {}
