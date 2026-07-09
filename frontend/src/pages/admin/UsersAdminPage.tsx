import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useUsers,
  useCreateUser,
  useSetUserRole,
  useResetUserPassword,
} from "@/features/users/users.queries";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { DataTable } from "@/components/ui/DataTable";
import { PageHeader } from "@/components/ui/PageHeader";
import { alerts } from "@/lib/alerts";
import type { Role } from "@/types";

const schema = z.object({
  email: z.string().email("Correo inválido"),
  fullName: z.string().optional(),
  role: z.enum(["MAINTENANCE", "CATALOG", "ADMIN"]),
});
type FormValues = z.infer<typeof schema>;

export default function UsersAdminPage() {
  const { data: users = [], isLoading } = useUsers();
  const createUser = useCreateUser();
  const setRole = useSetUserRole();
  const resetPassword = useResetUserPassword();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { role: "MAINTENANCE" },
  });

  const onSubmit = handleSubmit((data) => {
    createUser.mutate(data, {
      onSuccess: () => {
        alerts.successModal(
          "Usuario creado",
          "Se le envió un correo con una contraseña temporal para ingresar. Vence en 24 horas y deberá cambiarla en su primer inicio de sesión.",
        );
        reset({ email: "", fullName: "", role: "MAINTENANCE" });
      },
      onError: (e) =>
        alerts.error(e instanceof Error ? e.message : "Error al crear"),
    });
  });

  async function handleReset(id: string, email: string) {
    const ok = await alerts.confirm(
      "Restablecer acceso",
      `Se generará una nueva contraseña temporal y se enviará a ${email}. ¿Continuar?`,
    );
    if (!ok) return;
    resetPassword.mutate(id, {
      onSuccess: () => alerts.success("Correo de acceso reenviado"),
      onError: (e) =>
        alerts.error(e instanceof Error ? e.message : "No se pudo restablecer"),
    });
  }

  const roleTone = (r: Role) =>
    r === "ADMIN"
      ? "brand"
      : r === "CATALOG"
        ? "success"
        : r === "MAINTENANCE"
          ? "warning"
          : "neutral";

  return (
    <div>
      <PageHeader
        title="Usuarios"
        subtitle="Crea y administra usuarios internos (solo administradores)."
      />

      {/* Crear usuario interno */}
      <Card className="mb-8 p-6">
        <form onSubmit={onSubmit} noValidate>
          <p className="mb-1 text-sm font-medium text-zinc-500">
            Nuevo usuario
          </p>
          <p className="mb-4 text-xs text-zinc-400">
            Se enviará al correo una contraseña temporal (vence en 24 h) que la
            persona deberá cambiar al ingresar.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Email"
              type="email"
              error={errors.email?.message}
              {...register("email")}
            />
            <Input label="Nombre" {...register("fullName")} />
            <Select label="Rol" {...register("role")}>
              <option value="MAINTENANCE">Mantenimiento</option>
              <option value="CATALOG">Catálogo</option>
              <option value="ADMIN">Administrador</option>
            </Select>
          </div>
          <Button
            type="submit"
            className="mt-4"
            disabled={createUser.isPending}
          >
            {createUser.isPending ? "Creando..." : "Crear usuario"}
          </Button>
        </form>
      </Card>

      {/* Lista */}
      <DataTable
        headers={["Usuario", "Rol", "Cambiar rol", "Acceso"]}
        minWidth="680px"
        isLoading={isLoading}
        isEmpty={users.length === 0}
        emptyText="No hay usuarios."
      >
        {users.map((u) => (
          <tr key={u.id} className="hover:bg-zinc-50/50">
            <td className="px-5 py-3">
              <p className="font-medium text-zinc-900">{u.fullName || "—"}</p>
              <p className="text-xs text-zinc-500">{u.email}</p>
            </td>
            <td className="px-5 py-3">
              <Badge tone={roleTone(u.role)}>{u.role}</Badge>
            </td>
            <td className="px-5 py-3">
              {u.role === "ADMIN" ? (
                <span className="text-xs text-zinc-400">
                  No se puede degradar a un administrador
                </span>
              ) : (
                <Select
                  value={u.role}
                  onChange={(e) =>
                    setRole.mutate(
                      { id: u.id, role: e.target.value as Role },
                      {
                        onSuccess: () => alerts.success("Rol actualizado"),
                        onError: (err) =>
                          alerts.error(
                            err instanceof Error
                              ? err.message
                              : "No se pudo actualizar",
                          ),
                      },
                    )
                  }
                  className="max-w-[10rem]"
                >
                  <option value="CUSTOMER">Cliente</option>
                  <option value="MAINTENANCE">Mantenimiento</option>
                  <option value="CATALOG">Catálogo</option>
                  <option value="ADMIN">Administrador</option>
                </Select>
              )}
            </td>
            <td className="px-5 py-3">
              {u.role !== "CUSTOMER" ? (
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={resetPassword.isPending}
                  onClick={() => handleReset(u.id, u.email)}
                >
                  Reenviar acceso
                </Button>
              ) : (
                <span className="text-xs text-zinc-400">—</span>
              )}
            </td>
          </tr>
        ))}
      </DataTable>
    </div>
  );
}
