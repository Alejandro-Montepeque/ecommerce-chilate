import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Role } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import { randomInt } from "crypto";
import { PrismaService } from "../prisma/prisma.service";
import { MailService } from "../mail/mail.service";

const TEMP_PASSWORD_TTL_MS = 24 * 60 * 60 * 1000; // 24 horas

// Contraseña temporal legible (sin caracteres ambiguos), 10 chars.
function generateTempPassword(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  let out = "";
  for (let i = 0; i < 10; i++) out += alphabet[randomInt(alphabet.length)];
  return out;
}

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private mail: MailService,
  ) {}

  findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        mustChangePassword: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  // Crea un usuario interno (solo lo llama un ADMIN). No recibe contraseña:
  // se genera una TEMPORAL, se marca para cambio obligatorio y se envía por
  // correo con vencimiento de 24 h.
  async create(data: { email: string; fullName?: string; role: Role }) {
    if (data.role === Role.CUSTOMER) {
      throw new BadRequestException(
        "Los usuarios creados desde el panel deben tener un rol interno.",
      );
    }
    const existing = await this.prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existing) throw new ConflictException("El email ya está registrado");

    const temp = generateTempPassword();
    const password = await bcrypt.hash(temp, 10);
    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        password,
        fullName: data.fullName,
        role: data.role,
        mustChangePassword: true,
        tempPasswordExpiresAt: new Date(Date.now() + TEMP_PASSWORD_TTL_MS),
      },
      select: { id: true, email: true, fullName: true, role: true },
    });

    // Envía la contraseña temporal por correo (no bloquea si el correo falla).
    void this.mail
      .sendTempPassword(user.email, temp, user.fullName ?? undefined)
      .catch(() => undefined);

    return user;
  }

  // Restablece la contraseña temporal de un usuario interno y la reenvía por
  // correo (por si expiró la anterior). Solo ADMIN.
  async resetPassword(id: string) {
    const target = await this.prisma.user.findUnique({
      where: { id },
      select: { email: true, fullName: true, role: true },
    });
    if (!target) throw new NotFoundException("Usuario no encontrado");
    if (target.role === Role.CUSTOMER) {
      throw new ForbiddenException(
        "Solo se restablece el acceso de usuarios internos.",
      );
    }

    const temp = generateTempPassword();
    const password = await bcrypt.hash(temp, 10);
    await this.prisma.user.update({
      where: { id },
      data: {
        password,
        mustChangePassword: true,
        tempPasswordExpiresAt: new Date(Date.now() + TEMP_PASSWORD_TTL_MS),
      },
    });

    void this.mail
      .sendTempPassword(target.email, temp, target.fullName ?? undefined)
      .catch(() => undefined);

    return { ok: true };
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
