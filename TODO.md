# TODO — OnlineShop.rw living task ledger

Agents read this before starting work and update it as part of finishing a task (see `AGENTS.md` §14).
Move items to **Done** only when they pass the production-readiness checklist (`AGENTS.md` §12):
real integration, tests where required, polished UI states, en/rw i18n parity — not “code exists.”

Product scope source of truth: [`README.md`](./README.md). Env ledger: [`ENV.md`](./ENV.md).

Rough readiness (maintain when large slices land):

| Area | ~% | Notes |
| ---- | -- | ----- |
| Foundation (schema, auth, tenant, health, monorepo layout) | ~85% | Auth hardened (JWT ACTIVE, hashed OTP/refresh, StoreGuard ownership, CORS fail-closed); SMS still dev-log only |
| Merchant path (onboarding → products → inventory → orders → delivery → settings) | ~78% | Order/inventory transactions + state machines; list error/retry; mobile dashboard nav |
| Marketplace / cart / guest checkout | ~65% | Atomic guest checkout + stock guards; payment processor not live |
| Billing / Basic–Pro plans | ~12% | Subscription i18n + coming soon CTA; no plan model or charges |
| Pro growth features (discounts, loyalty, customer CRM, advanced analytics productization) | ~18% | Analytics aggregates improved; discount/loyalty/CRM not domain models |
| AlignUI design system | ~58% | Token aliases for shadcn muted/ring; page migration still ongoing |
| Release hardening (SMS, email, storage driver, e2e coverage, server rw i18n) | ~35% | Audit fixes verified via API + Playwright; server `languages/rw` still missing |

---

## In progress

_(empty — pick from Next up and move here with owner + date)_

---

## Next up

### §0 — Agent / repo hygiene

- [ ] Continue AlignUI page migration: dashboard home/products/orders/inventory tables, onboarding wizard chrome, shop catalog hero/cards, cart checkout UI — replace residual gray-*/ad-hoc hex with AlignUI tokens and alignui components where touch surfaces
- [ ] Visual QA with Playwright/MCP across auth, dashboard, marketplace, storefront templates (re-run `e2e-audit/run-e2e.mjs` after major UI slices)
- [ ] Keep `TODO.md` + `ENV.md` updated every implementation session (`AGENTS.md` §7, §14)
- [ ] Add `CONTEXT.md` domain glossary via `domain-modeling` skill (users, stores, orders, payments, plans)
- [ ] Record ADRs under `docs/adr/` when §13 decisions in `AGENTS.md` are resolved
- [ ] **BUG-017** — Resolve dual lockfile / workspace root warning (`client/pnpm-lock.yaml` vs root); set `outputFileTracingRoot` if needed

### §1 — i18n parity (mandatory)

- [ ] Create `server/src/languages/rw/` mirroring every `en/*.json` file (`auth`, `common`, `http`, `user`, `validation`)
- [ ] Fix client `en`/`rw` key drift (11 missing keys under `storeOnboarding.errors.*` in `rw.json`)
- [x] Replace hardcoded English on subscription page (`client/src/app/[locale]/dashboard/subscription/page.tsx`) with `useTranslations` + en/rw keys — done 2026-07-12
- [x] **BUG-012** — Dashboard home KPI / welcome / quick-action copy → `useTranslations('dashboard.home…')` + en/rw — done 2026-07-12
- [ ] Audit server exceptions/messages still returning raw English strings instead of i18n keys (`AuthService`, domain exceptions)
- [ ] **BUG-018** — Nest i18n: switch `HeaderResolver` → `AcceptLanguageResolver` (RFC4647 warning in logs)

### §2 — Auth & notifications

- [ ] Wire real SMS OTP delivery (provider decision → ENV.md + fail closed in production; remove sole reliance on `logDevOtp`)
- [ ] Transactional email (password reset, order confirmation) with provider + templates
- [ ] Harden auth tests: server Jest contract tests for signup/login/refresh/forgot/reset; expand client e2e beyond smoke

### §3 — Storage & media

- [ ] Product/store image upload pipeline (StorageDriver or chosen S3-compatible interface) end-to-end from dashboard UI
- [ ] Payment proof upload (today `paymentProofUrl` is a string field — need real upload + merchant verification flow completeness)
- [ ] **BUG-014** — Demo/seed product images (`/products/*.jpg`) inconsistent; empty-image UI + real media pipeline

### §4 — Orders, payments, checkout

- [ ] Guest/cart checkout: ensure `POST /v1/catalog/orders` (and client cart) covers full path — delivery zone fee, stock reservation, clear error/empty states
- [ ] **BUG-015** — Enrich guest place-order beyond phone-only (address / delivery zone selection when payments ready)
- [ ] Payment processor integration for Rwanda (Mobile Money / card / bank) — webhooks, reconciliation, idempotency
- [ ] Cash-on-delivery and manual proof flows: document merchant SOP in UI copy (i18n) and enforce status transitions
- [ ] Buyer-facing order status tracking page (no live map — status only, per product scope)

### §5 — Subscriptions & plan gating

- [ ] Domain model: Plan / Subscription / invoices (Basic setup+monthly, Pro setup+monthly per `README.md` pricing)
- [ ] API enforcement of plan limits (e.g. product caps, analytics access, branding removal)
- [ ] Replace presentational subscription page with real current plan, upgrade checkout, and billing history
- [ ] Align pricing UI with README (Basic 25k setup / 12k mo; Pro 50k setup / 25k mo) — current page hardcodes “Free” / “15,000 RWF”

### §6 — Pro growth features (product roadmap)

- [ ] Discount codes (%, fixed; product/category/store scope; expiry; usage limits)
- [ ] Customer profiles + purchase history + basic segmentation
- [ ] Loyalty points (earn/redeem/expiry rules)
- [ ] Marketplace ranking boost / featured store rotation
- [ ] Store theme customization + remove OnlineShop branding (Pro)
- [ ] Analytics productization: ensure Basic vs Pro dashboard surfaces match plan gates; snapshot jobs (midnight scheduler is still a stub)

### §7 — Restaurant (removed from scope)

- [x] Drop restaurant business type from onboarding and product docs

### §8 — Admin & platform

- [ ] Platform admin console completeness (store queue, KYC review UX, reject reasons, audit log)
- [ ] Seed data scripts documented for demo marketplace (non-production)

### §9 — Reliability, performance, release

- [ ] **BUG-008** (remainder) — Dashboard API latency: add/confirm indexes, cache overview aggregates, collapse orders page `limit=1` fan-out (analytics path partially improved 2026-07-12)
- [ ] **BUG-013** — Pseudo ratings on product cards/PDP: hide or label “coming soon” until real reviews exist
- [ ] Server test suite with real contracts for each module controller (auth, products, inventory, orders, catalog, onboarding, delivery-zones, store-settings, analytics, admin)
- [ ] Client integration + Playwright paths: onboarding, product CRUD, inventory adjust, order fulfill, public checkout
- [ ] Redis/Bull: either use queues for exports/snapshots or remove dead queue surface; implement midnight metrics snapshot job; full CSV export beyond 5k rows via jobs
- [ ] Production secrets, health checks, graceful shutdown verification checklist (CORS fail-closed done 2026-07-12)
- [ ] Rate limiting review on public catalog/order endpoints (auth `@Throttle` done 2026-07-12)

### §10 — Explicitly out of scope (do not start unless user reopens)

- Rider marketplace
- Live tracking maps
- AI forecasting
- Multi-currency
- Social integrations
- Mobile apps
- Advanced marketing automation

---

## Done

### 2026-07-12 — Full audit remediation (verified API + Playwright)

- [x] **Orders integrity** — transactional create/guest checkout; tenant variant check (blocks cross-store inventory); conditional stock reserve; fulfillment state machine + cancel releases reserve; payment transitions; order number uniqueness; tx timeout 30s
- [x] **Auth security** — JWT rejects non-ACTIVE; password reset revokes refresh tokens; hashed OTP + refresh tokens; StoreGuard ownership; unified admin `AllowedRoles`; CORS fail-closed in production; 1mb body; validation errors always returned; Sentry body redaction; auth throttle
- [x] **Inventory/products/analytics** — atomic adjustStock; product create transaction; analytics aggregates + parallel overview; list/export caps
- [x] **Client reliability** — refresh persists both tokens; submit locks on payment/inventory/message modals; list loadError+retry; product form finally; place-order FormControl fix; axios 30s timeout
- [x] **A11y** — mobile dashboard Sheet nav; skip link; auth/onboarding labels; ARIA on sidebar/table/admin/filters; reduced-motion expansion
- [x] **UI/i18n** — dashboard RWF; subscription/home/payments/delivery i18n; zone delete confirm; theme aliases; pseudo ratings removed from Vibrant

### Foundation

- [x] AlignUI v1.2 design tokens in `client/src/styles/globals.css` (green primary, gray neutrals)
- [x] AlignUI utils (`tv`, polymorphic, recursiveCloneChildren) + free components (Button, Input, Label, Badge, Card, Divider)
- [x] Dashboard shell + auth shell restyled to AlignUI; Inter font; Remix Icon on new chrome
- [x] `design-system/MASTER.md` platform + store template palettes
- [x] Classic Market storefront template (DEFAULT) + premium template picker with previews
- [x] Vibrant Market / Night Market token + CTA polish
- [x] AlignUI-aligned server email HTML helpers (`server/src/common/mail/`)


### Foundation

- [x] Monorepo layout: `client/` (Next.js App Router) + `server/` (NestJS) with pnpm
- [x] Root pnpm workspace: `pnpm dev` runs shared + server + client; `@onlineshop/shared` API contracts
- [x] Prisma schema + migrations: users, OTP, refresh tokens, stores/KYC/drafts, products/variants, inventory, orders/payments/fulfillment/messages, delivery zones, analytics snapshots
- [x] Nest common layer: config, database (Neon cold-start retry), cache/Redis module, request guards, response filters, tenant/store decorators, health (`/health`)
- [x] Docker Compose: Postgres 16 + Redis 7 + optional server service
- [x] Agent constitution: `AGENTS.md`; coding standards under `.agents/rules/`; skills under `.agents/skills/`
- [x] Env ledger + examples: `ENV.md`, `server/.env.example`, `client/.env.example`

### Auth & onboarding

- [x] Auth API: signup, verify-phone, login, refresh, forgot-password, reset-password (JWT access + refresh)
- [x] OTP generation/validation with attempt limits (delivery = dev log until SMS lands)
- [x] Client auth pages + Axios interceptors (refresh queue, public routes)
- [x] Store onboarding draft/submit + subdomain check; client multi-step onboarding
- [x] References API: industries + business categories
- [x] Admin store list / KYC / approve / reject APIs

### Merchant dashboard (wired to APIs)

- [x] Products CRUD + export + filters (client services ↔ Nest products module)
- [x] Inventory list/adjust/events + export
- [x] Orders list/detail, payment status update, fulfillment update, messages, notifications, export
- [x] Payments list (merchant) via `/v1/payments`
- [x] Delivery zones CRUD
- [x] Store settings get/update
- [x] Analytics endpoints (overview, dashboard, sales, top products, inventory summary, report, recent activity) + client analytics service usage where connected

### Marketplace / public

- [x] Public catalog API: groups, categories, product by id, guest place order
- [x] Shop UI: marketplace catalog, store-scoped shop, product detail, cart shell with local cart helpers
- [x] Store templates (e.g. Vibrant Market / Ishusho Crafts) + brand colors on store model

### i18n baseline

- [x] Client next-intl with `en` + `rw` locale files and `[locale]` routing
- [x] Server nestjs-i18n English message packs under `server/src/languages/en/`

### Tooling

- [x] Client: Vitest integration sample, Playwright auth e2e sample, Storybook, ESLint/Prettier
- [x] Server: Jest config, ESLint/Prettier, Swagger in non-production, commitlint

### Reliability / race / pagination (2026-07-12)

- [x] Inventory `adjustStock`: `$transaction` + conditional `increment` (no below-zero), `BadRequestException`, event in same tx
- [x] Product create: product + variants + inventory + events in single `$transaction`
- [x] Analytics: aggregates/groupBy instead of full-table loads; `Promise.all` in overview; period-filtered top products; inventory status aggregates + SQL stock value
- [x] Catalog grouped findMany hard cap 2000; orders/products/inventory CSV export cap 5000
- [x] `ProductFilterDto` / `OrderFilterDto` / `PaymentFilterDto` `@Max(100)` on `limit`; admin `getStores` take capped at 100

### Security hardening (2026-07-12)

- [x] JWT strategy rejects non-`ACTIVE` users (`UserStatus`)
- [x] Password reset revokes all refresh tokens for user
- [x] Refresh rotation: atomic `deleteMany` on hashed token + not revoked + not expired; store SHA-256 of refresh token
- [x] Signup DTO role restricted with `@IsIn([CUSTOMER, STORE_OWNER])`
- [x] `StoreGuard` verifies store ownership (`store.userId === userId`) instead of trusting JWT `storeId`
- [x] Admin stores controller uses global `AllowedRoles` + `UserRole.PLATFORM_ADMIN` (no auth-module RolesGuard)
- [x] OTP codes stored hashed (SHA-256); plain code still returned for SMS/dev log
- [x] Production CORS fail-closed when origins empty or `*`
- [x] Body parser limit reduced 50mb → 1mb
- [x] Exception filter always returns validation messages; Sentry body redacts password/newPassword/otpCode/refreshToken/token
- [x] `logDevOtp` skips when `NODE_ENV` or `APP_ENV` is production
- [x] Stricter `@Throttle` on auth endpoints (login/signup/forgot/reset/verify/refresh)
- [x] Suspended accounts blocked at JWT validation (no separate admin suspend endpoint required for enforcement)

### E2E QA bugfixes (2026-07-11) — see `BUGS.md`

- [x] **BUG-001** — Auth forms `method="post"` + explicit preventDefault (no password in query string)
- [x] **BUG-002** — Invalid store subdomain shows not-found UI (no fake storefront)
- [x] **BUG-003** — Orders date filters: inclusive day bounds + invalid-date guards
- [x] **BUG-004/005/006** — Catalog category/search/sort client navigation via locale-aware query URLs
- [x] **BUG-007** — Top store cards link to `/shop/store/{subdomain}`
- [x] **BUG-009/010** — OnlineShop.rw metadata + app icon / favicon.svg
- [x] **BUG-011** — Auth pages en/rw i18n for fields and CTAs
- [x] Soft UI surfaces (stroke/shadow tokens, calmer dashboard CTAs, visible Log out label)
- [x] E2E audit harness `e2e-audit/run-e2e.mjs` + report `BUGS.md` (screenshots gitignored)

---

## Notes for the next agent

1. Prefer finishing an end-to-end slice (API + client service + UI states + i18n + tests) over new half-modules.
2. Subscription/billing and real payments are the largest product gaps relative to `README.md`.
3. Server Kinyarwanda packs and SMS OTP are correctness/compliance gaps — treat as high priority before production traffic.
4. When implementing anything in **Next up**, move it to **In progress** with date; when verified, move to **Done** with a one-line “how we know it works.”
5. Open audit leftovers are tagged **BUG-*** under Next up (§0, §1, §3, §4, §9). Re-run `node e2e-audit/run-e2e.mjs` after fixing them.
6. Local stack: client `:3000`, API `:3001`, public catalog via Next rewrite `/backend/v1`.
