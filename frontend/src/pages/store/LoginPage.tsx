import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";
import { alerts } from "@/lib/alerts";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const schema = z.object({
  email: z.string().email("Correo inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});
type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const { t } = useTranslation();
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const isLogin = mode === "in";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = handleSubmit(async ({ email, password }) => {
    try {
      if (isLogin) await signIn(email, password);
      else await signUp(email, password);
      navigate("/");
    } catch (err) {
      alerts.error(err instanceof Error ? err.message : "Error");
    }
  });

  return (
    <div className="mx-auto max-w-sm py-8">
      <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-card">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
          {isLogin ? t("nav.login") : "Crear cuenta"}
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          {isLogin
            ? "Ingresa a tu cuenta de Chilate"
            : "Crea tu cuenta para comprar más rápido"}
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-3" noValidate>
          <div>
            <Input label="Email" type="email" {...register("email")} />
            {errors.email && (
              <p className="mt-1 text-xs text-red-600">
                {errors.email.message}
              </p>
            )}
          </div>
          <div>
            <Input label="Password" type="password" {...register("password")} />
            {errors.password && (
              <p className="mt-1 text-xs text-red-600">
                {errors.password.message}
              </p>
            )}
          </div>
          <Button fullWidth disabled={isSubmitting}>
            {isLogin ? t("nav.login") : "Crear cuenta"}
          </Button>
        </form>

        <button
          onClick={() => setMode(isLogin ? "up" : "in")}
          className="mt-4 text-sm text-brand-600 hover:text-brand-700"
        >
          {isLogin ? "¿No tienes cuenta? Regístrate" : "Ya tengo cuenta"}
        </button>
      </div>
    </div>
  );
}
