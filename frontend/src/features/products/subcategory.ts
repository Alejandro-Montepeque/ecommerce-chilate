// Subcategoría fija del producto (Categoría › Subcategoría).
export const SUBCATEGORIES = ["HOMBRE", "MUJER", "UNISEX"] as const;
export type Subcategory = (typeof SUBCATEGORIES)[number];

const LABELS: Record<Subcategory, { es: string; en: string }> = {
  HOMBRE: { es: "Hombre", en: "Men" },
  MUJER: { es: "Mujer", en: "Women" },
  UNISEX: { es: "Unisex", en: "Unisex" },
};

export function subcategoryLabel(value: Subcategory, lang: string): string {
  return LABELS[value][lang === "en" ? "en" : "es"];
}
