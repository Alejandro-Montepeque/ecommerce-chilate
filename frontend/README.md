# Chilate — Frontend (React)

Aplicación web del ecommerce **Chilate**: tienda pública + panel de administración.
Construida con **React 18 + TypeScript + Vite + Tailwind CSS**, datos con
**TanStack Query**, estado del carrito con **Zustand**, formularios con
**react-hook-form + zod** y alertas con **SweetAlert2**. Se despliega en **Vercel**.

> Contexto general del proyecto y despliegue: [`../README.md`](../README.md) y
> [`../DEPLOYMENT.md`](../DEPLOYMENT.md). API: [`../backend/README.md`](../backend/README.md).

---

## Índice

- [Arranque rápido](#arranque-rápido)
- [Variables de entorno](#variables-de-entorno)
- [Scripts npm](#scripts-npm)
- [Estructura](#estructura)
- [Capa de datos (API + React Query)](#capa-de-datos-api--react-query)
- [Rutas y guards](#rutas-y-guards)
- [Sistema de diseño](#sistema-de-diseño)
- [Formularios y máscaras](#formularios-y-máscaras)
- [Internacionalización (i18n)](#internacionalización-i18n)

---

## Arranque rápido

```bash
cd frontend
cp .env.example .env.local     # VITE_API_URL=http://localhost:8080/api
npm install
npm run dev                    # http://localhost:5173
```

Requiere el backend corriendo (por defecto en `http://localhost:8080/api`).

---

## Variables de entorno

| Variable       | Obligatoria | Descripción                                                                                                          |
| -------------- | :---------: | -------------------------------------------------------------------------------------------------------------------- |
| `VITE_API_URL` |     ✅      | URL base de la API, incluyendo `/api`. En local: `http://localhost:8080/api`. En prod: la URL de Cloud Run + `/api`. |

> Vite **incrusta** las variables `VITE_*` en el build. No son secretas (aquí solo
> hay una URL pública) y, si cambian, hay que **volver a construir/desplegar**.

---

## Scripts npm

| Script                            | Qué hace                                 |
| --------------------------------- | ---------------------------------------- |
| `npm run dev`                     | Servidor de desarrollo (Vite, con HMR).  |
| `npm run build`                   | `tsc -b && vite build` → genera `dist/`. |
| `npm run preview`                 | Sirve el build de producción localmente. |
| `npm run typecheck`               | `tsc --noEmit`.                          |
| `npm run lint` / `npm run format` | ESLint / Prettier.                       |

---

## Estructura

```
src/
├── main.tsx            punto de entrada (providers: Router, Query, Auth, i18n, fuente)
├── App.tsx             definición de rutas
├── index.css           base Tailwind + tema de SweetAlert2 + scrollbar
├── lib/
│   ├── api.ts          cliente axios (token, manejo de errores, base URL)
│   ├── queryClient.ts  configuración de TanStack Query
│   ├── alerts.ts       wrapper de SweetAlert2 (toasts, modales, confirmaciones)
│   └── masks.ts        máscaras de entrada (tarjeta, MM/AA, CVC, teléfono)
├── context/
│   └── AuthContext.tsx sesión, usuario y rol; expone can/isStaff, signIn/signOut
├── features/           un directorio por dominio, cada uno con:
│   │                     *.api.ts     → llamadas HTTP (usa lib/api)
│   │                     *.queries.ts → hooks de TanStack Query (cache, mutaciones)
│   ├── auth/           permissions.ts (matriz de permisos por rol)
│   ├── products/       ProductCard, price.ts, image.ts, subcategory.ts, upload.ts
│   ├── cart/           store Zustand del carrito
│   ├── checkout|orders/ checkout y órdenes
│   ├── wishlist/       lista de deseos
│   ├── discounts/      DiscountBanner (cuenta regresiva) + queries
│   ├── catalog/        categorías, colores, tallas (admin)
│   ├── banners/  content/  logo/textos editables
├── components/
│   ├── ui/             Button, Input, Select, Badge, Spinner, Logo, icons
│   └── layout/         StoreLayout (tienda) y AdminLayout (panel), responsive
├── pages/
│   ├── store/          Home, Shop, Cart, Checkout, ThankYou, Wishlist, Login
│   └── admin/          Dashboard, Products(+Form), Catalogs, Discounts,
│                       Banners, Content, Users
├── routes/             RequireStaff, RequireAdmin, RequireRole (guards de ruta)
├── i18n/               config de react-i18next + locales/{es,en}.json
└── types/              tipos compartidos (Product, User, Role, etc.)
```

**Convención por feature:** la lógica HTTP vive en `*.api.ts` y los hooks de datos
en `*.queries.ts`. Los componentes consumen los hooks, nunca `axios` directo.

---

## Capa de datos (API + React Query)

- `lib/api.ts` centraliza **axios**: añade el token JWT a cada petición, normaliza
  errores y limpia la sesión ante un `401`. Su base es `VITE_API_URL`.
- **TanStack Query** maneja cache, revalidación y estados de carga/error. Las
  _queries keys_ están centralizadas por feature. Las mutaciones invalidan las
  queries afectadas para refrescar la UI automáticamente.
- Ejemplo: `useDiscountBanner()` consulta `/discounts/banner` cada 60 s para
  encender/apagar el banner de la tienda sin recargar.

---

## Rutas y guards

Definidas en `App.tsx`:

- **Tienda** (`StoreLayout`): `/`, `/tienda`, `/carrito`, `/checkout`,
  `/pedido-confirmado`, `/favoritos`, `/login`.
- **Panel** (`/admin`, `AdminLayout`): protegido por `RequireStaff`. Dentro, cada
  sección usa `RequireRole` según el permiso:
  - Productos, Catálogos y Descuentos → `ADMIN`, `CATALOG`.
  - Banners y Contenido → `ADMIN`, `MAINTENANCE`.
  - Usuarios → `RequireAdmin` (solo `ADMIN`).

Los guards son **espejo** de los del backend (fuente de verdad). Definición de
permisos en `features/auth/permissions.ts`.

---

## Sistema de diseño

- **Paleta boutique**: **rosa palo** (marca) + **salvia** (acento) sobre neutros
  cálidos. Definida en `tailwind.config.js` (`brand`, `sage`, y `zinc` sobrescrito
  a tonos cálidos) y `index.css`.
- **Tipografía**: **Nunito** (redondeada), instalada por npm
  (`@fontsource-variable/nunito`) e importada en `main.tsx`. Sin CDNs.
- **Primitivos** (`components/ui`): `Button` (variantes `primary`, `secondary`,
  `sage`, `ghost`, `danger`, `inverted`; tamaños `sm/md/lg`; forma pill), `Input`,
  `Select`, `Badge`, `Spinner`, `Logo`, `icons`.
- **Responsive**: header con menú hamburguesa en móvil/tablet, panel admin con
  sidebar deslizable, tablas con scroll horizontal, tarjetas y grids fluidos.
- **Alertas/modales**: `lib/alerts.ts` envuelve SweetAlert2 con el tema de la marca:
  `success/info/warn` (toasts), `error/successModal` (modales), `confirm` y
  `confirmDanger` (confirmaciones; la segunda con botón rojo para eliminar).

---

## Formularios y máscaras

- **react-hook-form + zod** para validación declarativa (`zodResolver`).
- `lib/masks.ts` aplica máscaras sin dependencias externas:
  - Tarjeta → `#### #### #### ####`
  - Vencimiento → `MM/AA` (mes 01-12; el año debe ser del próximo año en adelante)
  - CVC → 3-4 dígitos
  - Teléfono → `####-####` (8 dígitos)
- En el checkout se combinan con `setValue` para mantener el valor formateado
  sincronizado con el formulario, y con `inputMode="numeric"` para teclado numérico
  en móvil.

---

## Internacionalización (i18n)

- `react-i18next`; textos en `src/i18n/locales/es.json` y `en.json`.
- El idioma se cambia desde el header (ES/EN). El contenido editable de la tienda
  (banners, textos, correos) es bilingüe y vive en la base de datos.

---

## Build y despliegue (Vercel)

- `npm run build` genera `dist/` (estático).
- `vercel.json` ya define el build, el `outputDirectory` y el _rewrite_ de la SPA
  (todas las rutas → `index.html`).
- En Vercel: **Root Directory = `frontend`** y variable **`VITE_API_URL`** con la
  URL de Cloud Run + `/api`. Detalle completo en [`../DEPLOYMENT.md`](../DEPLOYMENT.md).
