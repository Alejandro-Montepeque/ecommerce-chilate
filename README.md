# Chilate — Ecommerce de ropa y accesorios

**Chilate** es una tienda en línea de ropa y accesorios, **autogestionable** (el
administrador edita banners, textos, logo, catálogos y precios sin tocar código),
**bilingüe** (español / inglés), con precios en **USD**, panel de administración,
manejo de **roles**, **lista de deseos**, **descuentos programados** con banner de
cuenta regresiva, envío de **correos** y una **pasarela de pago simulada**.

Es un **monorepo** con dos aplicaciones independientes (`frontend/` y `backend/`)
que se despliegan por separado.

> Para el paso a paso de despliegue y todas las variables de entorno, ver
> [`DEPLOYMENT.md`](./DEPLOYMENT.md). Cada app tiene además su propio README con
> el detalle técnico: [`backend/README.md`](./backend/README.md) y
> [`frontend/README.md`](./frontend/README.md).

---

## Índice

- [Funcionalidades](#funcionalidades)
- [Stack y arquitectura](#stack-y-arquitectura)
- [Roles y permisos](#roles-y-permisos)
- [Estructura del monorepo](#estructura-del-monorepo)
- [Desarrollo local](#desarrollo-local)
- [Despliegue](#despliegue)
- [Diseño e idioma](#diseño-e-idioma)
- [Seguridad](#seguridad-y-buenas-prácticas)

---

## Funcionalidades

**Tienda (público / clientes)**

- Catálogo con **variantes por talla y color** (cada combinación tiene su propio
  stock y precio opcional), selección de color con muestras y de talla con botones.
- Navegación jerárquica **Categoría › Subcategoría**: las categorías (Camisas,
  Pantalones, Zapatos, Accesorios…) son un catálogo editable; la subcategoría es
  fija (**Hombre / Mujer / Unisex**). La tienda filtra por ambas.
- **Descuentos programados**: precio rebajado automático dentro del rango de fechas
  y un **banner de cuenta regresiva** que anuncia el próximo descuento y avisa
  cuando ya está activo (solo aparece si hay un descuento real).
- **Lista de deseos** (wishlist): el corazón es visible para todos; si un invitado
  intenta guardar, se le invita a iniciar sesión.
- **Carrito** persistente (Zustand) y **checkout** con pasarela simulada, con
  **máscaras** de teléfono, número de tarjeta, MM/AA y CVC.
- Al comprar, pantalla de **agradecimiento** con tiempo estimado de entrega y aviso
  de correo enviado.
- **Bilingüe ES/EN** y precios en **USD**.

**Panel de administración (`/admin`)**

- **Productos**: alta/edición con matriz de variantes talla×color, stock, precio,
  imagen, categoría y subcategoría; publicar/despublicar.
- **Catálogos**: gestión de **categorías, colores y tallas** desde la interfaz.
- **Descuentos**: programación por producto con fecha de inicio/fin (solo a partir
  del día siguiente).
- **Banners** y **Contenido**: textos de la landing, footer, **logo** y **textos de
  los correos**, todo editable y bilingüe.
- **Usuarios**: creación de usuarios internos y cambio de rol (solo ADMIN).

**Transversales**

- **Autogestión total** del contenido visible de la tienda.
- **Correos** por Gmail SMTP: bienvenida al registrarse y confirmación de compra con
  el detalle del pedido (los textos son editables desde el panel).
- **Imágenes** en Google Cloud Storage (bucket **privado**, servidas por un proxy
  del backend), con respaldo a base64 si GCS no está configurado.

---

## Stack y arquitectura

| Capa | Tecnología | Despliegue |
|------|------------|------------|
| Frontend | React 18 + TypeScript + Vite + Tailwind CSS + TanStack Query + Zustand | **Vercel** |
| Backend | NestJS 10 + TypeScript + Prisma | **Google Cloud Run** (Docker) |
| Base de datos | PostgreSQL | **Neon** (serverless) |
| Autenticación | JWT propio (bcrypt + Passport) | — |
| Imágenes | Google Cloud Storage (bucket privado + proxy) | GCP |
| Correos | Nodemailer + Gmail SMTP | — |

```
Navegador
   │  (HTTPS)
   ▼
Vercel  ──── React SPA ────►  Cloud Run (NestJS /api)  ──►  Neon (PostgreSQL)
                                     │
                                     ├──►  Google Cloud Storage (imágenes, privado)
                                     └──►  Gmail SMTP (correos)
```

**Sin CDNs de código:** todas las dependencias (incluidas Tailwind y la tipografía
Nunito, vía `@fontsource`) se instalan por npm y se compilan en el build.

---

## Roles y permisos

Un solo sistema de auth (JWT). Los permisos se aplican en el **backend** con guards
(`JwtAuthGuard` + `RolesGuard`), y el frontend los refleja para mostrar/ocultar
secciones. Definición espejo en `frontend/src/features/auth/permissions.ts`.

| Rol | Puede |
|-----|-------|
| **Invitado** | Navegar y comprar sin cuenta. |
| **CUSTOMER** | Todo lo anterior + wishlist y sus propias órdenes. Es el rol por defecto al registrarse. |
| **CATALOG** | Panel: productos, catálogos (categorías/colores/tallas) y descuentos. |
| **MAINTENANCE** | Panel: banners y contenido (landing, footer, logo, textos de correo). |
| **ADMIN** | Todo, incluido usuarios y órdenes. |

Reglas de negocio importantes:

- El **registro público** solo crea `CUSTOMER`. Los usuarios internos
  (ADMIN/MAINTENANCE/CATALOG) **solo los crea un ADMIN**.
- Un ADMIN **no puede quitarle el rol de administrador a otro ADMIN**.
- MAINTENANCE **no** tiene acceso a la sección de usuarios.

---

## Estructura del monorepo

```
ecommerce-chilate/
├── docker-compose.yml         desarrollo local (db + api + web)
├── DEPLOYMENT.md              guía de despliegue paso a paso
├── README.md                  este archivo
│
├── backend/                   API NestJS  →  Cloud Run   (ver backend/README.md)
│   ├── src/
│   │   ├── main.ts            bootstrap: CORS, prefijo /api, validación, body limit
│   │   ├── app.module.ts
│   │   ├── config/            validación de variables de entorno (falla al arranque)
│   │   ├── prisma/            PrismaService (módulo global)
│   │   ├── common/            guards (JWT, roles), decoradores (@Roles, @CurrentUser)
│   │   ├── auth/              registro/login JWT, estrategia, DTOs
│   │   ├── users/             gestión de usuarios y roles (solo ADMIN)
│   │   ├── products/          catálogo + variantes + subcategoría (CRUD)
│   │   ├── categories/        catálogo de categorías (editable)
│   │   ├── colors/  sizes/    catálogos de colores y tallas (editables)
│   │   ├── collections/       colecciones
│   │   ├── discounts/         descuentos programados + banner (público)
│   │   ├── wishlist/          lista de deseos (por usuario)
│   │   ├── banners/           banners de la landing
│   │   ├── content/           textos bilingües (landing, footer, correos)
│   │   ├── orders/            checkout, inventario, órdenes
│   │   ├── payments/          pasarela SIMULADA
│   │   ├── mail/              correos (Gmail SMTP)
│   │   └── uploads/           subida a GCS + proxy de imágenes
│   ├── prisma/
│   │   ├── schema.prisma      modelo de datos
│   │   └── seed.ts            datos iniciales + usuario admin
│   ├── Dockerfile             imagen de producción (Cloud Run)
│   ├── Dockerfile.dev         imagen de desarrollo (docker-compose)
│   └── .env.example
│
└── frontend/                  App React  →  Vercel   (ver frontend/README.md)
    ├── src/
    │   ├── lib/               api.ts (axios + token), alerts.ts (SweetAlert2), masks.ts
    │   ├── context/           AuthContext (sesión + rol)
    │   ├── features/          por dominio: *.api.ts (servicio HTTP) + *.queries.ts (hooks)
    │   │                      auth, products, cart, checkout(orders), content,
    │   │                      banners, catalog, wishlist, discounts
    │   ├── components/ui/      Button, Input, Select, Badge, Spinner, Logo, icons
    │   ├── components/layout/  StoreLayout (tienda) y AdminLayout (panel), responsive
    │   ├── pages/store/        Home, Shop, Cart, Checkout, ThankYou, Wishlist, Login
    │   ├── pages/admin/        Dashboard, Products(+Form), Catalogs, Discounts,
    │   │                       Banners, Content, Users
    │   ├── routes/             RequireStaff, RequireAdmin, RequireRole (guards)
    │   ├── i18n/               config + locales es/en
    │   └── types/
    ├── tailwind.config.js      paleta (rosa palo + salvia) y tema
    ├── vercel.json
    └── .env.example
```

---

## Desarrollo local

Dos formas de levantarlo. Elige una.

### Opción A — Docker Compose (recomendada, todo en un comando)

Requisito: Docker Desktop. Desde la raíz:

```bash
docker compose up --build
```

Levanta tres contenedores: **Postgres**, el **backend** (crea tablas con
`prisma db push`, siembra datos y arranca en `http://localhost:8080/api`) y el
**frontend** (`http://localhost:5173`).

- Detener: `Ctrl+C` o `docker compose down`.
- Si cambiaste dependencias o el esquema: `docker compose up --build -V`
  (recrea `node_modules`/`dist` internos del contenedor).
- Correos e imágenes: crea un `.env` en la raíz con `GMAIL_USER`,
  `GMAIL_APP_PASSWORD` y coloca el JSON de la service account de GCP (opcional; sin
  ellos, el resto funciona igual).

> Docker Compose es **solo para desarrollo local**. En producción el backend va a
> Cloud Run, el frontend a Vercel y la base a Neon; los archivos `*.dev` y
> `docker-compose.yml` no se usan en el despliegue.

### Opción B — Manual

**1. Base de datos (Neon).** Crea un proyecto en [neon.tech](https://neon.tech) y
copia la connection string *pooled* con `?sslmode=require`.

**2. Backend.**

```bash
cd backend
cp .env.example .env          # pega DATABASE_URL y define JWT_SECRET
npm install
npx prisma db push            # crea las tablas
npm run prisma:seed           # datos + admin@chilate.com / Admin123!
npm run start:dev             # http://localhost:8080/api
```

**3. Frontend.**

```bash
cd frontend
cp .env.example .env.local    # VITE_API_URL=http://localhost:8080/api
npm install
npm run dev                   # http://localhost:5173
```

Entra con **`admin@chilate.com` / `Admin123!`** para ver el panel `/admin`.
Pasarela simulada: una tarjeta que **termina en dígito par** se aprueba (ej.
`4242 4242 4242 4242`).

---

## Despliegue

Resumen (el detalle completo, con todas las variables y el orden recomendado, está
en [`DEPLOYMENT.md`](./DEPLOYMENT.md)):

- **Backend → Google Cloud Run**: `gcloud run deploy --source .` desde `backend/`.
  Variables clave: `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGINS` (dominio de Vercel),
  `PUBLIC_API_URL` (URL de Cloud Run + `/api`), `GCS_BUCKET`, `GMAIL_USER`,
  `GMAIL_APP_PASSWORD`, `TZ=America/El_Salvador`. `PORT` la inyecta Cloud Run.
- **Frontend → Vercel**: Root Directory `frontend`, variable `VITE_API_URL` con la
  URL de Cloud Run + `/api`.
- **Base → Neon**: aplica el esquema una vez con `npx prisma db push` y el seed.

---

## Diseño e idioma

- **Estética boutique**: paleta **rosa palo** (marca) + **salvia** (acento) sobre
  neutros cálidos, tipografía **Nunito** (redondeada, instalada por npm).
  Definida en `frontend/tailwind.config.js` e `index.css`.
- **Responsive** en móvil, tablet y laptop: header con menú hamburguesa, panel admin
  con sidebar deslizable, tablas con scroll horizontal.
- **Alertas y modales** con SweetAlert2 re-tematizado (toasts de notificación,
  modales de confirmación).
- **i18n** con `react-i18next`; textos en `frontend/src/i18n/locales/{es,en}.json`.

---

## Seguridad y buenas prácticas

- Config de entorno **validada al arranque**: si falta `DATABASE_URL` o `JWT_SECRET`,
  el backend no inicia.
- Contraseñas con **bcrypt**; autorización con **JWT + guards por rol** en el backend.
- El **bucket de GCS es privado**: las imágenes se sirven por un proxy del backend,
  nunca se expone el bucket a Internet.
- **Secretos fuera de git**: `backend/.env`, el JSON de la service account
  (`*-credentials.json`, `ecommercechilate-*.json`) y las claves de Gmail no se
  versionan (ver `.gitignore`). En producción, usa **Secret Manager** en Cloud Run.
- **Calidad**: ESLint + Prettier en ambos proyectos (`npm run lint`, `npm run format`).

---

## Pasar a pagos reales

Reemplaza `PaymentsService.charge()` en
`backend/src/payments/payments.service.ts` por una integración real (Wompi, Stripe,
etc.) manteniendo la misma firma. El resto del flujo de checkout no cambia.
