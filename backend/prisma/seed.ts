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
    {
      key: "hero_title",
      valueEs: "Estilo que te representa",
      valueEn: "Style that speaks for you",
    },
    {
      key: "hero_subtitle",
      valueEs: "Ropa y accesorios seleccionados con cariño",
      valueEn: "Clothing and accessories, curated with care",
    },
    {
      key: "footer_tagline",
      valueEs: "Ropa y accesorios salvadoreños, con estilo propio.",
      valueEn: "Salvadoran clothing and accessories, with its own style.",
    },
    { key: "footer_shop_title", valueEs: "Tienda", valueEn: "Shop" },
    { key: "footer_help_title", valueEs: "Ayuda", valueEn: "Help" },
    { key: "footer_help_shipping", valueEs: "Envíos", valueEn: "Shipping" },
    {
      key: "footer_help_returns",
      valueEs: "Cambios y devoluciones",
      valueEn: "Returns and exchanges",
    },
    { key: "footer_help_contact", valueEs: "Contacto", valueEn: "Contact" },
    { key: "footer_contact_title", valueEs: "Contacto", valueEn: "Contact" },
    {
      key: "footer_email",
      valueEs: "hola@chilate.com",
      valueEn: "hola@chilate.com",
    },
    { key: "footer_phone", valueEs: "", valueEn: "" },
    {
      key: "footer_location",
      valueEs: "San Salvador, SV",
      valueEn: "San Salvador, SV",
    },
    {
      key: "footer_rights",
      valueEs: "Todos los derechos reservados",
      valueEn: "All rights reserved",
    },
    // Textos de correos (se editan en el panel; el envío usa el español).
    {
      key: "email_welcome_subject",
      valueEs: "¡Bienvenido a Chilate!",
      valueEn: "",
    },
    {
      key: "email_welcome_body",
      valueEs:
        "Gracias por crear tu cuenta en Chilate. Nos alegra tenerte aquí. Explora nuestra tienda y encuentra tu estilo.",
      valueEn: "",
    },
    {
      key: "email_order_subject",
      valueEs: "Gracias por tu compra en Chilate",
      valueEn: "",
    },
    {
      key: "email_order_intro",
      valueEs: "¡Gracias por tu compra! Estos son los detalles de tu pedido:",
      valueEn: "",
    },
    {
      key: "email_order_outro",
      valueEs:
        "Te avisaremos cuando tu pedido esté en camino. ¡Gracias por elegir Chilate!",
      valueEn: "",
    },
    {
      key: "email_delivery_estimate",
      valueEs: "3 a 5 días hábiles",
      valueEn: "",
    },
  ];
  for (const c of content) {
    await prisma.siteContent.upsert({
      where: { key: c.key },
      update: {},
      create: c,
    });
  }

  // Producto de ejemplo con variantes talla/color.
  // Solo se crea si NO existe: así el seed es idempotente y no choca con
  // cambios hechos desde el panel (que recrean las variantes sin sku).
  const existing = await prisma.product.findUnique({
    where: { slug: "camiseta-basica" },
  });

  if (!existing) {
    await prisma.product.create({
      data: {
        slug: "camiseta-basica",
        nameEs: "Camiseta Básica",
        nameEn: "Basic Tee",
        descriptionEs: "Algodón 100%, corte regular.",
        descriptionEn: "100% cotton, regular fit.",
        priceUsd: 18.0,
        isPublished: true,
        categoryId: mujer.id,
        variants: {
          create: [
            {
              sku: "TEE-BLK-S",
              size: "S",
              color: "Negro",
              colorHex: "#111111",
              stock: 10,
            },
            {
              sku: "TEE-BLK-M",
              size: "M",
              color: "Negro",
              colorHex: "#111111",
              stock: 15,
            },
            {
              sku: "TEE-WHT-M",
              size: "M",
              color: "Blanco",
              colorHex: "#FFFFFF",
              stock: 8,
            },
            {
              sku: "TEE-WHT-L",
              size: "L",
              color: "Blanco",
              colorHex: "#FFFFFF",
              stock: 5,
            },
          ],
        },
      },
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
