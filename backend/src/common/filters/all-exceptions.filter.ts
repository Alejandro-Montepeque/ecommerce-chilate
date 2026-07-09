import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { Response } from "express";

// Filtro global: convierte errores conocidos de Prisma en respuestas HTTP
// correctas (en vez de 500 genéricos) y deja pasar las HttpException de Nest.
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger("Exceptions");

  catch(exception: unknown, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Response>();

    // Errores propios de Nest (validación, 401, 403, 404...) → tal cual.
    if (exception instanceof HttpException) {
      return res.status(exception.getStatus()).json(exception.getResponse());
    }

    // Errores conocidos de Prisma (se identifican por su `code` "Pxxxx").
    const code = (exception as { code?: string })?.code;
    if (typeof code === "string" && /^P\d/.test(code)) {
      const status =
        code === "P2025"
          ? HttpStatus.NOT_FOUND // registro no encontrado
          : code === "P2002"
            ? HttpStatus.CONFLICT // viola restricción única
            : HttpStatus.BAD_REQUEST;
      const message =
        code === "P2025"
          ? "Recurso no encontrado"
          : code === "P2002"
            ? "Ya existe un registro con esos datos"
            : "Solicitud inválida";
      return res.status(status).json({ statusCode: status, message });
    }

    // Cualquier otra cosa → 500 (y se registra para depurar).
    this.logger.error(
      exception instanceof Error ? exception.stack : String(exception),
    );
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: "Error interno del servidor",
    });
  }
}
