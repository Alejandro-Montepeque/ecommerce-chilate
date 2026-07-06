import {
  Controller,
  Get,
  Put,
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

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MAINTENANCE)
  @Put(":key")
  upsert(
    @Param("key") key: string,
    @Body() body: { valueEs?: string; valueEn?: string },
  ) {
    return this.service.upsert(key, body.valueEs, body.valueEn);
  }
}

@Module({
  providers: [ContentService],
  controllers: [ContentController],
})
export class ContentModule {}
