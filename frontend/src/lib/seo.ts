import { useEffect } from "react";

interface SeoOptions {
  title: string;
  description?: string;
  image?: string;
}

// Crea o actualiza una etiqueta <meta> en el <head> sin duplicarla.
function upsertMeta(attr: "name" | "property", key: string, content: string) {
  const selector = `meta[${attr}="${key}"]`;
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

// Ajusta el título y las metaetiquetas (description + Open Graph) de la página.
// Al ser una SPA, cada vista llama a useSeo con sus propios valores.
export function useSeo({ title, description, image }: SeoOptions) {
  useEffect(() => {
    const fullTitle = title ? `${title} · Chilate` : "Chilate";
    document.title = fullTitle;

    upsertMeta("property", "og:title", fullTitle);
    upsertMeta("property", "og:type", "website");
    if (description) {
      upsertMeta("name", "description", description);
      upsertMeta("property", "og:description", description);
    }
    if (image) upsertMeta("property", "og:image", image);
  }, [title, description, image]);
}
