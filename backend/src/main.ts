import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestExpressApplication } from "@nestjs/platform-express";
import { json, urlencoded } from "express";
import { AppModule } from "./app.module";

async function bootstrap() {
  // Desactivamos el parser por defecto (límite 100kb) para configurar el nuestro.
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bodyParser: false,
  });
  const config = app.get(ConfigService);

  // Límite de body moderado. Las imágenes van por multipart a /uploads;
  // este límite solo cubre datos del producto y el respaldo base64 (<= 2 MB).
  app.use(json({ limit: "3mb" }));
  app.use(urlencoded({ extended: true, limit: "3mb" }));

  // Prefijo global para todas las rutas: /api/...
  app.setGlobalPrefix("api");

  // Validación automática de DTOs
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // CORS para el frontend (Vercel + local)
  const origins = (
    config.get<string>("CORS_ORIGINS") ?? "http://localhost:5173"
  )
    .split(",")
    .map((o) => o.trim());
  app.enableCors({ origin: origins, credentials: true });

  // Cloud Run inyecta PORT
  const port = config.get<number>("PORT") ?? 8080;
  await app.listen(port, "0.0.0.0");
}
bootstrap();
