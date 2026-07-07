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
        name: z.string().min(2, "Ingresa tu nombre"),
        email: user
          ? z.string().optional()
          : z.string().email("Correo inválido"),
        address: z.string().min(5, "Ingresa una dirección válida"),
        phone: z.string().min(6, "Ingresa un teléfono válido"),
        card: z
          .string()
          .refine((v) => v.replace(/\D/g, "").length >= 12, "Tarjeta inválida"),
        exp: z.string().min(3, "MM/AA"),
        cvc: z.string().min(3, "CVC"),
      }),
    [user],
  );
  type FormValues = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = handleSubmit(async (form) => {
    // Capturamos el resumen antes de vaciar el carrito.
    const snapshot = [...items];
    const totalSnapshot = total;
    const email = user?.email ?? form.email;
    try {
      const order = await checkout.mutateAsync({
        guestEmail: user ? undefined : form.email,
        shippingName: form.name,
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
            <div>
              <Input label={t("checkout.name")} {...register("name")} />
              {err(errors.name?.message)}
            </div>
            {!user && (
              <div>
                <Input label="Email" type="email" {...register("email")} />
                {err(errors.email?.message)}
              </div>
            )}
            <div>
              <Input label={t("checkout.address")} {...register("address")} />
              {err(errors.address?.message)}
            </div>
            <div>
              <Input label={t("checkout.phone")} {...register("phone")} />
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
                placeholder="4242 4242 4242 4242"
                {...register("card")}
              />
              {err(errors.card?.message)}
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <Input label="MM/AA" {...register("exp")} />
                {err(errors.exp?.message)}
              </div>
              <div className="flex-1">
                <Input label="CVC" {...register("cvc")} />
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
