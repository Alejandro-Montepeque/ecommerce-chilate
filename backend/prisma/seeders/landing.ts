import { PrismaClient } from "@prisma/client";

// Seeder: textos editables de la landing y el footer (bilingües). Idempotente.
export async function seedLanding(prisma: PrismaClient) {
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
  ];
  for (const c of content) {
    await prisma.siteContent.upsert({
      where: { key: c.key },
      update: {},
      create: c,
    });
  }
}
