# syntax=docker/dockerfile:1
# Build from monorepo root:
#   docker build -f server/Dockerfile -t nestjs-app:latest .
# Or via compose from server/:
#   docker compose build server

ARG NODE_VERSION=20
ARG PNPM_VERSION=10.12.1

FROM node:${NODE_VERSION}-alpine AS base

# ARG before FROM is out of scope after FROM — re-declare for use in RUN
ARG PNPM_VERSION=10.12.1

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0

RUN apk add --no-cache libc6-compat openssl \
  && corepack enable \
  && corepack prepare "pnpm@${PNPM_VERSION}" --activate \
  && pnpm --version

WORKDIR /app

# ---------------------------------------------------------------------------
# Install workspace deps (server + @onlineshop/shared)
# ---------------------------------------------------------------------------
FROM base AS deps

ARG PNPM_VERSION=10.12.1

RUN apk add --no-cache python3 make g++

COPY package.json pnpm-lock.yaml .npmrc ./
COPY packages/shared/package.json ./packages/shared/
COPY server/package.json ./server/
COPY server/prisma ./server/prisma

# Restrict workspace packages to what we copy (root lockfile also covers client)
RUN printf '%s\n' \
  'packages:' \
  "  - 'server'" \
  "  - 'packages/*'" \
  'onlyBuiltDependencies:' \
  "  - '@nestjs/core'" \
  "  - '@prisma/client'" \
  "  - '@prisma/engines'" \
  "  - argon2" \
  "  - prisma" \
  > pnpm-workspace.yaml

# Dummy URL satisfies schema env() during prisma generate in postinstall
ENV DATABASE_URL="postgresql://postgres:postgres@localhost:5432/postgres"

RUN pnpm install --filter @onlineshop/server... --frozen-lockfile

# ---------------------------------------------------------------------------
# Build shared package + Nest server
# ---------------------------------------------------------------------------
FROM base AS build

ARG PNPM_VERSION=10.12.1

RUN apk add --no-cache python3 make g++

COPY --from=deps /app/ /app/

COPY packages/shared ./packages/shared
COPY server ./server

RUN printf '%s\n' \
  'packages:' \
  "  - 'server'" \
  "  - 'packages/*'" \
  'onlyBuiltDependencies:' \
  "  - '@nestjs/core'" \
  "  - '@prisma/client'" \
  "  - '@prisma/engines'" \
  "  - argon2" \
  "  - prisma" \
  > pnpm-workspace.yaml

ENV DATABASE_URL="postgresql://postgres:postgres@localhost:5432/postgres"

RUN pnpm --filter @onlineshop/shared build \
  && pnpm --filter @onlineshop/server exec prisma generate \
  && pnpm --filter @onlineshop/server build

# Pruned production deploy (workspace deps inlined). Then re-generate Prisma Client
# inside /out — deploy's postinstall can write the client outside the deploy tree.
RUN pnpm --filter @onlineshop/server deploy --prod --legacy /out \
  && cp -R /app/server/dist /out/dist \
  && cp -R /app/server/prisma /out/prisma \
  && cd /out \
  && PRISMA_BIN="$(find /app/node_modules -path '*/prisma/build/index.js' | head -1)" \
  && node "$PRISMA_BIN" generate --schema=/out/prisma/schema.prisma \
  && node -e "const p=require('@prisma/client'); if (!p.UserRole?.CUSTOMER) { console.error('Prisma client missing enums', Object.keys(p)); process.exit(1); } console.log('Prisma client OK', p.UserRole);"

# ---------------------------------------------------------------------------
# Runtime
# ---------------------------------------------------------------------------
FROM base AS production

ENV NODE_ENV=production
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nestjs

COPY --from=build --chown=nestjs:nodejs /out/ ./

USER nestjs

EXPOSE 3001

CMD ["node", "dist/main.js"]
