import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCart } from "@/features/cart/useCart";
import { resolveImageUrl } from "@/features/products/image";
import { Button } from "@/components/ui/Button";

export default function CartPage() {
  const { t } = useTranslation();
  const { items, setQty, remove, subtotal } = useCart();

  if (items.length === 0)
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-zinc-200 bg-white p-12 text-center shadow-card">
        <p className="text-zinc-500">{t("cart.empty")}</p>
        <Link to="/tienda" className="mt-4 inline-block">
          <Button variant="secondary">{t("nav.shop")}</Button>
        </Link>
      </div>
    );

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-3xl font-semibold tracking-tight text-zinc-900">
        {t("cart.title")}
      </h1>

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-card">
        <ul className="divide-y divide-zinc-100">
          {items.map((item) => (
            <li key={item.variantId} className="flex items-center gap-4 p-4">
              <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-lg bg-gradient-to-br from-brand-50 to-brand-100 text-xs font-medium text-brand-700">
                {item.image ? (
                  <img
                    src={resolveImageUrl(item.image)}
                    alt={item.productName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  (item.size ?? "—")
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-zinc-900">
                  {item.productName}
                </p>
                <p className="text-sm text-zinc-500">
                  {[item.size, item.color].filter(Boolean).join(" · ")}
                </p>
              </div>
              <input
                type="number"
                min={1}
                value={item.quantity}
                onChange={(e) => setQty(item.variantId, Number(e.target.value))}
                className="w-16 rounded-lg border border-zinc-300 px-2 py-1.5 text-center focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
              />
              <span className="w-20 text-right font-medium text-zinc-900">
                ${(item.unitPrice * item.quantity).toFixed(2)}
              </span>
              <button
                onClick={() => remove(item.variantId)}
                className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-600"
                aria-label="Eliminar"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <div>
          <p className="text-sm text-zinc-500">{t("cart.subtotal")}</p>
          <p className="text-2xl font-semibold text-zinc-900">
            ${subtotal().toFixed(2)}
          </p>
        </div>
        <Link to="/checkout">
          <Button>{t("cart.checkout")} →</Button>
        </Link>
      </div>
    </div>
  );
}
