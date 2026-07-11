# OnlineShop.rw — End-to-End QA Report

**Date:** 2026-07-11  
**Environment:** local (`http://127.0.0.1:3000` client, `http://127.0.0.1:3001` API)  
**Method:** Playwright full-path crawl + API probes + targeted deep dives  
**Artifacts:** `e2e-audit/results.json`, `e2e-audit/screens/`, `e2e-audit/run-e2e.mjs`  
**Automated summary:** **108 pass · 1 hard fail · 10 warnings** (119 checks) — *manual review elevates several “warns” to real product bugs below.*

**Test merchant (password reset for QA only):** `+250791761286` / `TestE2E123!` (STORE_OWNER, store `storeas` / Kigali Fashion)

### Fix status (post-audit)

| ID | Status |
| -- | ------ |
| BUG-001 auth GET / password in URL | **Fixed** — `method="post"`, explicit `preventDefault`, i18n labels |
| BUG-002 invalid store storefront | **Fixed** — dedicated not-found state |
| BUG-003 orders date / 500 | **Hardened** — inclusive date bounds + invalid date guards |
| BUG-004/005/006 catalog filters | **Fixed** — `next/navigation` + locale-aware query URLs |
| BUG-007 top store links | **Fixed** — path `/shop/store/{subdomain}` |
| BUG-009 document title boilerplate | **Fixed** — OnlineShop.rw metadata |
| BUG-010 favicon | **Fixed** — `app/icon.tsx` + `public/favicon.svg` |
| BUG-011 auth i18n | **Fixed** — en + rw strings on auth pages |
| BUG-008 latency | Open (perf work remaining) |

---

## Executive summary

Core marketplace, store URLs, product detail, cart page, auth pages, merchant login, and most dashboard routes load and are usable. Several issues found in audit were addressed in a follow-up fix commit (filters, invalid store, auth forms, metadata/favicon). **Remaining open:** dashboard API latency (BUG-008) and deeper orders load optimization.

---

## What’s working

### API

| Check | Result |
| ----- | ------ |
| `GET /health` | 200 |
| `GET /v1/catalog/groups` | 200 — 4 stores, 8 categories, products present |
| `GET /v1/catalog/groups?subdomain=storeas` | 200 — store context `Kigali Fashion` |
| `GET /v1/catalog/products/:id` | 200 — e.g. Leather Wallet |
| `POST /v1/auth/login` (valid) | 200 — tokens + user |
| `POST /v1/auth/login` (invalid) | 401 |
| `GET /v1/analytics/overview` (auth) | 200 |
| `GET /v1/orders/export` (auth) | 200 CSV |
| `GET /v1/analytics/report?period=month` (auth) | 200 text report |
| `GET /v1/orders/notifications` (auth) | 200 |

### Marketplace (buyer)

| Path / action | Result |
| ------------- | ------ |
| `/en` home | Loads catalog, header, filters chrome, product cards, top stores |
| Log in / Become a seller / cart icon chrome | Present |
| Product cards, ratings, stock pills, wishlist control | Render and clickable |
| PDP `/en/shop/{id}` | Content OK (e.g. Leather Wallet); variants + **Add to cart** present |
| Cart `/en/cart` | Loads (empty and with items paths exist; place-order dialog code present) |
| `/en/shop` | Loads |
| `/rw` Kinyarwanda home | Loads content |

### Storefront URLs

| URL | Result |
| --- | ------ |
| `/en?store=storeas` | Works — hero shows **Kigali Fashion** |
| `/en/shop/store/storeas` | Works |
| `/en?store=ikuzosupplies` | Works |
| `/en/shop/store/ikuzosupplies` | Works |
| `/en?store=carssupplies` | Works |
| Store card `href`s in DOM | Correct: `/en?store={subdomain}` |

### Auth

| Path / action | Result |
| ------------- | ------ |
| `/en/login`, `/signup`, `/forgot-password`, `/reset-password`, `/verify-phone` | Pages load (HTTP 200) |
| Empty login submit | Validation: “Phone number is required”, “Password is required” |
| Wrong credentials | Stays on login (API 401) |
| Valid merchant login | **Works** — redirects to `/en/dashboard` (when form state is bound correctly) |
| Logout control | Label **“Log out”** (i18n fixed); logs out → `/en/login` |

### Merchant dashboard

| Path | Result |
| ---- | ------ |
| `/en/dashboard` | Loads KPIs, quick actions, export/report controls |
| `/en/dashboard/products` | Loads |
| `/en/dashboard/inventory` | Loads |
| `/en/dashboard/orders` | Page shell loads (data may error — see bugs) |
| `/en/dashboard/payments` | Loads |
| `/en/dashboard/store-settings` (+ tabs business/branding/contact/delivery/subscription) | Loads |
| `/en/dashboard/subscription`, `/profile`, `/delivery-settings`, `/admin` | Reachable when authenticated |
| Sidebar nav (Products, Inventory, Orders, Payments, Store Settings) | Navigates within dashboard |
| Quick actions (Create Product, View Orders, Manage Inventory, Store Settings) | Present |
| Export / Generate Report buttons | Present; backend export/report endpoints OK when authorized |
| Onboarding `/en/store` unauthenticated | Redirects to login (expected) |

### i18n / polish already verified

| Check | Result |
| ----- | ------ |
| Raw `sidebar.logout` key | **Fixed** — shows “Log out” |
| Soft borders/shadows on marketplace + dashboard chrome | Present (prior UI pass) |

---

## Bugs (prioritized)

### P0 — Critical / trust & security

#### BUG-001 — Auth forms can fall back to GET and put **password in the URL**
- **Severity:** Critical  
- **Where:** `/en/login` (and likely other auth forms with the same pattern)  
- **Observed:** After a Playwright fill+click, browser landed on  
  `http://127.0.0.1:3000/en/login?phoneNumber=%2B250791761286&password=TestE2E123%21`  
- **Impact:** Password leaked to history, logs, Referer, analytics.  
- **Likely cause:** Native form submit (method defaults to GET) when React Hook Form handler doesn’t run (slow hydration / failed bind). Forms lack explicit `method="post"` defense-in-depth.  
- **Fix:** `method="post"` + `autoComplete` on all auth forms; ensure submit only via `handleSubmit`; never put secrets in query strings.

#### BUG-002 — Invalid store subdomain still renders a full “storefront”
- **Severity:** High  
- **Where:** `/en?store=does-not-exist-xyz`  
- **API:** `GET /v1/catalog/groups?subdomain=does-not-exist-xyz` → `store: null`, `groups: []`  
- **UI:** Still shows “STORE STOREFRONT”, title **does-not-exist-xyz**, copy *“You are browsing does-not-exist-xyz's storefront…”*  
- **Cause:** `shop-catalog.tsx` builds `storeContext` from the raw subdomain whenever present, falling back `displayName` to the slug even when `data.store` is null.  
- **Fix:** If `subdomain` is set and `data.store` is null → dedicated empty/404 store state (no fake merchant hero).

#### BUG-003 — Dashboard orders list intermittent **HTTP 500**
- **Severity:** High  
- **Where:** `GET /v1/orders?limit=100&dateFrom=…&dateTo=…`  
- **Observed:** Server log: `PrismaClientKnownRequestError` → 500 (also surfaced in browser as Axios 500 during E2E). Same endpoint often returns 200 (~5–6s).  
- **Impact:** Orders page flaky; merchants may see empty/error state randomly.  
- **Fix:** Capture full Prisma message; verify `placedAt` filters, connection pool under concurrent dashboard fan-out (orders page fires many parallel count queries).

---

### P1 — Broken or unreliable user journeys

#### BUG-004 — Catalog **category chips** do not update the URL
- **Severity:** High  
- **Where:** Home `/en` → click **Clothing (2)**  
- **Expected:** URL gains `?category=Clothing` (or similar) and listing filters.  
- **Actual:** URL stays `http://127.0.0.1:3000/en` after multi-second waits (reproduced in isolation).  
- **Note:** Direct navigation to `/en?category=Clothing` is the intended server path; client `router.push` from `ShopCatalogFilters.navigate` appears ineffective.  
- **Fix:** Debug `usePathname` + `next-intl` `router.push(\`/?category=…\`)`; prefer `router.push({ pathname: '/', query: { … } })` or full locale path; ensure query survives middleware.

#### BUG-005 — Catalog **search Apply** often does not navigate
- **Severity:** High  
- **Where:** Search box + **Apply**  
- **Observed:** After fill “cotton” + Apply, URL frequently stayed `/en` (later attempts sometimes got `?q=cotton`). Unreliable.  
- **Fix:** Same as BUG-004; also avoid fighting the native `search` clear handler.

#### BUG-006 — Sort Apply may not attach `sort` query
- **Severity:** Medium  
- **Where:** Sort select + Apply  
- **Observed:** After selecting price ascending, URL sometimes only had `q=…` without `sort=` (by design `newest` is omitted, but `price-asc` should appear).  
- **Fix:** Confirm `select` value is read on submit; ensure `buildCatalogQueryString` receives override.

#### BUG-007 — Top-store card click flaky in automation / soft navigation
- **Severity:** Medium  
- **Where:** Top stores section  
- **DOM:** `href` is correct (`/en?store=storeas`). Direct open works.  
- **Observed:** Programmatic `.click()` sometimes left URL at `/en` (likely overlay/hydration/double-link target).  
- **Fix:** Ensure single clear CTA; increase hit area; verify no `preventDefault` from parent `article` handlers.

#### BUG-008 — Extreme API latency on dashboard
- **Severity:** High (UX)  
- **Observed (server logs):**  
  - analytics overview **11–13s**  
  - products list **6–7s**  
  - inventory / store settings **6–9s**  
  - orders **5–14s**  
- **Impact:** Dashboard feels broken; timeouts under automation; risk of real-user abandonment.  
- **Fix:** Index review, reduce N+1, cache overview aggregates, avoid fan-out of many `limit=1` count queries on orders page load.

---

### P2 — Product quality / polish / i18n

#### BUG-009 — Document title still **“Next.js Boilerplate”**
- **Severity:** Medium  
- **Where:** `client/config/root-metadata.ts` (and OG/Twitter)  
- **Impact:** Browser tab, SEO, share cards wrong for production brand.  
- **Fix:** Set OnlineShop.rw titles/descriptions; remove boilerplate authors/keywords.

#### BUG-010 — Missing **favicon** (`/favicon.ico` → 404)
- **Severity:** Low–Medium  
- **Where:** Static assets  
- **Fix:** Add `app/favicon.ico` or `public/favicon.ico`.

#### BUG-011 — Auth UI strings not i18n’d
- **Severity:** Medium  
- **Where:** Login/signup placeholders and buttons (“Phone Number…”, “Password”, “LOGIN”, “Forgot Password?”, signup fields, etc.)  
- **Impact:** `/rw` locale still shows English controls on auth; violates project i18n rules.  
- **Fix:** Move all user-visible auth strings to `en.json` / `rw.json`.

#### BUG-012 — Dashboard copy partially hardcoded English
- **Severity:** Low–Medium  
- **Where:** Dashboard home welcome line, KPI titles (“Total Revenue”, “Quick Actions”, …)  
- **Fix:** Use `useTranslations('dashboard…')`.

#### BUG-013 — Pseudo ratings / fake review counts
- **Severity:** Low (product honesty)  
- **Where:** `pseudoRating()` in `product-display.ts` used on cards/PDP  
- **Impact:** Invented stars/review counts until real reviews exist — misleading if shipped as-is.  
- **Fix:** Hide ratings or label as “Coming soon” until backend reviews ship.

#### BUG-014 — Product image paths depend on public static files
- **Severity:** Low  
- **Where:** Seed/demo images like `/products/tshirt-1.jpg`  
- **Observed:** Some assets 200; missing assets show empty/placeholder.  
- **Fix:** Consistent media pipeline / CDN; better empty-image UI (partially exists).

#### BUG-015 — Guest place-order only collects phone
- **Severity:** Low (by design?)  
- **Where:** `PlaceOrderDialog` — phone E.164 only  
- **Impact:** Shipping address deferred (“Phone order — delivery details to confirm”) — OK for MVP but incomplete checkout vs Shopify-class UX.  
- **Track:** Enrich checkout when payments/delivery selection ready.

#### BUG-016 — No list endpoint `GET /v1/catalog/products`
- **Severity:** Info  
- **Observed:** 404 by design (groups + products/:id only).  
- **Note:** Not a bug if undocumented; document public catalog API.

#### BUG-017 — Next.js dual lockfile / workspace root warning
- **Severity:** Low (devex)  
- **Observed:** `Detected additional lockfiles: client/pnpm-lock.yaml`  
- **Fix:** Single root lockfile; set `outputFileTracingRoot` if needed.

#### BUG-018 — I18n Accept-Language resolver warning on API
- **Severity:** Low  
- **Log:** `HeaderResolver does not support RFC4647 Accept-Language header…`  
- **Fix:** Switch to `AcceptLanguageResolver` in Nest i18n config.

---

## Store URL matrix (explicit)

| Store | Query URL | Path URL | Notes |
| ----- | --------- | -------- | ----- |
| Kigali Fashion | `/en?store=storeas` | `/en/shop/store/storeas` | APPROVED, products OK |
| Ikuzo supplies | `/en?store=ikuzosupplies` | `/en/shop/store/ikuzosupplies` | OK |
| Cars suplies Ltd | `/en?store=carssupplies` | `/en/shop/store/carssupplies` | OK (typo in display name is data) |
| onlineshop | `/en?store=anythingagain` | — | OK |
| Invalid | `/en?store=does-not-exist-xyz` | — | **BUG-002** |

**Not tested in this pass:** true multi-tenant host (`storeas.localhost` / production subdomain DNS). Local routing uses query + `/shop/store/:store` only.

---

## Journey checklist

| # | Journey | Status |
| - | ------- | ------ |
| 1 | Browse marketplace home | Pass |
| 2 | Filter by category (chip) | **Fail** (BUG-004) |
| 3 | Search products | **Unreliable** (BUG-005) |
| 4 | Sort products | Partial (BUG-006) |
| 5 | Open product detail | Pass |
| 6 | Add to cart (PDP) | Pass (controls present) |
| 7 | Wishlist toggle | Pass (click) |
| 8 | Open cart | Pass |
| 9 | Place guest order | Partial (dialog exists; full paid checkout not fully exercised) |
| 10 | Visit store via top card / query / path | Pass (direct URL); click flaky (BUG-007) |
| 11 | Invalid store | **Fail** UX (BUG-002) |
| 12 | Login validation | Pass |
| 13 | Login success → dashboard | Pass (when hydrated) |
| 14 | Logout | Pass |
| 15 | Signup page + submit | Smoke pass (verify-phone / OTP path depends on SMS/dev OTP logs) |
| 16 | Store onboarding `/store` | Auth-gated correctly |
| 17 | Dashboard modules | Pass (shell); orders data **flaky** (BUG-003/008) |
| 18 | Export / report download (API) | Pass |
| 19 | Locale `/rw` | Pass (marketplace); auth still EN (BUG-011) |
| 20 | Favicon / document title | **Fail** (BUG-009, BUG-010) |

---

## Suggested fix order

1. **BUG-001** — password in URL (auth form method + submit hygiene)  
2. **BUG-002** — invalid store empty state  
3. **BUG-004/005/006** — catalog client navigation (filters)  
4. **BUG-003/008** — orders 500 + dashboard performance  
5. **BUG-009/010/011** — brand metadata, favicon, auth i18n  

---

## How to re-run this audit

```bash
# API + client running on :3001 / :3000
# Optional: reset a merchant password for login tests (local only)
cd server && node -e "
const {PrismaClient}=require('@prisma/client');
const bcrypt=require('bcryptjs');
const p=new PrismaClient();
(async()=>{
  const passwordHash=await bcrypt.hash('TestE2E123!',10);
  await p.user.update({where:{phoneNumber:'+250791761286'},data:{passwordHash}});
  await p.\$disconnect();
})();
"

node e2e-audit/run-e2e.mjs
# → e2e-audit/results.json + e2e-audit/screens/
```

---

*Generated from automated Playwright crawl + manual API/browser deep dives. Treat P0/P1 as release blockers for a Shopify-quality public launch.*
