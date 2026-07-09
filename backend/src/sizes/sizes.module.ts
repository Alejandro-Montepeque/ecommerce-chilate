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

class SizeDto {
  @IsString() @IsNotEmpty() label!: string;
  @IsOptional() @IsInt() sortOrder?: number;
}

@Injectable()
class SizesService {
  constructor(private prisma: PrismaService) {}
  findAll() {
    return this.prisma.size.findMany({ orderBy: { sortOrder: "asc" } });
  }
  create(data: SizeDto) {
    return this.prisma.size.create({ data });
  }
  update(id: string, data: SizeDto) {
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

  @Auth(Role.ADMIN, Role.CATALOG)
  @Post()
  create(@Body() dto: SizeDto) {
    return this.service.create(dto);
  }

  @Auth(Role.ADMIN, Role.CATALOG)
  @Put(":id")
  update(@Param("id") id: string, @Body() dto: SizeDto) {
    return this.service.update(id, dto);
  }

  @Auth(Role.ADMIN, Role.CATALOG)
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
