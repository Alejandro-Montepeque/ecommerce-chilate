// Claves de contenido editable, agrupadas por sección (para las pestañas del
// panel). Cada una trae su texto por defecto, que el editor prellena cuando
// aún no hay valor guardado (para que nunca se vea en blanco).
export type ContentGroup = "brand" | "footer" | "email";

export interface ContentKey {
  key: string;
  label: string;
  group: ContentGroup;
  multiline?: boolean;
  singleLang?: boolean; // true = un solo idioma (ej. textos de correo)
  defaultEs?: string;
  defaultEn?: string;
}

export const CONTENT_GROUPS: { id: ContentGroup; label: string }[] = [
  { id: "brand", label: "Marca" },
  { id: "footer", label: "Footer" },
  { id: "email", label: "Correos" },
];

export const CONTENT_KEYS: ContentKey[] = [
  // Marca / Hero
  {
    key: "hero_title",
    label: "Título del hero",
    group: "brand",
    defaultEs: "Estilo que te representa",
    defaultEn: "Style that speaks for you",
  },
  {
    key: "hero_subtitle",
    label: "Subtítulo del hero",
    group: "brand",
    multiline: true,
    defaultEs: "Ropa y accesorios seleccionados con cariño",
    defaultEn: "Clothing and accessories, curated with care",
  },

  // Footer
  {
    key: "footer_tagline",
    label: "Descripción",
    group: "footer",
    multiline: true,
    defaultEs: "Ropa y accesorios salvadoreños, con estilo propio.",
    defaultEn: "Salvadoran clothing and accessories, with its own style.",
  },
  {
    key: "footer_shop_title",
    label: "Título columna Tienda",
    group: "footer",
    defaultEs: "Tienda",
    defaultEn: "Shop",
  },
  {
    key: "footer_help_title",
    label: "Título columna Ayuda",
    group: "footer",
    defaultEs: "Ayuda",
    defaultEn: "Help",
  },
  {
    key: "footer_help_shipping",
    label: "Texto Envíos",
    group: "footer",
    defaultEs: "Envíos",
    defaultEn: "Shipping",
  },
  {
    key: "footer_help_returns",
    label: "Texto Cambios",
    group: "footer",
    defaultEs: "Cambios y devoluciones",
    defaultEn: "Returns and exchanges",
  },
  {
    key: "footer_help_contact",
    label: "Texto Contacto",
    group: "footer",
    defaultEs: "Contacto",
    defaultEn: "Contact",
  },
  {
    key: "footer_contact_title",
    label: "Título columna Contacto",
    group: "footer",
    defaultEs: "Contacto",
    defaultEn: "Contact",
  },
  {
    key: "footer_email",
    label: "Email",
    group: "footer",
    defaultEs: "hola@chilate.com",
    defaultEn: "hola@chilate.com",
  },
  { key: "footer_phone", label: "Teléfono", group: "footer" },
  {
    key: "footer_location",
    label: "Ubicación",
    group: "footer",
    defaultEs: "San Salvador, SV",
    defaultEn: "San Salvador, SV",
  },
  {
    key: "footer_rights",
    label: "Pie (derechos)",
    group: "footer",
    defaultEs: "Todos los derechos reservados",
    defaultEn: "All rights reserved",
  },

  // Correos (un solo idioma; los datos del producto se arman solos)
  {
    key: "email_welcome_subject",
    label: "Bienvenida · asunto",
    group: "email",
    singleLang: true,
    defaultEs: "¡Bienvenido a Chilate!",
  },
  {
    key: "email_welcome_body",
    label: "Bienvenida · mensaje",
    group: "email",
    multiline: true,
    singleLang: true,
    defaultEs:
      "Gracias por crear tu cuenta en Chilate. Nos alegra tenerte aquí. Explora nuestra tienda y encuentra tu estilo.",
  },
  {
    key: "email_order_subject",
    label: "Compra · asunto",
    group: "email",
    singleLang: true,
    defaultEs: "Gracias por tu compra en Chilate",
  },
  {
    key: "email_order_intro",
    label: "Compra · texto de introducción",
    group: "email",
    multiline: true,
    singleLang: true,
    defaultEs: "¡Gracias por tu compra! Estos son los detalles de tu pedido:",
  },
  {
    key: "email_order_outro",
    label: "Compra · texto de cierre",
    group: "email",
    multiline: true,
    singleLang: true,
    defaultEs:
      "Te avisaremos cuando tu pedido esté en camino. ¡Gracias por elegir Chilate!",
  },
  {
    key: "email_delivery_estimate",
    label: "Compra · tiempo estimado de entrega",
    group: "email",
    singleLang: true,
    defaultEs: "3 a 5 días hábiles",
  },
];
