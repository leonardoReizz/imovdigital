FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /app

# ─── Install dependencies ─────────────────────────────────────
FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/api/package.json ./apps/api/
COPY apps/dashboard/package.json ./apps/dashboard/
COPY apps/web/package.json ./apps/web/
COPY packages/types/package.json ./packages/types/
COPY packages/utils/package.json ./packages/utils/
COPY packages/config/package.json ./packages/config/
RUN pnpm install --frozen-lockfile

# ─── Build all apps ────────────────────────────────────────────
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm install --frozen-lockfile

RUN pnpm --filter @imovdigital/types build || true
RUN pnpm --filter @imovdigital/utils build || true

# API
RUN pnpm --filter @imovdigital/api prisma:generate
RUN pnpm --filter @imovdigital/api build

# Dashboard
RUN pnpm --filter @imovdigital/dashboard build

# Web (Next.js standalone)
ENV API_URL=http://localhost:3000/api
ENV NEXT_PUBLIC_API_URL=/api
RUN pnpm --filter @imovdigital/web build

# ─── Production image ─────────────────────────────────────────
FROM node:20-alpine AS runner
RUN npm install -g serve
WORKDIR /app
ENV NODE_ENV=production

# API
COPY --from=builder /app/apps/api/dist ./api/dist
COPY --from=builder /app/apps/api/package.json ./api/
COPY --from=builder /app/apps/api/prisma ./api/prisma
COPY --from=builder /app/node_modules ./node_modules

# Dashboard (static)
COPY --from=builder /app/apps/dashboard/dist ./dashboard

# Web (Next.js standalone)
COPY --from=builder /app/apps/web/.next/standalone ./web
COPY --from=builder /app/apps/web/.next/static ./web/apps/web/.next/static

# Startup script
RUN cat > /app/start.sh << 'SCRIPT'
#!/bin/sh
set -e

# API (port 3000)
cd /app/api && node dist/main &

# Dashboard (port 5173)
serve -s /app/dashboard -l 5173 &

# Web (port 5174)
cd /app/web && PORT=5174 HOSTNAME=0.0.0.0 API_URL=http://127.0.0.1:3000/api NEXT_SHARP_PATH=/app/node_modules/sharp node apps/web/server.js &

wait
SCRIPT
RUN chmod +x /app/start.sh

EXPOSE 3000 5173 5174
CMD ["/app/start.sh"]
