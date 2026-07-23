# ADR 001 — Single marketplace (no multi-host storefronts)

**Status:** Accepted  
**Date:** 2026-07-23  
**Deciders:** Product owner + implementation agents  

## Context

OnlineShop.rw was built as multi-merchant platform *and* multi-storefront product: each store could claim a subdomain (`store.onlineshop.rw`), pick a storefront template (Classic / Vibrant / Night Market), and present a branded mini-site. Path/query fallbacks (`/shop/store/:slug`, `?store=`) implemented the same idea without full DNS.

Product direction changed: one shared marketplace website; merchants operate via admin dashboards only; buyers discover products and stores inside that single origin.

## Decision

1. **One public website** at the apex origin. All buyer UX shares one AlignUI design system and chrome.
2. **Store identity** is a unique **slug** (migrated from `subdomain`), used only for marketplace routes such as `/stores/{slug}` — never marketed as `slug.onlineshop.rw`.
3. **Store directory + store profile** remain (`/stores`, `/stores/{slug}`) under marketplace chrome, listing that seller’s products. This is *not* a tenant website.
4. **Remove** Host-based storefront middleware for buyers, storefront template system, and template picker.
5. **Keep** merchant multi-tenancy: JWT ownership, `StoreGuard`, store-scoped products/orders/inventory APIs.
6. **AlignUI 100%** on redesigned surfaces; expand AlignUI kit rather than growing shadcn call sites.
7. **No in-app billing / Basic–Pro paywalls.** Commercial packaging is handled off-website.
8. **Payments** are offline transfer + **payment proof upload** + merchant approve/reject (not a card/MoMo auto-processor).
9. **Image uploads** enforce MIME, size, and dimensions server-side (and client pre-check).

## Consequences

- Onboarding no longer promises a subdomain storefront.
- README/AGENTS product language must describe marketplace + store dashboards.
- Ranking, promos, reviews, category attributes, and platform admin are marketplace features without plan gates.
- Template code and Host tenancy paths become delete targets (see initiative plan Phase B).

## Alternatives considered

- Keep optional custom storefronts for Pro — rejected; Pro/billing removed from product surface.
- Stores as filter facets only — rejected; owner wants browse stores + visit a store’s product list.
