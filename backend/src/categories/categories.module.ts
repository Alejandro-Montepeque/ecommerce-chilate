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
class CategoriesService {
  constructor(private prisma: PrismaService) {}
  findAll() {
    return this.prisma.category.findMany({ orderBy: { sortOrder: "asc" } });
  }
  create(data: any) {
    return this.prisma.category.create({ data });
  }
  update(id: string, data: any) {
    return this.prisma.category.update({ where: { id }, data });
  }
  remove(id: string) {
    return this.prisma.category.delete({ where: { id } });
  }
}

@Controller("categories")
class CategoriesController {
  constructor(private service: CategoriesService) {}

  @Get()
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
  providers: [CategoriesService],
  controllers: [CategoriesController],
})
export class CategoriesModule {}
