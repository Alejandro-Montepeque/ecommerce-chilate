import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from "class-validator";
import { Role } from "@prisma/client";

export class CreateUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8, { message: "La contraseña debe tener al menos 8 caracteres" })
  password!: string;

  @IsOptional()
  @IsString()
  fullName?: string;

  // Solo roles internos; el ADMIN los asigna.
  @IsEnum(Role)
  role!: Role;
}
