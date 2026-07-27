# Shopper

> Building Africa's Biggest Marketplace Starting From Rwanda.

Shopper is a **single marketplace** where buyers browse products and stores, and merchants operate their shops from a **dashboard** — not from separate subdomain websites.

## 1. Product Vision

- One modern marketplace website (products + stores)
- Fast merchant onboarding and product management
- Category-aware products (fashion vs electronics vs general)
- Inventory, delivery zones, and order handling
- **Manual payments**: order → pay instructions → payment proof upload → merchant approval
- Marketplace ranking (ratings, new arrivals, rising stores, promotions)
- Platform admin console for KYC, categories, promos, and moderation

Commercial packaging and any off-platform billing are **handled outside this website** — there is **no in-app Basic/Pro subscription ladder**.

Architecture decision: [`docs/adr/001-single-marketplace.md`](./docs/adr/001-single-marketplace.md).

---

## 2. Positioning

- **Buyers** use one AlignUI-designed marketplace: home algorithms, browse, store profiles, cart, order status.
- **Merchants** manage one store each via `/dashboard` (products, inventory, orders, payment proofs, delivery, settings).
- **Platform admins** operate the network via `/admin` (stores/KYC, categories, platform promos, reviews).

---

## 3. Commercial terms

Pricing and contracts for merchants are **managed off the website** (sales/ops). The application does not implement plan checkout, subscription renewals, or paywalled feature tiers.

---

## 4. Delivery

Delivery is self-managed by each store:

- Delivery zones and fee per zone
- Estimated delivery time
- Order status: pending → confirmed → dispatched → delivered (no live map tracking)

---

## 5. Payments (proof-based)

1. Buyer places an order.
2. Buyer is messaged with payment instructions (store methods: Mobile Money, bank transfer, etc.).
3. Buyer pays offline.
4. Buyer uploads a **payment screenshot** (validated image: type, size, dimensions).
5. Store owner/worker reviews the proof and **approves** or **rejects** it.
6. Fulfillment continues according to store process once payment is confirmed.

There is no automated card/MoMo capture processor in product scope.

---

## 6. User journeys

### Merchant

1. Sign up → verify phone → complete store onboarding (no subdomain claim).
2. Platform admin approves store (KYC).
3. Add products (category-specific fields) → set inventory & delivery.
4. Receive orders → message buyer → verify payment proof → fulfill.

### Buyer

1. Browse marketplace home (ranked sections) or shop/stores.
2. Open a product or visit a store profile (`/stores/{slug}`) — same site chrome.
3. Add to cart → checkout → receive pay instructions → upload proof → track status.

---

## 7. User stories

- As a shop owner, I create a store and manage products without building a separate website.
- As a shop owner, I approve payment proofs when money arrives.
- As a shop owner, I create promo codes for my products.
- As a buyer, I discover products ranked by rating, recency, and promotions.
- As a buyer, I browse stores and open a store to see only that shop’s products.
- As a platform admin, I approve stores, manage categories, and moderate reviews/promos.

---

## 8. Core modules

- Authentication & platform admin
- Store onboarding & KYC
- Product catalog (categories, attributes, variants, media rules)
- Inventory
- Orders, order messages, payment proofs
- Promotions (merchant + platform)
- Reviews & marketplace ranking
- Delivery configuration
- Analytics (merchant dashboard)

---

## 9. Excluded features

- Rider marketplace
- Live tracking maps
- AI forecasting
- Multi-currency
- Social integrations
- Mobile apps
- Advanced marketing automation
- Per-store subdomain websites / storefront templates
- In-app subscription billing / Pro plan paywalls
- Automated payment processor capture

---

## 10. Design

- **AlignUI v1.2** is mandatory for all product UI (`client/src/components/alignui/`).
- Target: **100% AlignUI** on redesigned surfaces.
- Image uploads enforce quality rules (MIME, file size, dimensions).

---

## Developer setup (monorepo)

Only **Node.js 20+** is required. Postgres and Redis are used when they are already running; otherwise setup falls back to SQLite and an in-process cache.

```bash
./setup.sh    # install, write env files, pick Postgres or SQLite, migrate, seed
./start.sh    # run API (:3001) and app (:3000)
```

`./start.sh` runs `./setup.sh` first when `node_modules` or env files are missing.

### What setup chooses

| Service | Production (`APP_ENV` / `NODE_ENV=production`) | Local (`DATABASE_PROVIDER=auto`) |
| ------- | ---------------------------------------------- | -------------------------------- |
| Database | PostgreSQL (`DATABASE_URL`) — required | PostgreSQL if `localhost:5432` accepts a connection, otherwise SQLite at `server/prisma/dev.db` |
| Cache | `lru-cache` in-process unless `CACHE_DRIVER=redis` | Same default. Set `CACHE_DRIVER=redis` or `auto` to use Redis when it is running |

Force an engine in `server/.env`:

```bash
DATABASE_PROVIDER=postgresql   # or sqlite
CACHE_DRIVER=memory            # default lru-cache; redis or auto also work
```

Env files (created by setup if missing):

- `server/.env` ← `server/.env.example`
- `client/.env.local` ← `client/.env.example`

- App: http://localhost:3000
- API: http://localhost:3001

Packages:

| Package | Path | Role |
| ------- | ---- | ---- |
| `@shopper/shared` | `packages/shared` | API envelope, statuses, shared constants |
| `@shopper/server` | `server` | NestJS API |
| `@shopper/client` | `client` | Next.js app |

API success responses always look like:

```json
{ "statusCode": 200, "message": "...", "timestamp": "...", "data": { } }
```

List endpoints nest offset pagination under `data`: `{ data: T[], total, page, limit, totalPages }`.
