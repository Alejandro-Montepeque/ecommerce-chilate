import type { Product } from "@/types";

export interface PriceInfo {
  base: number;
  final: number;
  percent: number; // 0 si no hay descuento
  hasDiscount: boolean;
}

// Calcula el precio efectivo de un producto aplicando el descuento activo
// (el backend solo devuelve descuentos vigentes).
export function priceOf(product: Product, baseOverride?: number): PriceInfo {
  const base = baseOverride ?? Number(product.priceUsd);
  const percent = product.discounts?.[0]?.percent ?? 0;
  const final = percent > 0 ? base * (1 - percent / 100) : base;
  return { base, final, percent, hasDiscount: percent > 0 };
}
