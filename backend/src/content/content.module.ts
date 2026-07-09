import {
  Body,
  Controller,
  Get,
  Injectable,
  Module,
  Param,
  Put,
} from "@nestjs/common";
import { IsOptional, IsString } from "class-validator";
import { Role } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { Auth } from "../common/decorators/auth.decorator";

class ContentDto {
  @IsOptional() @IsString() valueEs?: string;
  @IsOptional() @IsString() valueEn?: string;
}

// Textos editables de la landing (hero, footer, etc.), bilingües.
@Injectable()
class ContentService {
  constructor(private prisma: PrismaService) {}
  findAll() {
    return this.prisma.siteContent.findMany({ orderBy: { key: "asc" } });
  }
  upsert(key: string, valueEs?: string, valueEn?: string) {
    return this.prisma.siteContent.upsert({
      where: { key },
      update: { valueEs, valueEn },
      create: { key, valueEs, valueEn },
    });
  }
}

@Controller("content")
class ContentController {
  constructor(private service: ContentService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Auth(Role.ADMIN, Role.MAINTENANCE)
  @Put(":key")
  upsert(@Param("key") key: string, @Body() dto: ContentDto) {
    return this.service.upsert(key, dto.valueEs, dto.valueEn);
  }
}

@Module({
  providers: [ContentService],
  controllers: [ContentController],
})
export class ContentModule {}
