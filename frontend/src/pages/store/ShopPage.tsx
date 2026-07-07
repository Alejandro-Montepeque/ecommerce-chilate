import { useState } from "react";
import { useTranslation } from "react-i18next";
import { localized } from "@/i18n";
import {
  usePublishedProducts,
  useCategories,
} from "@/features/products/products.queries";
import { ProductCard } from "@/features/products/ProductCard";
import { Spinner } from "@/components/ui/Spinner";

export default function ShopPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const { data: products = [], isLoading } = usePublishedProducts();
  const { data: categories = [] } = useCategories();
  const [category, setCategory] = useState<string | null>(null);

  if (isLoading) return <Spinner />;

  const filtered = category
    ? products.filter((p) => p.categoryId === category)
    : products;

  const chip = (active: boolean) =>
    `rounded-full border px-4 py-1.5 text-sm transition-colors ${
      active
        ? "border-brand-600 bg-brand-600 text-white"
        : "border-zinc-300 text-zinc-600 hover:border-zinc-400"
    }`;

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
          {t("nav.shop")}
        </h1>
        <p className="mt-1 text-zinc-500">
          {filtered.length} {filtered.length === 1 ? "producto" : "productos"}
        </p>
      </header>

      {/* Filtro de categorías */}
      {categories.length > 0 && (
        <div className="mb-8 flex flex-wrap gap-2">
          <button onClick={() => setCategory(null)} className={chip(!category)}>
            {t("shop.all")}
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategory(c.id)}
              className={chip(category === c.id)}
            >
              {localized(c, "name", lang)}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 p-16 text-center text-zinc-500">
          {t("shop.empty")}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
