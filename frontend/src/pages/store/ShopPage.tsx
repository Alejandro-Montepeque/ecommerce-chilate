import { useState } from "react";
import { useTranslation } from "react-i18next";
import { localized } from "@/i18n";
import { useCart } from "@/features/cart/useCart";
import { usePublishedProducts } from "@/features/products/products.queries";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import type { Product, ProductVariant } from "@/types";

export default function ShopPage() {
  const { i18n } = useTranslation();
  const lang = i18n.language;
  const { data: products = [], isLoading } = usePublishedProducts();
  const add = useCart((s) => s.add);

  if (isLoading) return <Spinner />;

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <div key={product.id} className="border rounded-lg p-4 flex flex-col">
          <h3 className="font-semibold">{localized(product, "name", lang)}</h3>
          <p className="text-sm text-gray-600 flex-1">
            {localized(product, "description", lang)}
          </p>
          <p className="mt-2 font-medium">
            ${Number(product.priceUsd).toFixed(2)}
          </p>
          <VariantPicker
            product={product}
            onAdd={(variant) =>
              add({
                variantId: variant.id,
                productName: localized(product, "name", lang),
                size: variant.size ?? null,
                color: variant.color ?? null,
                unitPrice: Number(variant.priceOverrideUsd ?? product.priceUsd),
                quantity: 1,
              })
            }
          />
        </div>
      ))}
    </div>
  );
}

function VariantPicker({
  product,
  onAdd,
}: {
  product: Product;
  onAdd: (v: ProductVariant) => void;
}) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<string>("");
  const inStock = (product.variants ?? []).filter(
    (v) => v.stock > 0 && v.isActive,
  );

  if (inStock.length === 0)
    return (
      <span className="text-xs text-red-500 mt-3">
        {t("common.outOfStock")}
      </span>
    );

  return (
    <div className="mt-3 space-y-2">
      <select
        className="w-full border rounded px-2 py-1 text-sm"
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
      >
        <option value="">{`${t("common.size")} / ${t("common.color")}`}</option>
        {inStock.map((v) => (
          <option key={v.id} value={v.id}>
            {[v.size, v.color].filter(Boolean).join(" · ")}
          </option>
        ))}
      </select>
      <Button
        fullWidth
        disabled={!selected}
        onClick={() => {
          const v = inStock.find((x) => x.id === selected);
          if (v) onAdd(v);
        }}
      >
        {t("common.addToCart")}
      </Button>
    </div>
  );
}
