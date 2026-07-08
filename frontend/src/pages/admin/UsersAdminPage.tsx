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
import { Spinner } from "@/components/ui/Spinner";
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

  if (isLoading) return <Spinner />;

  const roleTone = (r: Role) =>
    r === "ADMIN"
      ? "brand"
      : r === "CATALOG"
        ? "success"
        : r === "MAINTENANCE"
          ? "warning"
          : "neutral";

  const errMsg = (m?: string) =>
    m ? <p className="mt-1 text-xs text-red-600">{m}</p> : null;

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold tracking-tight text-zinc-900">
        Usuarios
      </h1>
      <p className="mb-6 text-zinc-500">
        Crea y administra usuarios internos (solo administradores).
      </p>

      {/* Crear usuario interno */}
      <form
        onSubmit={onSubmit}
        noValidate
        className="mb-8 rounded-2xl border border-zinc-200 bg-white p-6 shadow-card"
      >
        <p className="mb-1 text-sm font-medium text-zinc-500">Nuevo usuario</p>
        <p className="mb-4 text-xs text-zinc-400">
          Se enviará al correo una contraseña temporal (vence en 24 h) que la
          persona deberá cambiar al ingresar.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Input label="Email" type="email" {...register("email")} />
            {errMsg(errors.email?.message)}
          </div>
          <Input label="Nombre" {...register("fullName")} />
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-zinc-600">Rol</span>
            <Select {...register("role")}>
              <option value="MAINTENANCE">Mantenimiento</option>
              <option value="CATALOG">Catálogo</option>
              <option value="ADMIN">Administrador</option>
            </Select>
          </label>
        </div>
        <Button type="submit" className="mt-4" disabled={createUser.isPending}>
          {createUser.isPending ? "Creando..." : "Crear usuario"}
        </Button>
      </form>

      {/* Lista */}
      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-sm">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50 text-left text-xs uppercase tracking-wide text-zinc-500">
                <th className="px-5 py-3 font-medium">Usuario</th>
                <th className="px-5 py-3 font-medium">Rol</th>
                <th className="px-5 py-3 font-medium">Cambiar rol</th>
                <th className="px-5 py-3 font-medium">Acceso</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-zinc-50/50">
                  <td className="px-5 py-3">
                    <p className="font-medium text-zinc-900">
                      {u.fullName || "—"}
                    </p>
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
                              onSuccess: () =>
                                alerts.success("Rol actualizado"),
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
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
