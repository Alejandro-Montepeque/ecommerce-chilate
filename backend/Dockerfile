# Imagen de producción (Cloud Run). Una sola etapa a propósito: evita el
# `COPY --from` multi-stage que buildx falla al calcular en este runner
# ("/app/dist not found").
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

# Verifica que el compilado quedó donde el CMD lo espera. Si no, falla el build
# aquí (con el contenido de dist) en vez de crashear en runtime.
RUN test -f dist/main.js || (echo "ERROR: falta dist/main.js. Contenido de dist:" && ls -R dist && exit 1)

# NOTA: NO usamos `npm prune --omit=dev` porque borra el cliente generado de
# Prisma (node_modules/.prisma) y la app no arrancaría (no encuentra el engine).
# Se conservan todas las dependencias; la imagen es un poco más grande pero fiable.

ENV NODE_ENV=production
ENV PORT=8080
# Zona horaria: las validaciones de fechas (descuentos) usan la hora local.
ENV TZ=America/El_Salvador

EXPOSE 8080
CMD ["node", "dist/main.js"]
