import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { localized } from "@/i18n";
import { alerts } from "@/lib/alerts";
import { useCart } from "@/features/cart/useCart";
import { resolveImageUrl } from "@/features/products/image";
import { priceOf } from "@/features/products/price";
import { subcategoryLabel } from "@/features/products/subcategory";
import {
  useWishlistIds,
  useToggleWishlist,
} from "@/features/wishlist/wishlist.queries";
import { useAuth } from "@/context/AuthContext";
import { Badge, Button } from "@/components/ui";
import type { Product, ProductVariant } from "@/types";

// Tarjeta de producto: el color se elige con muestras (swatches) seleccionables
// y la talla con botones. Sin fotos por ahora.
export function ProductCard({ product }: { product: Product }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const add = useCart((s) => s.add);
  const { user } = useAuth();
  const navigate = useNavigate();
  const wishlistIds = useWishlistIds();
  const toggleWishlist = useToggleWishlist();
  const wished = Boolean(user) && wishlistIds.has(product.id);
  const price = priceOf(product);

  // Favoritos: visible para todos; invitado -> invita a iniciar sesión.
  async function handleWishlist() {
    if (!user) {
      const go = await alerts.confirm(
        "Inicia sesión",
        "Para guardar productos en favoritos necesitas iniciar sesión.",
      );
      if (go) navigate("/login");
      return;
    }
    toggleWishlist.mutate({ productId: product.id, active: wished });
  }

  const variants = product.variants ?? [];
  const inStock = variants.filter((v) => v.stock > 0 && v.isActive);
  const soldOut = inStock.length === 0;

  // Colores únicos disponibles (clave: nombre o hex).
  const colors = useMemo(
    () =>
      Array.from(
        new Map(
          inStock
            .filter((v) => v.color || v.colorHex)
            .map((v) => [v.color ?? v.colorHex, v]),
        ).values(),
      ),
    [inStock],
  );
  const hasColors = colors.length > 0;
  const hasSizes = inStock.some((v) => v.size);

  const [color, setColor] = useState<string | null>(
    colors.length === 1
      ? (colors[0].color ?? colors[0].colorHex ?? null)
      : null,
  );
  const [size, setSize] = useState<string | null>(null);

  const colorKey = (v: ProductVariant) => v.color ?? v.colorHex ?? "";

  // Tallas disponibles para el color elegido (o todas si no hay colores).
  const sizes = useMemo(() => {
    const pool = hasColors
      ? inStock.filter((v) => colorKey(v) === color)
      : inStock;
    return Array.from(
      new Set(pool.map((v) => v.size).filter((s): s is string => Boolean(s))),
    );
  }, [inStock, color, hasColors]);

  // Variante final según selección.
  const selectedVariant = inStock.find(
    (v) =>
      (!hasColors || colorKey(v) === color) && (!hasSizes || v.size === size),
  );

  const canAdd = Boolean(selectedVariant);

  const handleAdd = () => {
    if (!selectedVariant) return;
    add({
      variantId: selectedVariant.id,
      productName: localized(product, "name", lang),
      size: selectedVariant.size ?? null,
      color: selectedVariant.color ?? null,
      unitPrice: priceOf(
        product,
        Number(selectedVariant.priceOverrideUsd ?? product.priceUsd),
      ).final,
      quantity: 1,
      image: product.images?.[0]?.url ?? null,
    });
  };

  return (
    <div className="group flex flex-col overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover">
      {/* Cabecera: imagen si existe, si no un degradado suave de marca */}
      <div className="relative h-52 overflow-hidden bg-gradient-to-br from-brand-50 via-white to-sage-50">
        {product.images?.[0] && (
          <img
            src={resolveImageUrl(product.images[0].url)}
            alt={localized(product, "name", lang)}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}

        {/* Corazón de wishlist (visible para todos) */}
        <button
          type="button"
          aria-label="wishlist"
          onClick={handleWishlist}
          className="absolute left-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/90 shadow-soft backdrop-blur transition-transform hover:scale-110"
        >
          <HeartIcon filled={wished} />
        </button>

        <div className="absolute right-3 top-3 flex flex-col items-end gap-1">
          {price.hasDiscount && !soldOut && (
            <Badge tone="brand">-{price.percent}%</Badge>
          )}
          {soldOut ? (
            <Badge tone="warning">{t("common.outOfStock")}</Badge>
          ) : (
            <span className="rounded-full bg-white/90 px-2.5 py-1 text-sm font-semibold text-zinc-900 shadow-sm">
              {price.hasDiscount && (
                <span className="mr-1 text-xs font-normal text-zinc-400 line-through">
                  ${price.base.toFixed(2)}
                </span>
              )}
              ${price.final.toFixed(2)}
            </span>
          )}
        </div>
      </div>

      {/* Cuerpo */}
      <div className="flex flex-1 flex-col p-4">
        {product.subcategory && (
          <span className="mb-1 text-[11px] font-bold uppercase tracking-wide text-brand-600">
            {subcategoryLabel(product.subcategory, lang)}
          </span>
        )}
        <h3 className="font-bold text-zinc-900">
          {localized(product, "name", lang)}
        </h3>
        <p className="mt-1 line-clamp-2 flex-1 text-sm text-zinc-500">
          {localized(product, "description", lang)}
        </p>

        {!soldOut && (
          <div className="mt-4 space-y-3">
            {/* Selector de color (radios) */}
            {hasColors && (
              <div>
                <p className="mb-1.5 text-xs font-medium text-zinc-500">
                  {t("common.color")}
                  {color && (
                    <span className="ml-1 text-zinc-400">
                      · {colors.find((c) => colorKey(c) === color)?.color}
                    </span>
                  )}
                </p>
                <div
                  role="radiogroup"
                  aria-label={t("common.color")}
                  className="flex flex-wrap gap-2"
                >
                  {colors.map((v) => {
                    const key = colorKey(v);
                    const active = key === color;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        aria-label={v.color ?? key}
                        title={v.color ?? key}
                        onClick={() => {
                          setColor(key);
                          setSize(null);
                        }}
                        className={`h-7 w-7 rounded-full border transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 ${
                          active
                            ? "border-brand-600 ring-2 ring-brand-600 ring-offset-2"
                            : "border-black/10"
                        }`}
                        style={{ backgroundColor: v.colorHex ?? "#e5e7eb" }}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Selector de talla (botones) */}
            {hasSizes && (
              <div>
                <p className="mb-1.5 text-xs font-medium text-zinc-500">
                  {t("common.size")}
                </p>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((s) => {
                    const active = s === size;
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSize(s)}
                        className={`min-w-[2.25rem] rounded-lg border px-2.5 py-1.5 text-sm transition-colors ${
                          active
                            ? "border-brand-600 bg-brand-600 text-white"
                            : "border-zinc-300 text-zinc-700 hover:border-zinc-400"
                        }`}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
                {hasColors && !color && (
                  <p className="mt-1 text-xs text-zinc-400">
                    {lang === "en"
                      ? "Pick a color first"
                      : "Elige un color primero"}
                  </p>
                )}
              </div>
            )}

            <Button fullWidth disabled={!canAdd} onClick={handleAdd}>
              {t("common.addToCart")}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill={filled ? "#A85C60" : "none"}
      stroke={filled ? "#A85C60" : "#8E7D73"}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
    </svg>
  );
}
