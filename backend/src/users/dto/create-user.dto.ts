import { IsEmail, IsEnum, IsOptional, IsString } from "class-validator";
import { Role } from "@prisma/client";

export class CreateUserDto {
  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  fullName?: string;

  // Solo roles internos; el ADMIN los asigna. La contraseña NO se envía: el
  // sistema genera una temporal y la manda por correo.
  @IsEnum(Role)
  role!: Role;
}
