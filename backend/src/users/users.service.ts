import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Role } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  // Crea un usuario interno con el rol indicado (solo lo llama un ADMIN).
  async create(data: {
    email: string;
    password: string;
    fullName?: string;
    role: Role;
  }) {
    const existing = await this.prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existing) throw new ConflictException("El email ya está registrado");

    const password = await bcrypt.hash(data.password, 10);
    return this.prisma.user.create({
      data: {
        email: data.email,
        password,
        fullName: data.fullName,
        role: data.role,
      },
      select: { id: true, email: true, fullName: true, role: true },
    });
  }

  // Solo ADMIN puede cambiar roles. Regla: NO se puede quitar el rol de
  // administrador a un usuario que ya es ADMIN (ni a sí mismo).
  async setRole(id: string, role: Role) {
    const target = await this.prisma.user.findUnique({
      where: { id },
      select: { role: true },
    });
    if (!target) throw new NotFoundException("Usuario no encontrado");

    if (target.role === Role.ADMIN && role !== Role.ADMIN) {
      throw new ForbiddenException(
        "No se puede quitar el rol de administrador a otro usuario.",
      );
    }

    return this.prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, email: true, role: true },
    });
  }
}
