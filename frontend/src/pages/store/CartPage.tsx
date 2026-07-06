import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCart } from "@/features/cart/useCart";

export default function CartPage() {
  const { t } = useTranslation();
  const { items, setQty, remove, subtotal } = useCart();

  if (items.length === 0)
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">{t("cart.empty")}</p>
        <Link to="/tienda" className="text-indigo-600 underline">
          {t("nav.shop")}
        </Link>
      </div>
    );

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">{t("cart.title")}</h1>
      <ul className="divide-y">
        {items.map((item) => (
          <li key={item.variantId} className="py-4 flex items-center gap-4">
            <div className="flex-1">
              <p className="font-medium">{item.productName}</p>
              <p className="text-sm text-gray-500">
                {[item.size, item.color].filter(Boolean).join(" · ")}
              </p>
            </div>
            <input
              type="number"
              min={1}
              value={item.quantity}
              onChange={(e) => setQty(item.variantId, Number(e.target.value))}
              className="w-16 border rounded px-2 py-1"
            />
            <span className="w-20 text-right">
              ${(item.unitPrice * item.quantity).toFixed(2)}
            </span>
            <button
              onClick={() => remove(item.variantId)}
              className="text-red-500"
            >
              ✕
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-6 flex items-center justify-between">
        <span className="font-semibold">
          {t("cart.subtotal")}: ${subtotal().toFixed(2)}
        </span>
        <Link to="/checkout" className="bg-black text-white rounded px-6 py-2">
          {t("cart.checkout")}
        </Link>
      </div>
    </div>
  );
}
