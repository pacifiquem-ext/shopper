# OnlineShop.rw Design System (AlignUI)

## Direction

Premium multi-tenant commerce for Rwanda: **refined, high-contrast, calm density**. Built on **AlignUI v1.2** tokens and free base components, styled with Tailwind CSS v4.

## Platform (marketplace + merchant dashboard)

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
- Type: Inter (`--font-inter`), AlignUI text scales (`text-label-*`, `text-paragraph-*`, `text-title-*`)
- Icons: Remix Icon (`@remixicon/react`)

## Store templates

| Template | CSS class / id | Primary CTA | Accent |
| -------- | -------------- | ----------- | ------ |
| Default / Classic Market | `VIBRANT_MARKET` / `.template-classic-market` | Green `#1daf61` | Orange promos |
| Ishusho Crafts | `ISHUSHO_CRAFTS` / `.template-ishusho` | Purple `#7d52f4` | Pink promos |
| Lake Breeze (CSS ready) | `.template-lake-breeze` | Sky `#2597d0` | — |

## Components

Prefer:

- `@/components/alignui/*` for new UI (Button, Input, Label, Badge, Card, Divider)
- `@/components/ui/*` bridges restyled to AlignUI tokens for existing call sites

Patterns:

- Buttons: `w-fit` unless full-width is intentional; never stretch nav actions
- Modals: `rounded-20`
- Focus: AlignUI focus shadows (`shadow-button-primary-focus`)
- Loading/empty/error: consistent tokens — no raw browser spinners or unstyled error strings

## Anti-patterns

- Mixed brand terracotta + sage leftovers
- `window.alert` / `confirm`
- Hardcoded user-facing English without i18n
- Restaurant-specific flows (removed from product scope)

## Choosable storefront templates

Merchants pick one in **Dashboard → Store settings → Branding**. Choice is stored in `brandColors.template` and applied on storefronts immediately.

| ID | Marketing name | Feel | Primary CTA |
| -- | -------------- | ---- | ----------- |
| `DEFAULT` | **Classic Market** | Light AlignUI green commerce | `#1daf61` |
| `VIBRANT_MARKET` | **Vibrant Market** | Daylight high-energy market | Green + orange promos |
| `ISHUSHO_CRAFTS` | **Night Market** | Dark gallery / craft | Purple + pink accents |

Picker UI: `components/store-templates/shared/store-template-picker.tsx` with mini layout previews.

## Transactional email

Server HTML emails use `server/src/common/mail/` (green header bar, rounded-20 card, Inter). Helpers: welcome, password reset, order confirmation, store approved.
