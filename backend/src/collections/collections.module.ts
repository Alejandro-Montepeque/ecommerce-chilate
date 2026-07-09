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
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { Role } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { Auth } from "../common/decorators/auth.decorator";

class CollectionDto {
  @IsString() @IsNotEmpty() slug!: string;
  @IsString() @IsNotEmpty() nameEs!: string;
  @IsString() @IsNotEmpty() nameEn!: string;
  @IsOptional() @IsString() descriptionEs?: string;
  @IsOptional() @IsString() descriptionEn?: string;
  @IsOptional() @IsBoolean() isActive?: boolean;
}

@Injectable()
class CollectionsService {
  constructor(private prisma: PrismaService) {}
  findActive() {
    return this.prisma.collection.findMany({ where: { isActive: true } });
  }
  findAll() {
    return this.prisma.collection.findMany();
  }
  create(data: CollectionDto) {
    return this.prisma.collection.create({ data });
  }
  update(id: string, data: CollectionDto) {
    return this.prisma.collection.update({ where: { id }, data });
  }
  remove(id: string) {
    return this.prisma.collection.delete({ where: { id } });
  }
}

@Controller("collections")
class CollectionsController {
  constructor(private service: CollectionsService) {}

  @Get()
  findActive() {
    return this.service.findActive();
  }

  @Auth(Role.ADMIN, Role.CATALOG)
  @Get("admin/all")
  findAll() {
    return this.service.findAll();
  }

  @Auth(Role.ADMIN, Role.CATALOG)
  @Post()
  create(@Body() dto: CollectionDto) {
    return this.service.create(dto);
  }

  @Auth(Role.ADMIN, Role.CATALOG)
  @Put(":id")
  update(@Param("id") id: string, @Body() dto: CollectionDto) {
    return this.service.update(id, dto);
  }

  @Auth(Role.ADMIN, Role.CATALOG)
  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.service.remove(id);
  }
}

@Module({
  providers: [CollectionsService],
  controllers: [CollectionsController],
})
export class CollectionsModule {}
