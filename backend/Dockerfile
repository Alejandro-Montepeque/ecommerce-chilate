# ---- Build ----
FROM node:20-slim AS builder
WORKDIR /app

# Prisma necesita openssl
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Instalar dependencias primero (capa cacheable: solo cambia si cambian
# package.json / package-lock.json).
COPY package*.json ./
RUN npm ci

# Generar el cliente de Prisma (capa cacheable: cambia si cambia prisma/).
COPY prisma ./prisma
RUN npx prisma generate

# Compilar el código.
COPY . .
RUN npm run build

# Quitar devDependencies para reutilizar node_modules en runtime (evita un
# segundo npm ci). El cliente de Prisma ya generado (prod) se conserva.
RUN npm prune --omit=dev

# ---- Runtime ----
FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080
# Zona horaria: las validaciones de fechas (descuentos) usan la hora local.
ENV TZ=America/El_Salvador

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Reutiliza node_modules de producción y el build del builder.
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./package.json

EXPOSE 8080
CMD ["node", "dist/main.js"]
