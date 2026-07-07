import {
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Storage } from "@google-cloud/storage";
import { randomUUID } from "crypto";
import { Response } from "express";

@Injectable()
export class UploadsService {
  // Cliente de GCS usando Application Default Credentials:
  // - En Cloud Run usa la identidad del servicio (sin archivo de clave).
  // - En local usa GOOGLE_APPLICATION_CREDENTIALS (ruta al JSON).
  private readonly storage: Storage;

  constructor(private config: ConfigService) {
    const projectId = this.config.get<string>("GCS_PROJECT_ID");
    this.storage = new Storage(projectId ? { projectId } : {});
  }

  private get bucketName(): string | undefined {
    return this.config.get<string>("GCS_BUCKET");
  }

  isConfigured() {
    return Boolean(this.bucketName);
  }

  // Sube el archivo al bucket PRIVADO y devuelve la URL del proxy del backend
  // (no una URL pública de GCS). El bucket nunca se expone a Internet.
  async upload(file: Express.Multer.File): Promise<string> {
    const bucketName = this.bucketName;
    if (!bucketName) {
      throw new ServiceUnavailableException("Almacenamiento no configurado");
    }

    const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_");
    const objectName = `products/${Date.now()}-${randomUUID().slice(0, 8)}-${safeName}`;

    await this.storage
      .bucket(bucketName)
      .file(objectName)
      .save(file.buffer, {
        contentType: file.mimetype,
        resumable: false,
        metadata: { cacheControl: "public, max-age=31536000" },
      });

    const publicBase =
      this.config.get<string>("PUBLIC_API_URL") ?? "http://localhost:8080/api";
    return `${publicBase}/uploads/file/${objectName}`;
  }

  // Descarga el objeto del bucket privado y lo envía al cliente (proxy).
  async streamObject(objectPath: string, res: Response) {
    const bucketName = this.bucketName;
    if (!bucketName)
      throw new NotFoundException("Almacenamiento no configurado");

    const file = this.storage.bucket(bucketName).file(objectPath);
    const [exists] = await file.exists();
    if (!exists) throw new NotFoundException("Imagen no encontrada");

    const [meta] = await file.getMetadata();
    res.set({
      "Content-Type": meta.contentType ?? "application/octet-stream",
      "Cache-Control": "public, max-age=31536000",
    });
    file
      .createReadStream()
      .on("error", () => res.status(500).end())
      .pipe(res);
  }
}
