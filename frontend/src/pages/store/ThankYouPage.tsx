import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSiteContent } from "@/features/content/content.queries";
import { Button } from "@/components/ui";
import type { CartItem } from "@/features/cart/useCart";

interface ThankYouState {
  items: CartItem[];
  total: number;
  email: string;
  paymentRef?: string;
}

export default function ThankYouPage() {
  const { t } = useTranslation();
  const { state } = useLocation() as { state: ThankYouState | null };
  const { data: content = [] } = useSiteContent();

  const delivery =
    content.find((c) => c.key === "email_delivery_estimate")?.valueEs ??
    "3 a 5 días hábiles";

  // Acceso directo sin pasar por el checkout.
  if (!state) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <h1 className="text-2xl font-semibold text-zinc-900">
          {t("thankyou.title")}
        </h1>
        <Link to="/tienda" className="mt-6 inline-block">
          <Button>{t("thankyou.back")}</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg py-8">
      <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-card">
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-emerald-100 text-2xl text-emerald-600">
          ✓
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
          {t("thankyou.title")}
        </h1>
        <p className="mt-2 text-zinc-500">
          {t("thankyou.emailNotice", { email: state.email })}
        </p>

        <div className="mt-6 rounded-xl bg-brand-50 px-4 py-3 text-sm text-brand-700">
          {t("thankyou.delivery")}: <strong>{delivery}</strong>
        </div>

        <div className="mt-6 text-left">
          <p className="mb-2 text-sm font-medium text-zinc-900">
            {t("thankyou.summary")}
          </p>
          <ul className="divide-y divide-zinc-100 text-sm">
            {state.items.map((i) => (
              <li key={i.variantId} className="flex justify-between py-2">
                <span className="text-zinc-600">
                  {i.productName}
                  <span className="text-zinc-400">
                    {" "}
                    · {[i.size, i.color].filter(Boolean).join(" / ")} ×{" "}
                    {i.quantity}
                  </span>
                </span>
                <span className="shrink-0 text-zinc-700">
                  ${(i.unitPrice * i.quantity).toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex justify-between border-t border-zinc-100 pt-3">
            <span className="font-medium text-zinc-900">
              {t("cart.subtotal")}
            </span>
            <span className="text-lg font-semibold text-zinc-900">
              ${state.total.toFixed(2)}
            </span>
          </div>
          {state.paymentRef && (
            <p className="mt-2 text-xs text-zinc-400">
              {t("thankyou.ref")}: {state.paymentRef}
            </p>
          )}
        </div>

        <Link to="/tienda" className="mt-8 inline-block">
          <Button>{t("thankyou.back")}</Button>
        </Link>
      </div>
    </div>
  );
}
