import { PrismaClient, Role } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Usuario administrador inicial
  const adminEmail = "admin@chilate.com";
  const passwordHash = await bcrypt.hash("Admin123!", 10);
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      password: passwordHash,
      fullName: "Admin Chilate",
      role: Role.ADMIN,
    },
  });

  // Categorías
  const mujer = await prisma.category.upsert({
    where: { slug: "mujer" },
    update: {},
    create: { slug: "mujer", nameEs: "Mujer", nameEn: "Women", sortOrder: 1 },
  });
  await prisma.category.upsert({
    where: { slug: "hombre" },
    update: {},
    create: { slug: "hombre", nameEs: "Hombre", nameEn: "Men", sortOrder: 2 },
  });
  await prisma.category.upsert({
    where: { slug: "accesorios" },
    update: {},
    create: {
      slug: "accesorios",
      nameEs: "Accesorios",
      nameEn: "Accessories",
      sortOrder: 3,
    },
  });

  // Contenido de la landing
  const content = [
    { key: "hero_title", valueEs: "Estilo que te representa", valueEn: "Style that speaks for you" },
    { key: "hero_subtitle", valueEs: "Ropa y accesorios seleccionados con cariño", valueEn: "Clothing and accessories, curated with care" },
    { key: "footer_about", valueEs: "Chilate — moda salvadoreña.", valueEn: "Chilate — Salvadoran fashion." },
  ];
  for (const c of content) {
    await prisma.siteContent.upsert({
      where: { key: c.key },
      update: {},
      create: c,
    });
  }

  // Producto de ejemplo con variantes talla/color
  const product = await prisma.product.upsert({
    where: { slug: "camiseta-basica" },
    update: {},
    create: {
      slug: "camiseta-basica",
      nameEs: "Camiseta Básica",
      nameEn: "Basic Tee",
      descriptionEs: "Algodón 100%, corte regular.",
      descriptionEn: "100% cotton, regular fit.",
      priceUsd: 18.0,
      isPublished: true,
      categoryId: mujer.id,
    },
  });

  const variants = [
    { sku: "TEE-BLK-S", size: "S", color: "Negro", colorHex: "#111111", stock: 10 },
    { sku: "TEE-BLK-M", size: "M", color: "Negro", colorHex: "#111111", stock: 15 },
    { sku: "TEE-WHT-M", size: "M", color: "Blanco", colorHex: "#FFFFFF", stock: 8 },
    { sku: "TEE-WHT-L", size: "L", color: "Blanco", colorHex: "#FFFFFF", stock: 5 },
  ];
  for (const v of variants) {
    await prisma.productVariant.upsert({
      where: { sku: v.sku },
      update: {},
      create: { ...v, productId: product.id },
    });
  }

  console.log("Seed completado. Admin:", adminEmail, "/ password: Admin123!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
