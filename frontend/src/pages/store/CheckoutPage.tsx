import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCart } from "@/features/cart/useCart";
import { useAuth } from "@/context/AuthContext";
import { useCheckout } from "@/features/orders/orders.queries";
import { alerts } from "@/lib/alerts";
import {
  formatCardNumber,
  formatExpiry,
  formatCvc,
  formatPhone,
  onlyDigits,
} from "@/lib/masks";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function CheckoutPage() {
  const { t } = useTranslation();
  const { items, subtotal, clear } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const checkout = useCheckout();
  const total = subtotal();

  const schema = useMemo(
    () =>
      z.object({
        // Con sesión no pedimos nombre ni correo: usamos los de la cuenta.
        name: user
          ? z.string().optional()
          : z.string().min(2, "Ingresa tu nombre"),
        email: user
          ? z.string().optional()
          : z.string().email("Correo inválido"),
        address: z.string().min(5, "Ingresa una dirección válida"),
        phone: z
          .string()
          .refine((v) => onlyDigits(v).length === 8, "Teléfono de 8 dígitos"),
        card: z
          .string()
          .refine(
            (v) => onlyDigits(v).length >= 15,
            "Número de tarjeta inválido",
          ),
        exp: z
          .string()
          .regex(/^\d{2}\/\d{2}$/, "Formato MM/AA")
          .refine((v) => {
            const mm = Number(v.slice(0, 2));
            return mm >= 1 && mm <= 12;
          }, "Mes inválido")
          .refine(
            (v) => 2000 + Number(v.slice(3, 5)) >= new Date().getFullYear() + 1,
            "Ingresa un año válido",
          ),
        cvc: z.string().regex(/^\d{3,4}$/, "CVC de 3 o 4 dígitos"),
      }),
    [user],
  );
  type FormValues = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  // Aplica una máscara al escribir, manteniendo el valor sincronizado con RHF.
  const masked =
    (field: keyof FormValues, format: (v: string) => string) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setValue(field, format(e.target.value), { shouldValidate: false });

  const onSubmit = handleSubmit(async (form) => {
    // Capturamos el resumen antes de vaciar el carrito.
    const snapshot = [...items];
    const totalSnapshot = total;
    const email = user?.email ?? form.email;
    const shippingName = user
      ? (user.fullName ?? user.email)
      : (form.name ?? "");
    try {
      const order = await checkout.mutateAsync({
        guestEmail: user ? undefined : form.email,
        shippingName,
        shippingAddress: form.address,
        shippingPhone: form.phone,
        items: items.map((i) => ({
          variantId: i.variantId,
          quantity: i.quantity,
        })),
        card: { number: form.card, exp: form.exp, cvc: form.cvc },
      });
      clear();
      navigate("/pedido-confirmado", {
        state: {
          items: snapshot,
          total: totalSnapshot,
          email,
          paymentRef: order.paymentRef,
        },
      });
    } catch (err) {
      alerts.error(err instanceof Error ? err.message : t("checkout.declined"));
    }
  });

  const err = (m?: string) =>
    m ? <p className="mt-1 text-xs text-red-600">{m}</p> : null;

  return (
    <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-[1fr_320px]">
      <div>
        <h1 className="mb-6 text-3xl font-semibold tracking-tight text-zinc-900">
          {t("checkout.title")}
        </h1>
        <form
          id="checkout-form"
          onSubmit={onSubmit}
          className="space-y-6"
          noValidate
        >
          <fieldset className="space-y-3 rounded-2xl border border-zinc-200 bg-white p-6 shadow-card">
            <legend className="px-1 text-sm font-medium text-zinc-500">
              {t("checkout.address")}
            </legend>
            {user ? (
              <p className="rounded-lg bg-zinc-50 px-3 py-2 text-sm text-zinc-600">
                Comprando como{" "}
                <span className="font-medium text-zinc-900">
                  {user.fullName ?? user.email}
                </span>{" "}
                · {user.email}
              </p>
            ) : (
              <>
                <div>
                  <Input label={t("checkout.name")} {...register("name")} />
                  {err(errors.name?.message)}
                </div>
                <div>
                  <Input label="Email" type="email" {...register("email")} />
                  {err(errors.email?.message)}
                </div>
              </>
            )}
            <div>
              <Input label={t("checkout.address")} {...register("address")} />
              {err(errors.address?.message)}
            </div>
            <div>
              <Input
                label={t("checkout.phone")}
                type="tel"
                inputMode="numeric"
                placeholder="0000-0000"
                maxLength={9}
                {...register("phone")}
                onChange={masked("phone", formatPhone)}
              />
              {err(errors.phone?.message)}
            </div>
          </fieldset>

          <fieldset className="space-y-3 rounded-2xl border border-zinc-200 bg-white p-6 shadow-card">
            <legend className="px-1 text-sm font-medium text-zinc-500">
              {t("checkout.title")}
            </legend>
            <p className="text-xs text-zinc-400">
              Pasarela simulada · una tarjeta que termina en dígito par se
              aprueba (ej. 4242 4242 4242 4242).
            </p>
            <div>
              <Input
                label={t("checkout.card")}
                inputMode="numeric"
                placeholder="4242 4242 4242 4242"
                maxLength={19}
                {...register("card")}
                onChange={masked("card", formatCardNumber)}
              />
              {err(errors.card?.message)}
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <Input
                  label="MM/AA"
                  inputMode="numeric"
                  placeholder="MM/AA"
                  maxLength={5}
                  {...register("exp")}
                  onChange={masked("exp", formatExpiry)}
                />
                {err(errors.exp?.message)}
              </div>
              <div className="flex-1">
                <Input
                  label="CVC"
                  inputMode="numeric"
                  placeholder="123"
                  maxLength={4}
                  {...register("cvc")}
                  onChange={masked("cvc", formatCvc)}
                />
                {err(errors.cvc?.message)}
              </div>
            </div>
          </fieldset>
        </form>
      </div>

      <aside className="h-fit rounded-2xl border border-zinc-200 bg-white p-6 shadow-card">
        <h2 className="font-semibold text-zinc-900">{t("cart.title")}</h2>
        <ul className="mt-4 space-y-2 text-sm">
          {items.map((i) => (
            <li
              key={i.variantId}
              className="flex justify-between text-zinc-600"
            >
              <span className="truncate pr-2">
                {i.productName} × {i.quantity}
              </span>
              <span className="shrink-0">
                ${(i.unitPrice * i.quantity).toFixed(2)}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex justify-between border-t border-zinc-100 pt-4">
          <span className="font-medium text-zinc-900">
            {t("cart.subtotal")}
          </span>
          <span className="text-lg font-semibold text-zinc-900">
            ${total.toFixed(2)}
          </span>
        </div>
        <Button
          type="submit"
          form="checkout-form"
          fullWidth
          className="mt-6"
          disabled={checkout.isPending || items.length === 0}
        >
          {checkout.isPending ? t("checkout.processing") : t("checkout.pay")}
        </Button>
      </aside>
    </div>
  );
}
