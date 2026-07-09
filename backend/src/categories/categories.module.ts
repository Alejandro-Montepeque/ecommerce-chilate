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
} from "@nestjs/common";
import { IsInt, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { Role } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { Auth } from "../common/decorators/auth.decorator";

class CategoryDto {
  @IsString() @IsNotEmpty() slug!: string;
  @IsString() @IsNotEmpty() nameEs!: string;
  @IsString() @IsNotEmpty() nameEn!: string;
  @IsOptional() @IsInt() sortOrder?: number;
}

@Injectable()
class CategoriesService {
  constructor(private prisma: PrismaService) {}
  findAll() {
    return this.prisma.category.findMany({ orderBy: { sortOrder: "asc" } });
  }
  create(data: CategoryDto) {
    return this.prisma.category.create({ data });
  }
  update(id: string, data: CategoryDto) {
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

  @Auth(Role.ADMIN, Role.CATALOG)
  @Post()
  create(@Body() dto: CategoryDto) {
    return this.service.create(dto);
  }

  @Auth(Role.ADMIN, Role.CATALOG)
  @Put(":id")
  update(@Param("id") id: string, @Body() dto: CategoryDto) {
    return this.service.update(id, dto);
  }

  @Auth(Role.ADMIN, Role.CATALOG)
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
