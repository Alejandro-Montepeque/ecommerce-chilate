import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

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
