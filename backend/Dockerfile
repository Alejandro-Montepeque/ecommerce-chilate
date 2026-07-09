# Imagen de producción (Cloud Run). Una sola etapa a propósito: evita el
# `COPY --from` multi-stage que buildx falla al calcular en este runner
# ("/app/dist not found"). Al final se podan las devDependencies para no
# cargar la imagen.
FROM node:20-slim
WORKDIR /app

# Prisma necesita openssl
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Dependencias (incluye dev: se necesitan para compilar). OJO: NODE_ENV se pone
# en "production" DESPUÉS del build; si se pusiera antes, npm ci omitiría dev.
COPY package*.json ./
RUN npm ci

# Cliente de Prisma
COPY prisma ./prisma
RUN npx prisma generate

# Código y compilación → dist/main.js
COPY . .
RUN npm run build

# Quita devDependencies (el cliente de Prisma ya generado se conserva).
RUN npm prune --omit=dev

ENV NODE_ENV=production
ENV PORT=8080
# Zona horaria: las validaciones de fechas (descuentos) usan la hora local.
ENV TZ=America/El_Salvador

EXPOSE 8080
CMD ["node", "dist/main.js"]
