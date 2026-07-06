import { ExecutionContext, Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

// Igual que JwtAuthGuard pero NO falla si no hay token.
// Permite checkout como invitado o como usuario autenticado.
@Injectable()
export class OptionalJwtGuard extends AuthGuard("jwt") {
  handleRequest(_err: any, user: any) {
    // Si hay usuario válido lo devuelve; si no, sigue como invitado (undefined).
    return user || undefined;
  }
  // Nunca bloquea la petición.
  canActivate(context: ExecutionContext) {
    return super.canActivate(context) as boolean | Promise<boolean>;
  }
}
