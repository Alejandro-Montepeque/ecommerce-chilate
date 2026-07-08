# Chilate — Backend (API NestJS)

API REST del ecommerce **Chilate**. Construida con **NestJS 10 + TypeScript +
Prisma** sobre **PostgreSQL (Neon)**. Se despliega como imagen Docker en **Google
Cloud Run**. Todas las rutas cuelgan del prefijo **`/api`**.

> Contexto general del proyecto y despliegue: [`../README.md`](../README.md) y
> [`../DEPLOYMENT.md`](../DEPLOYMENT.md).

---

## Índice

- [Arranque rápido](#arranque-rápido)
- [Variables de entorno](#variables-de-entorno)
- [Scripts npm](#scripts-npm)
- [Base de datos (Prisma)](#base-de-datos-prisma)
- [Módulos](#módulos)
- [Referencia de endpoints](#referencia-de-endpoints)
- [Autenticación y roles](#autenticación-y-roles)
- [Imágenes (GCS + proxy)](#imágenes-gcs--proxy)
- [Correos](#correos)
- [Pasarela de pago simulada](#pasarela-de-pago-simulada)

---

## Arranque rápido

```bash
cd backend
cp .env.example .env          # define DATABASE_URL y JWT_SECRET como mínimo
npm install
npx prisma db push            # crea las tablas en la BD
npm run prisma:seed           # datos base + admin@chilate.com / Admin123!
npm run start:dev             # http://localhost:8080/api  (watch mode)
```

Requisitos: Node 20+, una base PostgreSQL (Neon o local). Con Docker Compose desde
la raíz del monorepo esto se hace solo.

---

## Variables de entorno

Se validan **al arranque** (`src/config/env.validation.ts`): si falta una
obligatoria, la app no inicia.

| Variable | Obligatoria | Default | Descripción |
|----------|:-----------:|---------|-------------|
| `DATABASE_URL` | ✅ | — | Cadena de conexión de Neon (*pooled*, `?sslmode=require`). |
| `JWT_SECRET` | ✅ | — | Secreto para firmar los JWT (largo y aleatorio). |
| `JWT_EXPIRES_IN` | — | `7d` | Vigencia del token. |
| `CORS_ORIGINS` | — | `http://localhost:5173` | Orígenes permitidos, separados por coma (dominio de Vercel en prod). |
| `PORT` | — | `8080` | Puerto. **Cloud Run lo inyecta**; no lo definas allí. |
| `TZ` | recomendada | — | `America/El_Salvador`. La regla de descuentos usa la hora local del servidor. |
| `GCS_BUCKET` | para imágenes | — | Bucket de Google Cloud Storage. Si falta, se usa base64. |
| `GCS_PROJECT_ID` | — | — | Proyecto GCP (si se omite, se infiere de las credenciales). |
| `PUBLIC_API_URL` | recomendada | `http://localhost:8080/api` | URL pública del backend; se usa para construir las URLs de imagen (proxy). |
| `GMAIL_USER` | para correos | — | Cuenta Gmail remitente. |
| `GMAIL_APP_PASSWORD` | para correos | — | Contraseña de aplicación (16 caracteres). |
| `GOOGLE_APPLICATION_CREDENTIALS` | solo local | — | Ruta al JSON de la service account. En Cloud Run **no se usa** (identidad del servicio). |

---

## Scripts npm

| Script | Qué hace |
|--------|----------|
| `npm run start:dev` | Servidor en modo watch (recarga en caliente). |
| `npm run build` | Compila a `dist/` (`nest build`). |
| `npm run start:prod` | Ejecuta `dist/main.js` (lo que corre en Cloud Run). |
| `npm run prisma:generate` | Genera el cliente Prisma. |
| `npm run prisma:migrate` | Crea/aplica migraciones en desarrollo. |
| `npm run prisma:deploy` | Aplica migraciones en producción. |
| `npm run prisma:seed` | Ejecuta `prisma/seed.ts` (admin + catálogos + producto demo). |
| `npm run typecheck` | `tsc --noEmit`. |
| `npm run lint` / `npm run format` | ESLint / Prettier. |

---

## Base de datos (Prisma)

El esquema está en `prisma/schema.prisma`. Entidades principales:

- **User** (`role`: CUSTOMER · MAINTENANCE · CATALOG · ADMIN) y **WishlistItem**.
- **Product** con `subcategory` (enum **HOMBRE/MUJER/UNISEX**), **ProductVariant**
  (talla×color con stock y precio opcional) y **ProductImage**.
- **Category**, **Collection**, y los catálogos **Size** y **Color** (editables).
- **Discount** (porcentaje + rango de fechas por producto).
- **Banner** y **SiteContent** (contenido bilingüe editable de la landing/correos).
- **Order** + **OrderItem** (pedidos e ítems, con precios "congelados").

Flujos:

- **Desarrollo:** `npx prisma db push` sincroniza el esquema sin migraciones
  (es lo que hace el contenedor de dev). Ideal para iterar rápido.
- **Producción:** aplica el esquema contra Neon una vez —`prisma db push` o, si
  prefieres migraciones versionadas, `prisma migrate deploy`— y corre el seed.
- El **seed es idempotente**: no pisa datos existentes; crea el admin y los
  catálogos base solo si faltan.

> La imagen de producción **no** ejecuta `db push` ni el seed automáticamente:
> ese paso se hace manualmente (ver `../DEPLOYMENT.md`).

---

## Módulos

Cada módulo NestJS es independiente (controlador + servicio + DTOs cuando aplica):

| Módulo | Responsabilidad |
|--------|-----------------|
| `config/` | Validación tipada de variables de entorno. |
| `prisma/` | `PrismaService` global (acceso a la BD). |
| `common/` | Guards (`JwtAuthGuard`, `RolesGuard`, `OptionalJwtGuard`) y decoradores (`@Roles`, `@CurrentUser`). |
| `auth/` | Registro, login, `/me`. Emite JWT y dispara el correo de bienvenida. |
| `users/` | Alta de usuarios internos y cambio de rol (solo ADMIN). |
| `products/` | Catálogo y variantes; incluye el descuento activo al listar. |
| `categories/`, `colors/`, `sizes/` | Catálogos editables. |
| `collections/` | Colecciones de productos. |
| `discounts/` | Descuentos programados + endpoint público del banner. |
| `wishlist/` | Lista de deseos por usuario autenticado. |
| `banners/`, `content/` | Contenido editable de la landing, footer, logo y textos de correo. |
| `orders/` | Checkout, control de inventario y consulta de órdenes. |
| `payments/` | Pasarela **simulada** (aísla el cobro del checkout). |
| `mail/` | Envío de correos (Gmail SMTP) con textos editables. |
| `uploads/` | Subida a GCS y proxy de imágenes del bucket privado. |

---

## Referencia de endpoints

Prefijo: `/api`. "Público" = sin token. Los demás requieren `Authorization: Bearer <JWT>`.

### Auth
| Método | Ruta | Acceso | Descripción |
|--------|------|--------|-------------|
| POST | `/auth/register` | Público | Crea un `CUSTOMER`, devuelve token; envía correo de bienvenida. |
| POST | `/auth/login` | Público | Devuelve token + datos del usuario. |
| GET | `/auth/me` | Autenticado | Usuario actual. |

### Usuarios (solo ADMIN)
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/users` | Lista usuarios. |
| POST | `/users` | Crea usuario interno (ADMIN/MAINTENANCE/CATALOG). |
| PATCH | `/users/:id/role` | Cambia el rol (no permite degradar a otro ADMIN). |

### Productos
| Método | Ruta | Acceso |
|--------|------|--------|
| GET | `/products` | Público (publicados, con descuento activo). |
| GET | `/products/:slug` | Público (detalle). |
| GET | `/products/admin/all` | ADMIN, CATALOG. |
| POST | `/products` | ADMIN, CATALOG. |
| PUT | `/products/:id` | ADMIN, CATALOG. |
| DELETE | `/products/:id` | ADMIN, CATALOG. |

### Catálogos — categorías / colores / tallas
| Método | Ruta | Acceso |
|--------|------|--------|
| GET | `/categories` · `/colors` · `/sizes` | Público. |
| POST · PUT · DELETE | `/categories/:id` · `/colors/:id` · `/sizes/:id` | ADMIN, CATALOG. |

### Descuentos
| Método | Ruta | Acceso |
|--------|------|--------|
| GET | `/discounts/banner` | Público (descuento vigente o próximo, para el banner). |
| GET | `/discounts` | ADMIN, CATALOG. |
| POST | `/discounts` | ADMIN, CATALOG (solo a partir del día siguiente). |
| DELETE | `/discounts/:id` | ADMIN, CATALOG. |

### Wishlist (autenticado)
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/wishlist` | Productos favoritos del usuario. |
| POST | `/wishlist/:productId` | Agrega a favoritos. |
| DELETE | `/wishlist/:productId` | Quita de favoritos. |

### Banners y contenido
| Método | Ruta | Acceso |
|--------|------|--------|
| GET | `/banners` | Público (activos). |
| GET | `/banners/admin/all` | ADMIN, MAINTENANCE. |
| POST · PUT · DELETE | `/banners/:id` | ADMIN, MAINTENANCE. |
| GET | `/content` | Público (textos de la landing/footer/correos). |
| PUT | `/content/:key` | ADMIN, MAINTENANCE. |

### Órdenes
| Método | Ruta | Acceso |
|--------|------|--------|
| POST | `/orders/checkout` | Público (auth opcional). Descuenta stock, cobra (simulado) y envía el correo de compra. |
| GET | `/orders/me` | Autenticado (mis órdenes). |
| GET | `/orders` | ADMIN (todas). |

### Uploads (imágenes)
| Método | Ruta | Acceso |
|--------|------|--------|
| POST | `/uploads` | Staff (ADMIN, MAINTENANCE, CATALOG). Sube al bucket privado y devuelve la URL del proxy. |
| GET | `/uploads/file/*` | Público. Sirve el objeto desde el bucket privado. |

---

## Autenticación y roles

- **JWT propio**: al hacer login/registro se emite un token (payload con `sub`,
  `email`, `role`). El frontend lo guarda y lo envía en `Authorization: Bearer`.
- **Guards**: `JwtAuthGuard` valida el token; `RolesGuard` + el decorador
  `@Roles(...)` restringen por rol; `OptionalJwtGuard` permite rutas que funcionan
  con o sin sesión (checkout).
- La autorización vive en el **backend**; el frontend solo refleja los permisos.

---

## Imágenes (GCS + proxy)

- Las imágenes de producto se suben a un **bucket privado** de Google Cloud Storage.
- El bucket **nunca** se expone a Internet: `POST /api/uploads` devuelve una URL del
  **proxy** del backend (`/api/uploads/file/<objeto>`) que transmite el archivo.
- Credenciales: en **Cloud Run** se usa la *service account* del servicio (dale el
  rol `Storage Object Admin` sobre el bucket, sin archivo de clave); en **local** se
  usa `GOOGLE_APPLICATION_CREDENTIALS` apuntando al JSON.
- Si `GCS_BUCKET` no está definido, `uploads` responde 503 y el frontend guarda la
  imagen como **base64** (útil para desarrollo sin credenciales).

---

## Correos

- `MailService` usa **Nodemailer + Gmail SMTP**. Se activa solo si están
  `GMAIL_USER` y `GMAIL_APP_PASSWORD` (contraseña de aplicación); si faltan, el
  envío se **omite** sin romper el flujo.
- Correos: **bienvenida** al registrarse y **confirmación de compra** con el detalle
  (producto, precio unitario, total). Los **textos son editables** desde el panel
  (`content/`), con valores por defecto.

---

## Pasarela de pago simulada

`PaymentsService.charge()` simula el cobro: una tarjeta cuyo **último dígito es par**
se **aprueba**; impar se **rechaza**. El checkout (`orders/`) usa este servicio de
forma aislada.

Para ir a **pagos reales**, reemplaza `charge()` por una integración (Wompi, Stripe,
etc.) manteniendo la firma; el resto del flujo no cambia.
