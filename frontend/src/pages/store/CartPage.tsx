import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCart } from "@/features/cart/useCart";
import { resolveImageUrl } from "@/features/products/image";
import { Button } from "@/components/ui";

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
            <li
              key={item.variantId}
              className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-4"
            >
              <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
                <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-xl bg-gradient-to-br from-brand-50 to-sage-50 text-xs font-medium text-brand-700">
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
                  <p className="font-bold text-zinc-900">{item.productName}</p>
                  {[item.size, item.color].filter(Boolean).length > 0 && (
                    <p className="text-sm text-zinc-500">
                      {[item.size, item.color].filter(Boolean).join(" · ")}
                    </p>
                  )}
                  <p className="mt-0.5 text-sm text-zinc-500">
                    ${item.unitPrice.toFixed(2)} c/u
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 sm:justify-end">
                <input
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(e) =>
                    setQty(item.variantId, Number(e.target.value))
                  }
                  className="w-16 rounded-xl border border-zinc-300 px-2 py-1.5 text-center focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/25"
                  aria-label="Cantidad"
                />
                <span className="w-20 text-right font-bold text-zinc-900">
                  ${(item.unitPrice * item.quantity).toFixed(2)}
                </span>
                <button
                  onClick={() => remove(item.variantId)}
                  className="rounded-full p-2 text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-600"
                  aria-label="Eliminar"
                >
                  ✕
                </button>
              </div>
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
