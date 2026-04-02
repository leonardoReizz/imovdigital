# ============================================
# Stage 1: Install dependencies
# ============================================
FROM node:20-alpine AS deps

RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/dashboard/package.json apps/dashboard/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/types/package.json packages/types/package.json
COPY packages/utils/package.json packages/utils/package.json
COPY packages/config/package.json packages/config/package.json

RUN pnpm install --frozen-lockfile

# ============================================
# Stage 2: Build
# ============================================
FROM deps AS build

COPY . .

ARG VITE_API_URL="/api"
ENV VITE_API_URL=${VITE_API_URL}

RUN pnpm --filter @imovdigital/api exec prisma generate
RUN pnpm build

# Prune dev dependencies after build
RUN pnpm prune --prod

# ============================================
# Stage 3: Production
# ============================================
FROM node:20-alpine

WORKDIR /app

# Node modules (pruned to prod-only)
COPY --from=build /app/node_modules/ node_modules/

# API build output
COPY --from=build /app/apps/api/dist/ apps/api/dist/
COPY --from=build /app/apps/api/package.json apps/api/package.json
COPY --from=build /app/apps/api/prisma/ apps/api/prisma/

# Shared packages
COPY --from=build /app/packages/types/ packages/types/
COPY --from=build /app/packages/utils/ packages/utils/
COPY --from=build /app/packages/config/ packages/config/

# Dashboard build — served by NestJS as static files
COPY --from=build /app/apps/dashboard/dist/ apps/api/public/dashboard/

# Monorepo root files
COPY --from=build /app/package.json package.json
COPY --from=build /app/pnpm-workspace.yaml pnpm-workspace.yaml

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "apps/api/dist/main.js"]
