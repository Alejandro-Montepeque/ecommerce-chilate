# Guía de despliegue — Chilate

Arquitectura de producción:

| Capa | Servicio | Cómo se despliega |
|------|----------|-------------------|
| Frontend (React/Vite) | **Vercel** | Integración nativa de Git (deploy en cada push) |
| Backend (NestJS) | **Google Cloud Run** | GitHub Actions → Cloud Build (Docker) |
| Base de datos | **Neon** (Postgres serverless) | Prisma Migrate |
| Imágenes | **Google Cloud Storage** (bucket privado) | Servidas por proxy del backend |
| Correos | **Gmail SMTP** | Contraseña de aplicación |

---

## 1. Variables de entorno

### Backend (Cloud Run / secrets de GitHub)

| Variable | ¿Obligatoria? | Valor / ejemplo |
|----------|---------------|-----------------|
| `DATABASE_URL` | **Sí** | Cadena *pooled* de Neon + `?sslmode=require` |
| `JWT_SECRET` | **Sí** | Cadena larga y aleatoria (`openssl rand -base64 48`) |
| `JWT_EXPIRES_IN` | No (def. `7d`) | Va fijo en el workflow |
| `CORS_ORIGINS` | Recomendada | URL de Vercel, ej. `https://ecommerce-chilate.vercel.app` (varias separadas por coma, sin barra final) |
| `PUBLIC_API_URL` | Recomendada | URL de Cloud Run + `/api` |
| `GCS_BUCKET` | Para imágenes | Nombre del bucket |
| `GCS_PROJECT_ID` | No | ID del proyecto GCP |
| `GMAIL_USER` | Para correos | `tucorreo@gmail.com` |
| `GMAIL_APP_PASSWORD` | Para correos | Contraseña de aplicación (16 caracteres) |
| `TZ` | Recomendada | `America/El_Salvador` (va fijo en el workflow) |
| `PORT` | **No la definas** | Cloud Run la inyecta |
| `GOOGLE_APPLICATION_CREDENTIALS` | **Solo local** | Ruta al JSON de la service account. En Cloud Run se usa la identidad del servicio |

### Frontend (Vercel)

| Variable | ¿Obligatoria? | Valor |
|----------|---------------|-------|
| `VITE_API_URL` | **Sí** | URL de Cloud Run + `/api`. Se define en Vercel → Project → Environment Variables (Production). Se incrusta en el build. |

---

## 2. Base de datos — Neon (Prisma Migrate)

El esquema se maneja con **migraciones versionadas** (Prisma Migrate). Prisma
registra cada migración aplicada en su tabla `_prisma_migrations`, así no se
repiten. Los **seeders** se registran en la tabla `SeederLog` (cada uno se
ejecuta una sola vez).

1. Crea un proyecto en <https://neon.tech>. Copia la connection string (usa la
   *pooled*, con `-pooler`, y agrega `?sslmode=require`). La base por defecto se
   llama `neondb`.
2. **Primera vez, en local:** genera la migración inicial (crea `prisma/migrations/`):

   ```bash
   cd backend
   # apunta a una base de desarrollo o a Neon (host directo, sin -pooler, para DDL)
   export DATABASE_URL="postgresql://USER:PASS@ep-xxxx.REGION.aws.neon.tech/neondb?sslmode=require"
   npx prisma migrate dev --name init
   ```

   Commitea la carpeta `prisma/migrations/`.
3. En cada despliegue, el workflow del backend corre **`prisma migrate deploy`**
   (aplica migraciones pendientes) y luego los **seeders** (`npm run prisma:seed`).
   No necesitas volver a aplicar el esquema a mano.

> El seed crea el admin (`admin@chilate.com` / `Admin123!`), los catálogos base
> (categorías, tallas, colores) y los textos de landing/correos. **No crea
> productos**: la tienda arranca vacía. Cambia la contraseña del admin tras el
> primer login.

### Seeders

Están separados por dominio en `backend/prisma/seeders/` y los orquesta
`backend/prisma/seed.ts`:

| Seeder | Contenido |
|--------|-----------|
| `001-admin` | Usuario administrador inicial |
| `002-catalogs` | Categorías, tallas y colores |
| `003-landing-content` | Textos de la landing y el footer |
| `004-email-content` | Textos de los correos |

Cada uno se registra en `SeederLog` y **no se vuelve a ejecutar**. Para reejecutar
uno en un entorno, borra su fila de `SeederLog`.

---

## 3. Imágenes — Google Cloud Storage

1. Crea un bucket **privado** (no lo hagas público): `gsutil mb -l us-central1 gs://ecommerce-chilate`.
2. La *service account* que ejecuta Cloud Run necesita leer/escribir el bucket:

   ```bash
   gsutil iam ch serviceAccount:SA_DE_EJECUCION:roles/storage.objectAdmin gs://ecommerce-chilate
   ```

3. **Local:** `GOOGLE_APPLICATION_CREDENTIALS` = ruta al JSON. **Cloud Run:** usa
   la identidad del servicio (sin archivo de clave); solo define `GCS_BUCKET`.

Si `GCS_BUCKET` no está definido, el backend responde 503 y el front usa base64.

---

## 4. Correos — Gmail

1. Activa la verificación en 2 pasos.
2. Crea una **contraseña de aplicación** (16 caracteres) en <https://myaccount.google.com/apppasswords>.
3. Define `GMAIL_USER` y `GMAIL_APP_PASSWORD`.

---

## 5. Backend → Cloud Run (manual, opcional)

El despliegue normal lo hace GitHub Actions (§7). Para un deploy manual:

```bash
cd backend
gcloud run deploy chilate-api \
  --source . --region us-central1 --allow-unauthenticated \
  --set-env-vars "JWT_SECRET=...,DATABASE_URL=...,GCS_BUCKET=...,TZ=America/El_Salvador,..."
```

`PORT` la inyecta Cloud Run. Aplica migraciones/seeders aparte (`npx prisma migrate deploy && npm run prisma:seed`).

---

## 6. Frontend → Vercel (integración nativa)

1. Importa el repo en Vercel. **Root Directory = `frontend`**.
2. Build y output ya vienen en `frontend/vercel.json` (`npm run build` → `dist`, rewrite SPA).
3. Environment Variables → `VITE_API_URL = https://<cloud-run>/api` (Production).
4. Vercel despliega solo en cada push a `main`. Copia la URL final y ponla en
   `CORS_ORIGINS` del backend.

> No hace falta workflow de Actions para el front: Vercel ya lo hace. Si quisieras
> verlo también en Actions, habría que usar el Vercel CLI y desactivar el
> auto-deploy nativo para no duplicar.

---

## 7. CI/CD del backend con GitHub Actions

`.github/workflows/deploy-backend.yml` corre al hacer **push a `main`** que toque
`backend/`, o manualmente (**Run workflow**). Cada corrida se ve en la pestaña
**Actions**. Pasos: autenticar en GCP → **`prisma migrate deploy`** → `prisma
generate` → **`npm run prisma:seed`** → **construir la imagen con caché de capas
(Buildx + GitHub Actions cache) y subirla a Artifact Registry** → `gcloud run
deploy --image` (despliega la imagen ya construida, sin reconstruir en Cloud
Build) → mostrar URL. La caché hace que, si no cambian `package.json` ni
`prisma/`, las capas de `npm ci` y `prisma generate` se reutilicen y la build
tarde segundos.

### 7.1 Secrets de GitHub (Settings → Secrets and variables → Actions)

| Secret | Ejemplo / de dónde |
|--------|--------------------|
| `GCP_PROJECT_ID` | ID del proyecto GCP |
| `GCP_SA_KEY` | JSON completo de la service account de despliegue (§7.2) |
| `DATABASE_URL` | Cadena de Neon (pooled + `sslmode=require`) |
| `DIRECT_URL` | Cadena de Neon **directa** (sin `-pooler`) — solo para migraciones |
| `JWT_SECRET` | Cadena larga aleatoria (sin comillas `"`) |
| `CORS_ORIGINS` | URL de Vercel |
| `PUBLIC_API_URL` | URL de Cloud Run + `/api` |
| `GCS_BUCKET` | Nombre del bucket |
| `GMAIL_USER` / `GMAIL_APP_PASSWORD` | Correo remitente y contraseña de app |

> El frontend NO usa secrets de GitHub: `VITE_API_URL` va en Vercel.
> `PUBLIC_API_URL` y `CORS_ORIGINS` dependen de URLs que se conocen tras el primer
> deploy: despliega una vez, copia las URLs y actualiza esos secrets.

### 7.2 Preparación en GCP (una sola vez)

```bash
# APIs necesarias
gcloud services enable run.googleapis.com cloudbuild.googleapis.com \
  artifactregistry.googleapis.com

# Service account de despliegue + llave (esta llave es GCP_SA_KEY)
gcloud iam service-accounts create gh-deployer --display-name "GitHub Actions deployer"
SA="gh-deployer@$(gcloud config get-value project).iam.gserviceaccount.com"
for R in run.admin iam.serviceAccountUser cloudbuild.builds.editor \
         artifactregistry.admin storage.admin; do
  gcloud projects add-iam-policy-binding "$(gcloud config get-value project)" \
    --member "serviceAccount:$SA" --role "roles/$R"
done
gcloud iam service-accounts keys create key.json --iam-account "$SA"
# Pega el contenido de key.json en el secret GCP_SA_KEY y borra el archivo.
```

Además, la SA de **ejecución** de Cloud Run necesita `storage.objectAdmin` sobre el
bucket de imágenes (§3). Si el primer deploy no puede crear el repo de Artifact
Registry, créalo una vez:

```bash
gcloud artifacts repositories create cloud-run-source-deploy \
  --repository-format=docker --location=us-central1
```

---

## 8. Auditoría (acciones de usuarios internos)

Un interceptor global registra en la tabla `AuditLog` cada **escritura**
(crear/editar/eliminar) hecha por usuarios internos (ADMIN, MAINTENANCE, CATALOG):
quién, qué acción, sobre qué recurso y cuándo. Se consulta en el panel en
**Auditoría** (`/admin/auditoria`), **solo para ADMIN** (`GET /api/audit`).

---

## Orden recomendado (evita dependencias circulares)

1. Neon → `DATABASE_URL`; en local `prisma migrate dev --name init` y commitea `prisma/migrations/`.
2. Crea el bucket GCS y da permisos a la SA de ejecución.
3. Configura los secrets y despliega el backend (Actions). Obtienes su URL.
4. Actualiza `PUBLIC_API_URL` = `<cloud-run>/api` y re-lanza el workflow.
5. Despliega el frontend en Vercel con `VITE_API_URL` = `<cloud-run>/api`. Obtienes la URL de Vercel.
6. Pon la URL de Vercel en `CORS_ORIGINS` y re-lanza el workflow del backend.

## Checklist rápido

- [ ] `prisma/migrations/` commiteado; el workflow corre `migrate deploy` + seeders
- [ ] `DATABASE_URL` (pooled + `sslmode=require`)
- [ ] `JWT_SECRET` largo y aleatorio
- [ ] `CORS_ORIGINS` = dominio de Vercel · `PUBLIC_API_URL` y `VITE_API_URL` = Cloud Run + `/api`
- [ ] `GCS_BUCKET` + `storage.objectAdmin` a la SA de ejecución
- [ ] `GMAIL_USER` + `GMAIL_APP_PASSWORD`
- [ ] APIs GCP habilitadas y `GCP_SA_KEY` con sus roles
- [ ] Admin inicial creado (seed) y contraseña cambiada

## Pasar a pagos reales

Reemplaza `PaymentsService.charge()` en `backend/src/payments/payments.service.ts`
por una integración real (Wompi, Stripe, …) manteniendo la firma. El resto del
checkout no cambia.
