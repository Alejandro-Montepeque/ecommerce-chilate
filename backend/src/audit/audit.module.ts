import {
  CallHandler,
  Controller,
  ExecutionContext,
  Get,
  Injectable,
  Module,
  NestInterceptor,
  Query,
  UseGuards,
} from "@nestjs/common";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { Observable, tap } from "rxjs";
import { AuditAction, Role } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";

interface AuditEntry {
  actorId?: string;
  actorEmail: string;
  actorRole: string;
  action: AuditAction;
  entity: string;
  entityId?: string;
  details?: string;
}

const STAFF_ROLES = ["ADMIN", "MAINTENANCE", "CATALOG"];
const METHOD_ACTION: Record<string, AuditAction | undefined> = {
  POST: AuditAction.CREATE,
  PUT: AuditAction.UPDATE,
  PATCH: AuditAction.UPDATE,
  DELETE: AuditAction.DELETE,
};
// Rutas que NO se auditan (ruido o no son "cambios de contenido").
const SKIP = ["/auth", "/audit", "/uploads"];

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  // Registro tolerante a fallos: nunca debe romper la petición del usuario.
  async record(entry: AuditEntry) {
    try {
      await this.prisma.auditLog.create({ data: entry });
    } catch {
      /* noop */
    }
  }

  async list(take: number, skip: number) {
    const safeTake = Math.min(Math.max(take || 50, 1), 100);
    const safeSkip = Math.max(skip || 0, 0);
    const [items, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        orderBy: { createdAt: "desc" },
        take: safeTake,
        skip: safeSkip,
      }),
      this.prisma.auditLog.count(),
    ]);
    return { items, total };
  }
}

// Interceptor global: registra las escrituras (POST/PUT/PATCH/DELETE) hechas
// por usuarios internos (staff) tras completarse con éxito el handler.
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private audit: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest();
    const action = METHOD_ACTION[req.method];
    const user = req.user as
      { userId: string; email: string; role: string } | undefined;
    const path: string = (req.originalUrl || req.url || "").split("?")[0];
    const isStaff = Boolean(user && STAFF_ROLES.includes(user.role));
    const skip = SKIP.some((p) => path.includes(p));

    if (!action || !isStaff || skip) return next.handle();

    const segments = path
      .replace(/^\/api\//, "")
      .split("/")
      .filter(Boolean);
    const entity = segments[0] ?? "unknown";
    const entityId: string | undefined =
      req.params?.id ?? req.params?.productId ?? req.params?.key;

    return next.handle().pipe(
      tap((body: unknown) => {
        const b = (body ?? {}) as Record<string, unknown>;
        const details =
          (b.nameEs as string) ||
          (b.name as string) ||
          (b.label as string) ||
          (b.title as string) ||
          req.params?.key ||
          undefined;
        void this.audit.record({
          actorId: user!.userId,
          actorEmail: user!.email,
          actorRole: user!.role,
          action: action,
          entity,
          entityId: entityId ?? ((b.id as string) || undefined),
          details,
        });
      }),
    );
  }
}

@Controller("audit")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN) // la bitácora solo la consulta un administrador
class AuditController {
  constructor(private service: AuditService) {}

  @Get()
  list(@Query("take") take?: string, @Query("skip") skip?: string) {
    return this.service.list(Number(take ?? 50), Number(skip ?? 0));
  }
}

@Module({
  providers: [
    AuditService,
    { provide: APP_INTERCEPTOR, useClass: AuditInterceptor },
  ],
  controllers: [AuditController],
  exports: [AuditService],
})
export class AuditModule {}
