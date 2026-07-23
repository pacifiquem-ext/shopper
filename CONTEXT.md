# CONTEXT.md — OnlineShop.rw domain glossary

Living ubiquitous language. Update when terms change. Product architecture: [`docs/adr/001-single-marketplace.md`](./docs/adr/001-single-marketplace.md).

## Actors

| Term | Meaning |
| ---- | ------- |
| **Buyer / customer** | Person browsing the marketplace, placing orders, uploading payment proofs, writing reviews after delivery. |
| **Merchant / store owner** | User who owns a **Store**, manages products/inventory/orders via **merchant dashboard**. |
| **Platform admin** | `PLATFORM_ADMIN` operator of the marketplace (KYC, categories, platform promos, review moderation). |
| **Store worker** | Future/role-adjacent: merchant-side user who may approve payment proofs (v1: store owner). |

## Marketplace (public)

| Term | Meaning |
| ---- | ------- |
| **Marketplace** | The single public website (apex origin). Not multi-host. |
| **Home sections** | Server-ranked blocks: top-rated, new arrivals, rising/upcoming stores, on promotion. |
| **Store directory** | `/stores` — list of approved shops. |
| **Store profile** | `/stores/{slug}` — same marketplace chrome; products of one seller only. |
| **Slug** | Unique URL-safe store identifier (replaces “subdomain”). Never a DNS host claim. |
| **PDP** | Product detail page — gallery, variants, category attributes, reviews, promos. |

## Store & onboarding

| Term | Meaning |
| ---- | ------- |
| **Store** | Merchant’s selling entity (products, orders, delivery zones, branding logo/colors). |
| **Store status** | Draft → submitted → under review → approved / rejected / suspended. |
| **KYC** | Know-your-customer data for store approval (industry, address, owner identity). |
| **Onboarding** | Wizard to create a store draft and submit for review (no subdomain step). |

## Catalog & products

| Term | Meaning |
| ---- | ------- |
| **Product category** | Platform-defined taxonomy (fashion, electronics, …) with **attribute definitions**. |
| **Category attribute** | Field required or optional for products/variants in a category (size, material, storage, …). |
| **Variant** | Sellable SKU under a product (price, stock, color, size, optional images). |
| **Inventory** | On-hand / reserved / available stock for a variant. |

## Ranking & growth

| Term | Meaning |
| ---- | ------- |
| **Rating** | Aggregate of approved **product reviews** (not pseudo scores). |
| **Review** | Post-delivery buyer feedback; may require moderation. |
| **Promotion / promo code** | Merchant- or platform-scoped discount code (percent/fixed, targets, expiry, limits). |
| **Rising store** | Newly approved or accelerating-order store surfaced on home. |

## Orders & payments

| Term | Meaning |
| ---- | ------- |
| **Order** | Buyer purchase of line items (may span rules for multi-store as implemented). |
| **Payment proof flow** | Place order → message buyer with pay instructions → offline pay → upload screenshot → merchant **approves/rejects** proof. |
| **Payment proof** | Validated image of transfer receipt attached to the order payment. |
| **Fulfillment** | Pack / ship / deliver lifecycle after payment policy allows. |
| **Order message** | In-app message between merchant (admin sender) and customer about an order. |

## Explicit non-terms (removed or out of product)

| Avoid | Why |
| ----- | --- |
| **Storefront template** | Removed; one marketplace design. |
| **Subdomain tenant website** | Removed; slug is not a host. |
| **Basic / Pro plan (in-app)** | Billing handled off-website; no plan paywall in code. |
| **Payment processor auto-capture** | Out of scope; manual proof instead. |

## Roles (auth)

`STORE_OWNER` · `PLATFORM_ADMIN` · `CUSTOMER` — see Prisma `UserRole`.
