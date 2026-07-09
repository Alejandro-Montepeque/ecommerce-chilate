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
import { IsBoolean, IsInt, IsOptional, IsString } from "class-validator";
import { Role } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { Auth } from "../common/decorators/auth.decorator";

class BannerDto {
  @IsOptional() @IsString() titleEs?: string;
  @IsOptional() @IsString() titleEn?: string;
  @IsOptional() @IsString() subtitleEs?: string;
  @IsOptional() @IsString() subtitleEn?: string;
  @IsOptional() @IsString() imageUrl?: string;
  @IsOptional() @IsString() linkUrl?: string;
  @IsOptional() @IsInt() sortOrder?: number;
  @IsOptional() @IsBoolean() isActive?: boolean;
}

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
  create(data: BannerDto) {
    return this.prisma.banner.create({ data });
  }
  update(id: string, data: BannerDto) {
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

  @Auth(Role.ADMIN, Role.MAINTENANCE)
  @Get("admin/all")
  findAll() {
    return this.service.findAll();
  }

  @Auth(Role.ADMIN, Role.MAINTENANCE)
  @Post()
  create(@Body() dto: BannerDto) {
    return this.service.create(dto);
  }

  @Auth(Role.ADMIN, Role.MAINTENANCE)
  @Put(":id")
  update(@Param("id") id: string, @Body() dto: BannerDto) {
    return this.service.update(id, dto);
  }

  @Auth(Role.ADMIN, Role.MAINTENANCE)
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
