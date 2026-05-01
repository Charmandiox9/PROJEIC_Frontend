# ─── Stage 1: instalar dependencias ───────────────────────────────────────────
FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm install

# ─── Stage 2: build ────────────────────────────────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ─── Stage 3: imagen final (standalone) ────────────────────────────────────────
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
# Next.js standalone escucha en 127.0.0.1 por defecto desde la v15.
# HOSTNAME=0.0.0.0 es necesario para que nginx pueda alcanzarlo dentro de Docker.
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

# Archivos estáticos y públicos
COPY --from=builder /app/public              ./public
COPY --from=builder /app/.next/standalone    ./
COPY --from=builder /app/.next/static        ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]