import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import { PrismaService } from "../prisma/prisma.service";
import { MailService } from "../mail/mail.service";
import { LoginDto, RegisterDto } from "./dto/auth.dto";

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private mail: MailService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) throw new ConflictException("El email ya está registrado");

    const hash = await bcrypt.hash(dto.password, 10);
    // Nota: el rol SIEMPRE es CUSTOMER al registrarse. El rol de staff se
    // otorga aparte (seed, o un endpoint solo para ADMIN).
    const user = await this.prisma.user.create({
      data: { email: dto.email, password: hash, fullName: dto.fullName },
    });
    // Correo de bienvenida (no bloquea el registro si falla).
    void this.mail.sendWelcome(user.email).catch(() => undefined);
    return this.sign(user);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) throw new UnauthorizedException("Credenciales inválidas");

    const ok = await bcrypt.compare(dto.password, user.password);
    if (!ok) throw new UnauthorizedException("Credenciales inválidas");

    // La contraseña temporal caduca: si venció y aún no la ha cambiado, se
    // bloquea el ingreso (un admin debe restablecerla).
    if (
      user.mustChangePassword &&
      user.tempPasswordExpiresAt &&
      user.tempPasswordExpiresAt.getTime() < Date.now()
    ) {
      throw new UnauthorizedException(
        "Tu contraseña temporal expiró. Pídele a un administrador que la restablezca.",
      );
    }

    return this.sign(user);
  }

  // Cambio de contraseña del usuario autenticado (también cubre el cambio
  // obligatorio del primer inicio de sesión).
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException("Sesión inválida");

    const ok = await bcrypt.compare(currentPassword, user.password);
    if (!ok)
      throw new UnauthorizedException("La contraseña actual no coincide");

    const hash = await bcrypt.hash(newPassword, 10);
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        password: hash,
        mustChangePassword: false,
        tempPasswordExpiresAt: null,
      },
    });
    return this.sign(updated);
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        mustChangePassword: true,
      },
    });
    return user;
  }

  private sign(user: {
    id: string;
    email: string;
    role: string;
    fullName?: string | null;
    mustChangePassword?: boolean;
  }) {
    const token = this.jwt.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });
    return {
      accessToken: token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        fullName: user.fullName ?? null,
        mustChangePassword: user.mustChangePassword ?? false,
      },
    };
  }
}
