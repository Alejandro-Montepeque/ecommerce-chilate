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

class ColorDto {
  @IsString() @IsNotEmpty() name!: string;
  @IsString() @IsNotEmpty() hex!: string;
  @IsOptional() @IsInt() sortOrder?: number;
}

@Injectable()
class ColorsService {
  constructor(private prisma: PrismaService) {}
  findAll() {
    return this.prisma.color.findMany({ orderBy: { sortOrder: "asc" } });
  }
  create(data: ColorDto) {
    return this.prisma.color.create({ data });
  }
  update(id: string, data: ColorDto) {
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

  @Auth(Role.ADMIN, Role.CATALOG)
  @Post()
  create(@Body() dto: ColorDto) {
    return this.service.create(dto);
  }

  @Auth(Role.ADMIN, Role.CATALOG)
  @Put(":id")
  update(@Param("id") id: string, @Body() dto: ColorDto) {
    return this.service.update(id, dto);
  }

  @Auth(Role.ADMIN, Role.CATALOG)
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
