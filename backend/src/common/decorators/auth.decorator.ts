import { applyDecorators, UseGuards } from "@nestjs/common";
import { Role } from "@prisma/client";
import { JwtAuthGuard } from "../guards/jwt-auth.guard";
import { RolesGuard } from "../guards/roles.guard";
import { Roles } from "./roles.decorator";

// Decorador compuesto: exige sesión (JWT) y uno de los roles indicados.
// Reemplaza el triplete repetido @UseGuards(JwtAuthGuard, RolesGuard) + @Roles.
export function Auth(...roles: Role[]) {
  return applyDecorators(UseGuards(JwtAuthGuard, RolesGuard), Roles(...roles));
}
