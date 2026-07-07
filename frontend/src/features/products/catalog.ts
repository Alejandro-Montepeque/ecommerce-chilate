// Catálogos fijos de tallas y colores para el alta de productos.

export const SIZES = ["XS", "S", "M", "L", "XL", "XXL"] as const;
export type Size = (typeof SIZES)[number];

export interface ColorOption {
  nameEs: string;
  nameEn: string;
  hex: string;
}

// 12 colores básicos.
export const COLORS: ColorOption[] = [
  { nameEs: "Negro", nameEn: "Black", hex: "#111111" },
  { nameEs: "Blanco", nameEn: "White", hex: "#FFFFFF" },
  { nameEs: "Gris", nameEn: "Gray", hex: "#9CA3AF" },
  { nameEs: "Rojo", nameEn: "Red", hex: "#DC2626" },
  { nameEs: "Azul", nameEn: "Blue", hex: "#2563EB" },
  { nameEs: "Verde", nameEn: "Green", hex: "#16A34A" },
  { nameEs: "Amarillo", nameEn: "Yellow", hex: "#FACC15" },
  { nameEs: "Naranja", nameEn: "Orange", hex: "#EA580C" },
  { nameEs: "Morado", nameEn: "Purple", hex: "#7C3AED" },
  { nameEs: "Rosa", nameEn: "Pink", hex: "#EC4899" },
  { nameEs: "Café", nameEn: "Brown", hex: "#92400E" },
  { nameEs: "Beige", nameEn: "Beige", hex: "#E7D8B1" },
];
