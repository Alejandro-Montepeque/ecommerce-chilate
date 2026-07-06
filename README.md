# Chilate — Ecommerce de ropa y accesorios

Monorepo de una tienda autogestionable, bilingüe (ES/EN) y en USD, con panel de
administración, manejo de roles y pasarela de pagos simulada.

## Stack

| Capa | Tecnología | Despliegue |
|------|------------|------------|
| Frontend | React + TypeScript + Vite + Tailwind + TanStack Query | Vercel |
| Backend | NestJS + TypeScript + Prisma | Google Cloud Run (Docker) |
| Base de datos | PostgreSQL | Neon (serverless, tier gratis) |
| Auth | JWT propio (bcrypt + Passport) | — |

Sin CDNs: todas las dependencias (incluido Tailwind) se instalan por npm y se
compilan en el build. Tipografía del sistema, sin fuentes externas.

### Prácticas aplicadas
- **Limpio y consistente:** ESLint + Prettier configurados en ambos proyectos
  (`npm run lint`, `npm run format`).
- **Reutilizable:** capa de servicios por *feature* en el front (`features/*/*.api.ts`),
  hooks de datos con TanStack Query, y componentes UI compartidos (`components/ui`).
  En el back, módulos NestJS independientes con guards y decoradores reutilizables.
- **Escalable:** cache y estados de servidor con TanStack Query; backend modular
  con Prisma; config de entorno **validada al arranque** (la app no inicia si falta
  una variable); Cloud Run escala a cero y hacia arriba sin cambios de código.

## Estructura del monorepo

```
ecommerce-chilate/
├── docker-compose.yml        desarrollo local (db + api + web)
├── backend/                  API NestJS (se despliega en Cloud Run)
│   ├── src/
│   │   ├── main.ts           bootstrap, CORS, prefijo /api, validación
│   │   ├── app.module.ts
│   │   ├── config/           validación de variables de entorno
│   │   ├── prisma/           PrismaService + módulo global
│   │   ├── common/           guards (JWT, roles), decoradores
│   │   ├── auth/             registro/login JWT, estrategia, DTOs
│   │   ├── users/            gestión de usuarios y roles (solo ADMIN)
│   │   ├── products/         catálogo + variantes (CRUD)
│   │   ├── categories/
│   │   ├── collections/
│   │   ├── banners/          contenido editable de la landing
│   │   ├── content/          textos bilingües de la landing
│   │   ├── orders/           checkout, inventario, órdenes
│   │   └── payments/         pasarela SIMULADA
│   ├── prisma/
│   │   ├── schema.prisma     modelo de datos
│   │   └── seed.ts           datos iniciales + usuario admin
│   ├── Dockerfile            imagen de producción (Cloud Run)
│   ├── Dockerfile.dev        imagen de desarrollo (docker-compose)
│   └── .env.example
│
└── frontend/                 App React (se despliega en Vercel)
    ├── src/
    │   ├── lib/              api.ts (cliente HTTP + token), queryClient.ts
    │   ├── context/          AuthContext (sesión + rol)
    │   ├── features/         por dominio: cada uno con *.api.ts (servicio HTTP)
    │   │                     y *.queries.ts (hooks TanStack Query)
    │   │   ├── auth/  products/  banners/  content/  orders/  cart/
    │   ├── components/ui/    Button, Input, Spinner (reutilizables)
    │   ├── components/layout/ layouts tienda / admin
    │   ├── pages/store/      Home, Shop, Cart, Checkout, Login
    │   ├── pages/admin/      Dashboard, Products, Banners, Content
    │   ├── routes/           RequireStaff (guard del panel)
    │   ├── i18n/             config + locales es/en
    │   └── types/
    ├── eslint.config.js
    ├── vercel.json
    └── .env.example
```

## Roles

Tres perfiles, un solo sistema de auth (JWT):

- **Invitado** — navega y compra sin cuenta.
- **CUSTOMER** — cuenta opcional; ve sus propias órdenes.
- **MAINTENANCE / ADMIN** — gestiona catálogo, banners y contenido en `/admin`.

Al registrarse todos son `CUSTOMER`; el rol de staff se otorga con el seed o
por un ADMIN vía `PATCH /api/users/:id/role`. La seguridad se aplica en el
backend con guards (`JwtAuthGuard` + `RolesGuard`), no solo en el frontend.

---

## Desarrollo local

Hay dos formas de levantar el proyecto en tu máquina: con Docker (todo en uno) o
manualmente. Elige una.

### Opción A — Docker Compose (recomendada, todo en un comando)

Requisito: Docker Desktop instalado. Desde la raíz del proyecto:

```bash
docker compose up --build
```

Eso levanta tres contenedores: **Postgres**, el **backend** (crea las tablas,
siembra datos y arranca en `http://localhost:8080/api`) y el **frontend**
(`http://localhost:5173`). Para detener: `Ctrl+C`, o `docker compose down`
(añade `-v` para borrar también los datos de la BD).

> Esto es **solo para desarrollo local** y no interfiere con el despliegue: en
> producción el backend va a Cloud Run con `backend/Dockerfile`, el frontend a
> Vercel, y la base de datos a Neon. Los archivos `*.dev` y `docker-compose.yml`
> no se usan en producción.

### Opción B — Manual

#### 1. Base de datos (Neon)
1. Crea un proyecto gratis en [neon.tech](https://neon.tech).
2. Copia la connection string (usa la *pooled* con `?sslmode=require`).

#### 2. Backend
```bash
cd backend
cp .env.example .env          # pega DATABASE_URL y define JWT_SECRET
npm install
npx prisma migrate dev --name init   # crea las tablas
npm run prisma:seed                  # datos + admin@chilate.com / Admin123!
npm run start:dev                    # http://localhost:8080/api
```

#### 3. Frontend
```bash
cd frontend
cp .env.example .env.local     # VITE_API_URL=http://localhost:8080/api
npm install
npm run dev                    # http://localhost:5173
```

Entra con `admin@chilate.com` / `Admin123!` para ver el panel `/admin`.
Regla de la pasarela simulada: tarjeta que termina en dígito par = aprobada
(ej. `4242 4242 4242 4242`).

---

## Despliegue en producción

### Backend → Google Cloud Run
Requisitos: proyecto en GCP y `gcloud` instalado y autenticado.

```bash
cd backend

# 1. Habilitar servicios (una sola vez)
gcloud services enable run.googleapis.com cloudbuild.googleapis.com

# 2. Construir y desplegar (Cloud Build usa el Dockerfile)
gcloud run deploy chilate-api \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars "DATABASE_URL=postgresql://...,JWT_SECRET=...,CORS_ORIGINS=https://TU-APP.vercel.app"

# 3. Aplicar migraciones contra Neon (desde tu máquina, con la misma DATABASE_URL)
npx prisma migrate deploy
npm run prisma:seed   # opcional
```

Cloud Run inyecta `PORT` automáticamente (el server escucha ahí). El servicio
escala a cero: no pagas cuando nadie lo usa.

> Tip: guarda `DATABASE_URL` y `JWT_SECRET` en Secret Manager y pásalos con
> `--set-secrets` en lugar de `--set-env-vars` para no exponerlos.

### Frontend → Vercel
1. Sube el repo a GitHub.
2. En [vercel.com](https://vercel.com) importa el repo y define
   **Root Directory = `frontend`** (framework: Vite).
3. Variable de entorno: `VITE_API_URL = https://chilate-api-xxxxx.run.app/api`
   (la URL que devolvió Cloud Run).
4. Deploy. `vercel.json` ya maneja el rewrite de rutas de la SPA.
5. Actualiza `CORS_ORIGINS` en Cloud Run con el dominio final de Vercel.

---

## Ir a pagos reales
Reemplaza `PaymentsService.charge()` en `backend/src/payments/payments.service.ts`
por una integración con Wompi o Stripe, manteniendo la misma firma. El resto del
flujo de checkout no cambia.
```
