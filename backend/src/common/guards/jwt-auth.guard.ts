import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

// Protege rutas que requieren sesión (token JWT válido).
@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {}
