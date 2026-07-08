import { PrismaClient } from "@prisma/client";

// Seeder: catálogos base (categorías, tallas y colores). Todo idempotente.
// NO inserta productos: la tienda arranca vacía y los productos los crea el
// usuario desde el panel.
export async function seedCatalogs(prisma: PrismaClient) {
  const categorias = [
    { slug: "camisas", nameEs: "Camisas", nameEn: "Shirts", sortOrder: 1 },
    { slug: "pantalones", nameEs: "Pantalones", nameEn: "Pants", sortOrder: 2 },
    { slug: "zapatos", nameEs: "Zapatos", nameEn: "Shoes", sortOrder: 3 },
    {
      slug: "accesorios",
      nameEs: "Accesorios",
      nameEn: "Accessories",
      sortOrder: 4,
    },
  ];
  for (const c of categorias) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: { sortOrder: c.sortOrder },
      create: c,
    });
  }

  const tallas = [
    { label: "XS", sortOrder: 1 },
    { label: "S", sortOrder: 2 },
    { label: "M", sortOrder: 3 },
    { label: "L", sortOrder: 4 },
    { label: "XL", sortOrder: 5 },
    { label: "XXL", sortOrder: 6 },
  ];
  for (const s of tallas) {
    await prisma.size.upsert({
      where: { label: s.label },
      update: { sortOrder: s.sortOrder },
      create: s,
    });
  }

  const colores = [
    { name: "Negro", hex: "#111111", sortOrder: 1 },
    { name: "Blanco", hex: "#FFFFFF", sortOrder: 2 },
    { name: "Gris", hex: "#9CA3AF", sortOrder: 3 },
    { name: "Rojo", hex: "#DC2626", sortOrder: 4 },
    { name: "Azul", hex: "#2563EB", sortOrder: 5 },
    { name: "Verde", hex: "#16A34A", sortOrder: 6 },
    { name: "Amarillo", hex: "#FACC15", sortOrder: 7 },
    { name: "Rosa", hex: "#EC4899", sortOrder: 8 },
    { name: "Morado", hex: "#7C3AED", sortOrder: 9 },
    { name: "Café", hex: "#92400E", sortOrder: 10 },
  ];
  for (const c of colores) {
    await prisma.color.upsert({
      where: { name: c.name },
      update: { hex: c.hex, sortOrder: c.sortOrder },
      create: c,
    });
  }
}
