# ENV.md — Environment variable ledger

Single source of truth for every environment variable OnlineShop.rw uses. Real `.env` files are
gitignored and **never** committed. Copy the package `.env.example` files to `.env` and fill in
secrets.

**Read this at the start of every session** before touching config. **Update this file in the same
task** when you add, remove, rename, or change the meaning of a variable — together with the
relevant `.env.example` and validation site (`client/src/env.ts` and/or
`server/src/common/config/*` / direct `process.env` / `ConfigService` reads).

Status column:

| Status | Meaning |
| ------ | ------- |
| **required** | App fails or auth is unusable without a real value |
| **optional** | Has a safe default or is only needed for a feature |
| **local-only** | Used by Docker Compose / seed / local tooling, not production app code |
| **planned** | Documented because product needs it; **not wired yet** — do not invent partial env without implementing the feature |

---

## 1. Server (`server/.env`)

Loaded via Nest `ConfigModule` (`envFilePath: ['.env']`, cwd = `server/`). See
`server/src/common/common.module.ts` and `server/src/common/config/*`.

### 1.1 Application

| Variable | Status | Default | Used by | Purpose |
| -------- | ------ | ------- | ------- | ------- |
| `APP_ENV` | optional | `local` | `app.config.ts`, onboarding auto-approve, main.ts | Runtime environment: `local` \| `development` \| `staging` \| `production` (see `APP_ENVIRONMENT` enum) |
| `APP_NAME` | optional | `OnlineShop.rw` | `app.config.ts`, `doc.config.ts` | Service display name (logs, Swagger title) |
| `APP_DEBUG` | optional | `false` | `app.config.ts` | Debug flag (`true` enables debug-oriented config) |
| `APP_LOG_LEVEL` | optional | `info` | `app.config.ts` | Pino / app log level |
| `APP_CORS_ORIGINS` | optional | `*` (any) | `app.config.ts` | Comma-separated allowed CORS origins; **set explicitly in production** (e.g. `http://localhost:3000,https://onlineshop.rw`) |

### 1.2 HTTP

| Variable | Status | Default | Used by | Purpose |
| -------- | ------ | ------- | ------- | ------- |
| `HTTP_HOST` | optional | `localhost` | `app.config.ts` → `main.ts` | Bind host |
| `HTTP_PORT` | optional | `3000` in config code | `app.config.ts` → `main.ts` | Bind port. **Docker Compose maps `3001:3001`** — for local API matching the client default, set `HTTP_PORT=3001` |
| `HTTP_VERSIONING_ENABLE` | optional | off unless `true` | `app.config.ts` | Legacy flag; URI versioning is also enabled in `main.ts` with default version `1` |
| `HTTP_VERSION` | optional | `1` | `app.config.ts` | Documented API version string |

### 1.3 Database

| Variable | Status | Default | Used by | Purpose |
| -------- | ------ | ------- | ------- | ------- |
| `DATABASE_URL` | **required** | — | Prisma (`schema.prisma`), `DatabaseService` | PostgreSQL connection string. Local Compose example: `postgresql://postgres:master123@localhost:5432/postgres`. Neon/production: pooled URL if your host provides one |

Prisma is configured with a single `url = env("DATABASE_URL")` (no separate `DIRECT_URL` today). If you later need Neon migrate-vs-runtime split, add `DIRECT_URL` to schema + this ledger in the same change.

### 1.4 Redis / cache

| Variable | Status | Default | Used by | Purpose |
| -------- | ------ | ------- | ------- | ------- |
| `REDIS_URL` | optional* | `redis://localhost:6379` | `redis.config.ts`, `CacheModule` | Redis for cache (and future Bull queues). Compose sets `redis://redis:6379` inside the app container |

\*App may start without Redis depending on cache wiring; production should always set a real Redis.

### 1.5 Auth / JWT / password hashing

| Variable | Status | Default | Used by | Purpose |
| -------- | ------ | ------- | ------- | ------- |
| `AUTH_ACCESS_TOKEN_SECRET` | **required** | — | `auth.config.ts`, `JwtModule`, `JwtStrategy`, encryption helper | HMAC secret for access JWTs. Non-empty; JwtStrategy throws if missing |
| `AUTH_ACCESS_TOKEN_EXP` | optional | `15m` | `auth.module.ts` | Access token lifetime (jwt `expiresIn` string) |
| `AUTH_REFRESH_TOKEN_SECRET` | **required** | — | `auth.config.ts`, `AuthService`, encryption helper | HMAC secret for refresh JWTs — **must differ from access secret** |
| `AUTH_REFRESH_TOKEN_EXP` | optional | `7d` | `AuthService` | Refresh token lifetime |
| `BCRYPT_SALT_ROUNDS` | optional | `10` | `AuthService` | bcrypt cost for password hashes |
| `OTP_EXPIRATION_MINUTES` | optional | `10` | `OtpService` | OTP validity window |
| `OTP_MAX_ATTEMPTS` | optional | `3` | `OtpService` | Max wrong OTP attempts before invalidation |

### 1.6 Onboarding / ops

| Variable | Status | Default | Used by | Purpose |
| -------- | ------ | ------- | ------- | ------- |
| `STORE_AUTO_APPROVE` | optional | implicit `true` when `APP_ENV=local` | `OnboardingService.initialStoreStatus` | When `true`, submitted stores become `APPROVED` immediately. Local always auto-approves. Staging/production: omit or `false` so admin review is required |

### 1.7 Observability

| Variable | Status | Default | Used by | Purpose |
| -------- | ------ | ------- | ------- | ------- |
| `SENTRY_DSN` | optional | unset | `app.config.ts` | Sentry project DSN; leave empty to disable |

### 1.8 Seed (local / CI fixtures)

| Variable | Status | Default | Used by | Purpose |
| -------- | ------ | ------- | ------- | ------- |
| `SEED_DEV_MERCHANT_PHONE` | local-only | — | `prisma/seed.ts` | Phone for a seeded merchant when not production |
| `SEED_DEV_MERCHANT_PASSWORD` | local-only | — | `prisma/seed.ts` | Password for that merchant |
| `NODE_ENV` | optional | — | seed + tooling | Seed refuses certain paths when `production` |

### 1.9 Docker Compose host variables (`server/docker-compose.yml`)

These configure **containers**, not Nest config keys (though they feed `DATABASE_URL` for the app service):

| Variable | Status | Default | Purpose |
| -------- | ------ | ------- | ------- |
| `POSTGRES_USER` | local-only | `postgres` | Postgres user |
| `POSTGRES_PASSWORD` | local-only | `master123` | Postgres password (**change for any shared host**) |
| `POSTGRES_DB` | local-only | `postgres` | Database name |

Compose always injects into the `server` service:

- `DATABASE_URL=postgresql://…@postgres:5432/…`
- `REDIS_URL=redis://redis:6379`

The app service also reads `server/.env` via `env_file`.

---

## 2. Client (`client/.env` / `.env.local`)

Validated in part by `@t3-oss/env-nextjs` in `client/src/env.ts`. Public vars must use the
`NEXT_PUBLIC_` prefix to reach the browser.

| Variable | Status | Default | Used by | Purpose |
| -------- | ------ | ------- | ------- | ------- |
| `NEXT_PUBLIC_API_URL` | optional* | `http://localhost:3001/v1` (Axios) / `http://127.0.0.1:3001/v1` (catalog) | `lib/axios.ts`, services, `env.ts` | Browser-visible API root including version segment (`/v1`) |
| `NEXT_INTERNAL_API_URL` | optional | falls back to `NEXT_PUBLIC_API_URL` | `catalog.service.ts` (RSC only) | Server-side catalog fetches; use `http://127.0.0.1:3001/v1` so RSC does not hit the Next host by mistake |
| `NEXT_PUBLIC_APP_URL` | optional | `http://localhost:3000` | `utils/constants.ts`, `marketplace-url.ts` | Public site origin for absolute marketplace/store links |
| `NODE_ENV` | set by Next | — | Next, Playwright, env schema | `development` \| `test` \| `production` |
| `DATABASE_URL` | optional in schema | — | `client/src/env.ts` only | Present in t3 env schema; **client does not own the DB** — prefer leaving unset unless a client script needs it |
| `ANALYZE` | optional | unset | `next.config.ts` | `true` enables bundle analyzer (`pnpm analyze`) |
| `CI` | optional | unset | Playwright, env schema | CI detection (retries, workers, forbidOnly) |
| `SKIP_ENV_VALIDATION` | optional | unset | `env.ts` | Set to skip t3 env validation (build edge cases only) |
| `PORT` | optional | `3000` | `utils/helpers.ts` | Dev server port for absolute URL fallbacks |
| `VERCEL_URL` | optional | unset | `utils/helpers.ts` | Set by Vercel; used to build absolute URLs |

\*Required for non-default API hosts; local defaults match Docker/`HTTP_PORT=3001` conventions.

---

## 3. Planned variables (not implemented — do not set expecting behavior)

These appear in product direction or future work. **Do not add half-wired SDK keys.** When a feature
lands, move the row into §1 or §2 with status **required/optional** and implement validation.

| Variable (proposed) | Feature | Notes |
| ------------------- | ------- | ----- |
| `SMS_PROVIDER` / provider API keys | Real OTP delivery | Today OTP is generated and **logged in non-production** (`AuthService.logDevOtp`); no SMS gateway |
| `EMAIL_*` / Resend/SES keys | Transactional email | `EMAIL` queue enum exists; no production mailer wired |
| `STORAGE_DRIVER` / S3 credentials | Product image storage | Products accept `images: string[]` URLs; no upload driver module yet |
| `PAYMENT_*` provider keys | Online payments | Order payments are manual/status + proof URL; no MoMo/card processor |
| `SUBSCRIPTION_*` / billing keys | Basic/Pro billing | Subscription UI is presentational; no plan entity or charges |

---

## 4. Local quickstart (working stack)

1. Start deps + API from `server/`:

   ```bash
   cd server
   cp .env.example .env   # edit secrets
   docker compose up -d postgres redis
   pnpm install
   pnpm prisma:migrate
   pnpm dev               # with HTTP_PORT=3001 in .env
   ```

2. Start client:

   ```bash
   cd client
   cp .env.example .env.local
   pnpm install
   pnpm dev               # http://localhost:3000
   ```

3. Health: `GET http://localhost:3001/health` (DB readiness via Terminus).

4. OTP in local: after signup/forgot-password, read the Nest log line  
   `[DEV] OTP … (SMS not configured — use this code locally)`.

---

## 5. Secrets hygiene

- Never commit `.env`, `.env.local`, or real secrets.
- Rotate `AUTH_*_SECRET` if leaked; all existing tokens become invalid.
- Production: distinct secrets, locked CORS origins, real Redis, no `STORE_AUTO_APPROVE=true`, no
  reliance on DEV OTP logs.
- Prefer different secrets per environment (local / staging / production).

---

## Monorepo scripts (root)

From the repository root after `pnpm install`:

| Command | What it does |
| ------- | ------------ |
| `pnpm dev` | Build `@onlineshop/shared`, then run shared watch + Nest (`:3001`) + Next (`:3000`) |
| `pnpm dev:server` | Nest only |
| `pnpm dev:client` | Next only |
| `pnpm build:shared` | Compile shared contracts to `packages/shared/dist` |

Shared package: `packages/shared` (`@onlineshop/shared`). Client and server depend on it via `workspace:*`.
