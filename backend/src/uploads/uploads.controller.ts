import {
  BadRequestException,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { Request, Response } from "express";
import { Role } from "@prisma/client";
import { UploadsService } from "./uploads.service";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";

@Controller("uploads")
export class UploadsController {
  constructor(private uploads: UploadsService) {}

  // Subida (solo staff): guarda en el bucket privado, devuelve URL del proxy.
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MAINTENANCE, Role.CATALOG)
  @UseInterceptors(
    FileInterceptor("file", { limits: { fileSize: 2 * 1024 * 1024 } }),
  )
  async upload(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException("Archivo requerido");
    const url = await this.uploads.upload(file);
    return { url };
  }

  // Descarga pública de la imagen (proxy). El bucket sigue privado; el backend
  // lee con su service account y entrega los bytes. Sin datos sensibles aquí.
  @Get("file/*")
  async serve(@Req() req: Request, @Res() res: Response) {
    const objectPath = (req.params as Record<string, string>)[0];
    await this.uploads.streamObject(objectPath, res);
  }
}
