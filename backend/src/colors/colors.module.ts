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
class ColorsService {
  constructor(private prisma: PrismaService) {}
  findAll() {
    return this.prisma.color.findMany({ orderBy: { sortOrder: "asc" } });
  }
  create(data: { name: string; hex: string; sortOrder?: number }) {
    return this.prisma.color.create({ data });
  }
  update(id: string, data: { name?: string; hex?: string }) {
    return this.prisma.color.update({ where: { id }, data });
  }
  remove(id: string) {
    return this.prisma.color.delete({ where: { id } });
  }
}

@Controller("colors")
class ColorsController {
  constructor(private service: ColorsService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.CATALOG)
  @Post()
  create(@Body() body: { name: string; hex: string }) {
    return this.service.create(body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.CATALOG)
  @Put(":id")
  update(
    @Param("id") id: string,
    @Body() body: { name?: string; hex?: string },
  ) {
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
  providers: [ColorsService],
  controllers: [ColorsController],
})
export class ColorsModule {}
