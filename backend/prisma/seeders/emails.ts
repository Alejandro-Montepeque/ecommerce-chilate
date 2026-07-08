import { PrismaClient } from "@prisma/client";

// Seeder: textos editables de los correos (bienvenida y compra). Idempotente.
// El envío usa el español; los textos se editan luego desde el panel.
export async function seedEmails(prisma: PrismaClient) {
  const content = [
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
}
