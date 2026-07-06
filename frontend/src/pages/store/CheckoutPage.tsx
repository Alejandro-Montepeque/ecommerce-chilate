import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCart } from "@/features/cart/useCart";
import { useAuth } from "@/context/AuthContext";
import { useCheckout } from "@/features/orders/orders.queries";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function CheckoutPage() {
  const { t } = useTranslation();
  const { items, subtotal, clear } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const checkout = useCheckout();

  const [form, setForm] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    card: "",
    exp: "",
    cvc: "",
  });
  const [done, setDone] = useState<string | null>(null);

  const total = subtotal();
  const set = (k: keyof typeof form) => (v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  async function handlePay(e: React.FormEvent) {
    e.preventDefault();
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
      setDone(`${t("checkout.approved")} ${order.paymentRef ?? ""}`);
      setTimeout(() => navigate("/"), 3000);
    } catch {
      /* el error se muestra desde checkout.error */
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">{t("checkout.title")}</h1>

      {done ? (
        <p className="text-green-600">{done}</p>
      ) : (
        <form onSubmit={handlePay} className="space-y-3">
          <Input
            label={t("checkout.name")}
            required
            value={form.name}
            onChange={(e) => set("name")(e.target.value)}
          />
          {!user && (
            <Input
              label="Email"
              type="email"
              required
              value={form.email}
              onChange={(e) => set("email")(e.target.value)}
            />
          )}
          <Input
            label={t("checkout.address")}
            required
            value={form.address}
            onChange={(e) => set("address")(e.target.value)}
          />
          <Input
            label={t("checkout.phone")}
            required
            value={form.phone}
            onChange={(e) => set("phone")(e.target.value)}
          />

          <hr className="my-2" />
          <p className="text-xs text-gray-400">
            Pasarela simulada · tarjeta terminada en dígito par = aprobada
          </p>
          <Input
            label={t("checkout.card")}
            required
            value={form.card}
            placeholder="4242 4242 4242 4242"
            onChange={(e) => set("card")(e.target.value)}
          />
          <div className="flex gap-3">
            <Input
              label="MM/AA"
              required
              value={form.exp}
              onChange={(e) => set("exp")(e.target.value)}
            />
            <Input
              label="CVC"
              required
              value={form.cvc}
              onChange={(e) => set("cvc")(e.target.value)}
            />
          </div>

          <p className="font-semibold">
            {t("cart.subtotal")}: ${total.toFixed(2)}
          </p>
          {checkout.isError && (
            <p className="text-red-500">
              {checkout.error instanceof Error
                ? checkout.error.message
                : t("checkout.declined")}
            </p>
          )}
          <Button fullWidth disabled={checkout.isPending}>
            {checkout.isPending ? t("checkout.processing") : t("checkout.pay")}
          </Button>
        </form>
      )}
    </div>
  );
}
