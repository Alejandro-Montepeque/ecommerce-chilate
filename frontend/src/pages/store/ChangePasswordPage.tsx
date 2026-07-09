import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { alerts } from "@/lib/alerts";
import { Button, Input } from "@/components/ui";

export default function ChangePasswordPage() {
  const { user, isStaff, changePassword } = useAuth();
  const navigate = useNavigate();
  const forced = Boolean(user?.mustChangePassword);

  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (next.length < 8)
      return alerts.error(
        "La nueva contraseña debe tener al menos 8 caracteres.",
      );
    if (next !== confirm) return alerts.error("Las contraseñas no coinciden.");
    setSaving(true);
    try {
      await changePassword(current, next);
      await alerts.success("Contraseña actualizada");
      navigate(isStaff ? "/admin" : "/");
    } catch (err) {
      alerts.error(
        err instanceof Error ? err.message : "No se pudo cambiar la contraseña",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-card">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
          Cambia tu contraseña
        </h1>
        {forced ? (
          <p className="mt-1 text-sm text-zinc-500">
            Estás usando una contraseña temporal. Define una nueva para
            continuar.
          </p>
        ) : (
          <p className="mt-1 text-sm text-zinc-500">
            Actualiza tu contraseña de acceso.
          </p>
        )}

        <form onSubmit={submit} noValidate className="mt-5 space-y-4">
          <Input
            label={forced ? "Contraseña temporal" : "Contraseña actual"}
            type="password"
            autoComplete="current-password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
          />
          <Input
            label="Nueva contraseña"
            type="password"
            autoComplete="new-password"
            value={next}
            onChange={(e) => setNext(e.target.value)}
          />
          <Input
            label="Confirmar nueva contraseña"
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
          <Button type="submit" fullWidth disabled={saving}>
            {saving ? "Guardando..." : "Guardar contraseña"}
          </Button>
        </form>
      </div>
    </div>
  );
}
