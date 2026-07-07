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
    return this.sign(user.id, user.email, user.role);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) throw new UnauthorizedException("Credenciales inválidas");

    const ok = await bcrypt.compare(dto.password, user.password);
    if (!ok) throw new UnauthorizedException("Credenciales inválidas");

    return this.sign(user.id, user.email, user.role);
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, fullName: true, role: true },
    });
    return user;
  }

  private sign(id: string, email: string, role: string) {
    const token = this.jwt.sign({ sub: id, email, role });
    return { accessToken: token, user: { id, email, role } };
  }
}
