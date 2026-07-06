import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import es from "./locales/es.json";
import en from "./locales/en.json";

i18n.use(initReactI18next).init({
  resources: { es: { translation: es }, en: { translation: en } },
  lng: "es",
  fallbackLng: "es",
  interpolation: { escapeValue: false },
});

export default i18n;

// Escoge el campo bilingüe correcto (nameEs / nameEn) según el idioma activo.
export function localized<T>(row: T, base: string, lang: string): string {
  const key = `${base}${lang === "en" ? "En" : "Es"}`;
  return ((row as Record<string, unknown>)[key] as string) ?? "";
}
