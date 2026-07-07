/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Marca principal: rosa palo / rosewood (boutique cálido).
        brand: {
          50: "#FBF2F2",
          100: "#F6E2E2",
          200: "#EDC9C9",
          300: "#E0A9A9",
          400: "#CE8A8C",
          500: "#BC7175",
          600: "#A85C60", // acción principal (contraste con blanco)
          700: "#8C4A4E",
          800: "#703C40",
          900: "#5E3437",
        },
        // Acento secundario: verde salvia.
        sage: {
          50: "#F4F6EF",
          100: "#E7ECDD",
          200: "#D0DBBF",
          300: "#B4C69E",
          400: "#9CAF88",
          500: "#829770",
          600: "#687C57",
          700: "#526145",
          800: "#434F39",
          900: "#384231",
        },
        // Neutros cálidos: sobrescribimos "zinc" (por defecto es frío) con una
        // escala taupe/greige. Así todo el sitio se vuelve cálido sin tocar
        // clase por clase en cada componente.
        zinc: {
          50: "#FBF8F5",
          100: "#F4EEE9",
          200: "#E8DED6",
          300: "#D8CABF",
          400: "#B7A79C",
          500: "#8E7D73",
          600: "#6E5F57",
          700: "#564A44",
          800: "#3D342F",
          900: "#2C2521",
        },
      },
      fontFamily: {
        // Sans cálida y redondeada instalada por npm (sin CDN).
        sans: [
          '"Nunito Variable"',
          "Nunito",
          "ui-rounded",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      borderRadius: {
        "2xl": "1.125rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        // Sombras suaves con tinte cálido (taupe) en vez de negro puro.
        card: "0 1px 2px rgb(94 52 55 / 0.05), 0 6px 20px -8px rgb(94 52 55 / 0.12)",
        "card-hover":
          "0 12px 34px -10px rgb(94 52 55 / 0.22), 0 4px 12px -6px rgb(94 52 55 / 0.12)",
        soft: "0 2px 10px rgb(94 52 55 / 0.08)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.25s ease-out",
      },
    },
  },
  plugins: [],
};
