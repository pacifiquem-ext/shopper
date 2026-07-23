# OnlineShop.rw Design System (AlignUI)

## Direction

Premium **single marketplace** commerce for Rwanda: refined, high-contrast, calm density. Built on **AlignUI v1.2** tokens and components, styled with Tailwind CSS v4.

**Mandate:** product UI is **100% AlignUI** on redesigned surfaces. Expand `client/src/components/alignui/*` when primitives are missing. Do not introduce parallel kits or template-specific design systems.

Architecture: [`docs/adr/001-single-marketplace.md`](../docs/adr/001-single-marketplace.md).

## Platform shells

| Shell | Audience | Notes |
| ----- | -------- | ----- |
| Marketplace | Buyers | Home algorithms, shop, stores directory, store profile, PDP, cart |
| Auth / onboarding | Merchants & buyers | Login, signup, verify, store setup |
| Merchant dashboard | Store owners | Products, inventory, orders, payment proofs, settings |
| Platform admin | `PLATFORM_ADMIN` | KYC, categories, promos, reviews |

One visual language across all four. No per-store storefront templates.

## Tokens

| Role | Token | Hex |
| ---- | ----- | --- |
| Primary | `primary-base` | `#1daf61` (green-600) |
| Primary hover | `primary-darker` | `#178c4e` |
| Primary soft | `primary-alpha-10` | green alpha |
| Neutrals | `bg-*` / `text-*` / `stroke-*` | gray scale |
| Error | `error-base` | `#fb3748` |
| Warning | `warning-base` | `#fa7319` |
| Info | `information-base` | `#335cff` |

- Canvas: `bg-bg-weak-50`
- Surfaces: `bg-bg-white-0` + `border-stroke-soft-200` + `rounded-20` cards / `rounded-10` controls
- Shadows: `shadow-regular-xs` / `sm` / `md` or `shadow-soft-card` (+ hover). Avoid opaque black custom shadows.
- Borders: soft hairlines only (`stroke-soft-200`). Never pure black borders on white UI.
- CTAs: one filled primary per view; secondary = outline/neutral stroke.
- Type: Inter (`--font-inter`), AlignUI scales (`text-label-*`, `text-paragraph-*`, `text-title-*`)
- Icons: **Remix Icon** (`@remixicon/react`) on redesigned surfaces

## Components

**Required for product work:**

- `@/components/alignui/*` — expand kit (Button, Input, Label, Badge, Card, Divider, and upcoming Dialog, Select, Table, Sheet, Tabs, Skeleton, Empty, Textarea, Checkbox, Switch, Pagination, Dropdown, …)

**Migration only:**

- `@/components/ui/*` may temporarily re-export AlignUI wrappers; call sites on redesigned routes must move to AlignUI.

Patterns:

- Buttons: `w-fit` unless full-width is intentional
- Modals/sheets: `rounded-20`
- Focus: AlignUI focus shadows
- Loading / empty / error: shared AlignUI-based primitives — no raw browser spinners or unstyled errors

## Media / image quality

Uploads (product gallery, logo, payment proof) must enforce:

| Rule | Guidance (tune in implementation) |
| ---- | --------------------------------- |
| MIME | JPEG, PNG, WebP |
| Max file size | e.g. 5 MB product / 3 MB proof |
| Min dimensions | e.g. product ≥ 800×800; logo ≥ 128×128; proof ≥ 600×400 |
| Max dimensions | e.g. ≤ 4096 on longest edge |
| Aspect | Reject extreme ratios (e.g. thinner than 1:4) |

Client pre-check + server validation. Clear i18n errors on failure.

## Motion

- Prefer CSS transitions and AlignUI-friendly micro-interactions.
- Honor `prefers-reduced-motion`.
- Optional `motion` library only if approved for a specific phase.

## Anti-patterns

- Per-store storefront templates or Host-based “tenant websites”
- Mixed brand terracotta + sage leftovers
- `window.alert` / `confirm`
- Hardcoded user-facing English without i18n
- Non-AlignUI component libraries on product surfaces
- Unvalidated arbitrary image uploads
- In-app subscription / Pro upgrade chrome

## Removed: choosable storefront templates

Classic Market / Vibrant Market / Night Market as separate store websites are **retired**. Store logo and optional brand colors may still appear on the **marketplace store profile**, not as a separate themed site.

## Transactional email

Server HTML emails use `server/src/common/mail/` (green header bar, rounded-20 card, Inter). Helpers: welcome, password reset, order confirmation, store approved.
