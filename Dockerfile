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
ENV API_URL=http://localhost:3001/api
ENV NEXT_PUBLIC_API_URL=/api
RUN pnpm --filter @imovdigital/web build

# ─── Production image ─────────────────────────────────────────
FROM node:20-alpine AS runner
RUN npm install -g serve
WORKDIR /app
RUN npm init -y && npm install http-proxy
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

# Router — listens on port 80 and routes to internal services
# Dashboard domain → serve static (port 3002)
# Web/tenant domains → Next.js (port 3003)
# /api → NestJS (port 3001)
RUN cat > /app/router.js << 'ROUTER'
const http = require("http");
const { createProxyServer } = require("http-proxy");

const proxy = createProxyServer({});
const DASHBOARD_HOST = process.env.DASHBOARD_HOST || "dashboard";
const PORT = process.env.PORT || 80;

proxy.on("error", (err, req, res) => {
  console.error("Proxy error:", err.message);
  if (!res.headersSent) {
    res.writeHead(502, { "Content-Type": "text/plain" });
    res.end("Bad Gateway");
  }
});

const server = http.createServer((req, res) => {
  const host = (req.headers.host || "").split(":")[0];

  // API requests always go to NestJS
  if (req.url.startsWith("/api")) {
    return proxy.web(req, res, { target: "http://127.0.0.1:3001" });
  }

  // Dashboard domain → static files
  if (host.includes(DASHBOARD_HOST)) {
    return proxy.web(req, res, { target: "http://127.0.0.1:3002" });
  }

  // Everything else → Next.js (tenant sites)
  proxy.web(req, res, { target: "http://127.0.0.1:3003" });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Router listening on port ${PORT}`);
});
ROUTER

# Startup script
RUN cat > /app/start.sh << 'SCRIPT'
#!/bin/sh
set -e

# API (internal port 3001)
cd /app/api && PORT=3001 node dist/main &

# Dashboard static server (internal port 3002)
serve -s /app/dashboard -l 3002 &

# Web / Next.js (internal port 3003)
cd /app/web && PORT=3003 HOSTNAME=0.0.0.0 API_URL=http://127.0.0.1:3001/api node apps/web/server.js &

# Wait for services to start
sleep 2

# Router (exposed port 80)
node /app/router.js &

wait
SCRIPT
RUN chmod +x /app/start.sh

EXPOSE 80
CMD ["/app/start.sh"]
