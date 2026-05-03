---
trigger: always_on
---

# Next.js Client Architecture Rules

## Core Principles
- Clear separation between server and client components
- Strict layer contracts: pages → services → API
- Zero prop-drilling; Zustand for cross-component state
- All user-facing text must be translatable
- No inline logic that belongs in services or stores

## Directory Structure

```
src/
├── app/[locale]/           # App Router — all routes under locale segment
│   ├── (auth)/             # Route group: login, signup, forgot/reset-password, verify-phone
│   ├── (onboarding)/       # Route group: store setup flow
│   └── dashboard/          # Protected merchant dashboard routes
├── components/
│   ├── ui/                 # shadcn/ui base components — DO NOT modify
│   ├── auth/               # Auth-specific components
│   ├── dashboard/
│   │   ├── shared/         # Reusable dashboard components (header, sidebar, filters)
│   │   ├── products/
│   │   ├── orders/
│   │   └── inventory/
│   └── store-onboarding/
├── services/               # API call layer (Axios)
├── store/                  # Zustand stores
├── hooks/                  # Custom React hooks
├── validations/            # Zod schemas
├── types/                  # TypeScript type definitions
├── i18n/locales/           # Translation JSON files (en.json, rw.json)
├── lib/
│   ├── axios.ts            # Configured Axios instance
│   └── utils.ts            # cn() and other utilities
└── utils/constants.ts      # App-wide constants
```

## Server vs Client Components

**Rule:** Default to Server Components. Add `'use client'` only when required.

**Requires `'use client'`:**
- React hooks (`useState`, `useEffect`, `useMemo`, etc.)
- Event handlers (`onClick`, `onChange`, etc.)
- Zustand store access
- `useTranslations` from next-intl
- Browser-only APIs

```typescript
// ✅ CORRECT — interactive component needs 'use client'
'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'

export function ProductFormModal({ open, onOpenChange }: ProductFormModalProps) {
  const t = useTranslations('dashboard')
  const [isSubmitting, setIsSubmitting] = useState(false)
  // ...
}

// ✅ CORRECT — layout with no interactivity stays as server component
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#fbfbfa]">
      <DashboardSidebar />
      <main className="flex h-full flex-1 flex-col overflow-y-auto">{children}</main>
    </div>
  )
}
```

## Routing Conventions

**All routes live under `[locale]`** — never create routes outside this segment.

**Route Groups** (do not appear in URL):
- `(auth)` — public authentication pages
- `(onboarding)` — store setup flow

**Navigation:** ALWAYS use the locale-aware helpers, never `next/navigation` directly.

```typescript
// ✅ CORRECT
import { useRouter, Link, redirect } from '@/i18n/navigation'

// ❌ INCORRECT — loses locale context
import { useRouter } from 'next/navigation'
import Link from 'next/link'
```

**Route paths** use the `ROUTES` constants from `@/utils/constants`.

```typescript
// ✅ CORRECT
import { ROUTES } from '@/utils/constants'
router.push(ROUTES.DASHBOARD)

// ❌ INCORRECT
router.push('/dashboard')
```

## Component Rules

### Naming

| Type | Convention | Example |
|------|------------|---------|
| Pages | `default export`, PascalCase fn | `export default function ProductsPage()` |
| Feature components | kebab-case filename, named export | `product-form-modal.tsx` → `export function ProductFormModal` |
| UI base (shadcn) | kebab-case filename | `button.tsx`, `dialog.tsx` |
| Hooks | `use-` prefix, kebab-case | `use-mobile.tsx` |
| Stores | `{domain}.store.ts` | `auth.store.ts` |
| Services | `{domain}.service.ts` | `products.service.ts` |
| Types | kebab-case in `src/types/` | `dashboard.ts` |
| Validations | `{domain}.ts` in `src/validations/` | `auth.ts` |

### Props Interface

Always define an explicit interface for component props. Never use inline `{ prop: type }`.

```typescript
// ✅ CORRECT
interface ProductViewSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  productId: string
}

export function ProductViewSheet({ open, onOpenChange, productId }: ProductViewSheetProps) { ... }

// ❌ INCORRECT
export function ProductViewSheet({ open, onOpenChange, productId }: { open: boolean; onOpenChange: (open: boolean) => void; productId: string }) { ... }
```

### Component Variants (shadcn pattern)

Use `class-variance-authority` (`cva`) for components with visual variants. Never branch with if/ternary chains for Tailwind classes.

```typescript
// ✅ CORRECT
const badgeVariants = cva('inline-flex items-center rounded-full', {
  variants: {
    variant: {
      default: 'bg-brand-900 text-white',
      outline: 'border border-brand-900 text-brand-900',
    },
  },
  defaultVariants: { variant: 'default' },
})

// ❌ INCORRECT
const className = isOutline ? 'border border-brand-900 text-brand-900' : 'bg-brand-900 text-white'
```

## Services Layer

**Purpose:** All HTTP communication. Components NEVER call Axios or `fetch` directly.

**Location:** `src/services/{domain}.service.ts`

**Pattern:**

```typescript
// ✅ CORRECT
// src/services/products.service.ts
import { api } from '@/lib/axios'
import type { ApiResponse, ProductApi, ProductListApi, ProductFiltersApi } from '@/types/dashboard'

export const productsService = {
  async getAll(filters: ProductFiltersApi = {}): Promise<ApiResponse<ProductListApi>> {
    const params = new URLSearchParams()
    if (filters.page) params.set('page', String(filters.page))
    if (filters.limit) params.set('limit', String(filters.limit))
    const qs = params.toString()
    return (await api.get(`/products${qs ? `?${qs}` : ''}`)) as ApiResponse<ProductListApi>
  },

  async create(dto: CreateProductPayload): Promise<ApiResponse<ProductApi>> {
    return (await api.post('/products', dto)) as ApiResponse<ProductApi>
  },

  async exportCsv(): Promise<Blob> {
    return (await api.get('/products/export', { responseType: 'blob' })) as unknown as Blob
  },
}

// ❌ INCORRECT — API call inside a component
export default function ProductsPage() {
  useEffect(() => {
    axios.get('/products').then(...)
  }, [])
}
```

**API Response Wrapper:** All service methods return `ApiResponse<T>`.

```typescript
export interface ApiResponse<T = unknown> {
  statusCode: number
  message: string
  timestamp: string
  data: T
}
```

Always extract `.data` when consuming service responses:

```typescript
// ✅ CORRECT
const response = await productsService.getAll(filters)
const products = response.data.items
```

## State Management (Zustand)

**Location:** `src/store/{domain}.store.ts`

**Rules:**
- One store per domain
- Store holds state + async actions together
- Persist only tokens/user identity, never large lists
- Loading states are store-owned, not component-local

```typescript
// ✅ CORRECT
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { authService } from '@/services/auth.service'
import type { LoginInput } from '@/validations/auth'

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isLoading: boolean
  login: (data: LoginInput) => Promise<boolean>
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,

      logout: () => set({ user: null, accessToken: null, refreshToken: null }),

      login: async (data) => {
        set({ isLoading: true })
        try {
          const response = await authService.login(data)
          set({ user: response.data.user, accessToken: response.data.accessToken })
          return true
        } catch {
          return false
        } finally {
          set({ isLoading: false })
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
      }),
    }
  )
)

// ❌ INCORRECT — business logic and API calls inside component
const [user, setUser] = useState(null)
const handleLogin = async () => {
  const res = await axios.post('/auth/login', data)
  setUser(res.data.user)
  localStorage.setItem('token', res.data.accessToken)
}
```

## Forms

**Framework:** `react-hook-form` + `zod` resolver. No exceptions.

**Schemas** live in `src/validations/{domain}.ts`.

```typescript
// ✅ CORRECT
// src/validations/auth.ts
export const loginSchema = z.object({
  phoneNumber: z
    .string()
    .min(1, 'Phone number is required')
    .regex(/^\+[1-9]\d{1,14}$/, 'Invalid phone format (E.164)'),
  password: z.string().min(1, 'Password is required'),
})

export type LoginInput = z.infer<typeof loginSchema>

// ❌ INCORRECT — inline validation
const handleSubmit = (data: any) => {
  if (!data.phoneNumber) alert('Phone required')
}
```

**Form component pattern:**

```typescript
// ✅ CORRECT
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginInput } from '@/validations/auth'
import { Form, FormField, FormItem, FormControl, FormMessage } from '@/components/ui/form'

const form = useForm<LoginInput>({
  resolver: zodResolver(loginSchema),
  defaultValues: { phoneNumber: '', password: '' },
})

return (
  <Form {...form}>
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FormField
        control={form.control}
        name="phoneNumber"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </form>
  </Form>
)
```

## Styling

**Rule:** Tailwind utility classes ONLY. No CSS modules, no inline `style` props, no raw CSS files (except `globals.css`).

**Class merging:** ALWAYS use `cn()` from `@/lib/utils` when combining conditional classes.

```typescript
// ✅ CORRECT
import { cn } from '@/lib/utils'

<div className={cn('flex items-center rounded-md', isActive && 'bg-brand-900 text-white', className)} />

// ❌ INCORRECT
<div style={{ display: 'flex', backgroundColor: isActive ? '#1d4ed8' : 'transparent' }} />
<div className={`flex items-center ${isActive ? 'bg-brand-900' : ''}`} />
```

**Theme tokens** (from `globals.css`):
- Primary brand: `bg-brand-900` (`#1d4ed8`)
- Error: `text-error-primary` (`#db3246`)
- Use CSS custom property tokens over hardcoded hex values

**Responsive design:** mobile-first with `md:`, `lg:` breakpoint prefixes.

**Dark mode:** Use `dark:` variant classes; managed by `next-themes` via `<ThemeProvider>`.

## i18n — Translations

**Rule:** ALL user-facing strings must use translation keys. Zero hardcoded UI text.

**Translation files:** `src/i18n/locales/en.json` and `rw.json`. Key format: `namespace.context.key`.

```typescript
// ✅ CORRECT
'use client'
import { useTranslations } from 'next-intl'

export function ProductsPage() {
  const t = useTranslations('dashboard')
  return <h1>{t('products.title')}</h1>
}

// Translation file: src/i18n/locales/en.json
{
  "dashboard": {
    "products": {
      "title": "Products"
    }
  }
}

// ❌ INCORRECT
return <h1>Products</h1>
```

**Server components** use `getTranslations` (async) from `next-intl/server`.

**Never use `useTranslations` in a Server Component** — it will error.

```typescript
// ✅ CORRECT (server component)
import { getTranslations } from 'next-intl/server'

export default async function Page() {
  const t = await getTranslations('dashboard')
  return <h1>{t('title')}</h1>
}
```

## TypeScript

**Rules:**
- `strict: true` — no escape hatches
- **NEVER** use `any`; use `unknown` with type narrowing if needed
- Export all public types from `src/types/index.ts`
- Zod-inferred types (`z.infer<typeof schema>`) are the source of truth for form inputs

```typescript
// ✅ CORRECT
function processResponse(data: unknown) {
  if (typeof data === 'object' && data !== null && 'id' in data) {
    return (data as ProductApi).id
  }
}

// ❌ INCORRECT
function processResponse(data: any) {
  return data.id
}
```

**Import aliases** — NEVER use relative path traversal.

```typescript
// ✅ CORRECT
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/auth.store'
import { rootMetadata } from '#/config/root-metadata'

// ❌ INCORRECT
import { Button } from '../../../components/ui/button'
```

## Constants

**Location:** `src/utils/constants.ts`

**Rule:** ZERO hardcoded strings for routes, pagination defaults, limits, or error messages anywhere outside this file.

```typescript
// ✅ CORRECT
import { ROUTES, PAGINATION } from '@/utils/constants'

router.push(ROUTES.DASHBOARD)
const limit = PAGINATION.DEFAULT_LIMIT

// ❌ INCORRECT
router.push('/dashboard')
const limit = 10
```

**Structure:**

```typescript
export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  LOGIN: '/login',
} as const

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
} as const
```

## Data Fetching Pattern

Components fetch data in `useEffect` with a cancellation flag. Use `Promise.allSettled` for parallel calls.

```typescript
// ✅ CORRECT
'use client'

import { useState, useEffect } from 'react'
import { productsService } from '@/services/products.service'
import type { ProductListApi } from '@/types/dashboard'

export default function ProductsPage() {
  const [data, setData] = useState<ProductListApi | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    const fetch = async () => {
      setIsLoading(true)
      try {
        const [productsRes, statsRes] = await Promise.allSettled([
          productsService.getAll(),
          productsService.getStats(),
        ])

        if (cancelled) return

        if (productsRes.status === 'fulfilled') {
          setData(productsRes.value.data)
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    fetch()
    return () => { cancelled = true }
  }, [])
}

// ❌ INCORRECT — no cancellation, direct API call
useEffect(() => {
  axios.get('/products').then(res => setData(res.data))
}, [])
```

## Error Handling

**Automatic:** The Axios interceptor in `src/lib/axios.ts` automatically shows Sonner toasts for API errors. Components do NOT need to catch and toast manually.

**Inline form errors:** Let `<FormMessage />` render `react-hook-form` field errors — never roll custom error display for form fields.

**FORBIDDEN:**
- `console.log` / `console.error` for user-visible error reporting
- `alert()` or `window.confirm()`
- Swallowing errors silently

```typescript
// ✅ CORRECT — interceptor handles toast, component reacts to failure
const success = await login(values)
if (!success) return  // toast already shown by interceptor

// ❌ INCORRECT
try {
  await login(values)
} catch (err) {
  alert('Login failed')
  console.error(err)
}
```

## File Naming

| Type | Pattern | Example |
|------|---------|---------|
| Page | `page.tsx` (default export) | `dashboard/products/page.tsx` |
| Layout | `layout.tsx` (default export) | `dashboard/layout.tsx` |
| Feature component | `{noun}-{type}.tsx` | `product-form-modal.tsx` |
| Hook | `use-{name}.ts(x)` | `use-mobile.tsx` |
| Service | `{domain}.service.ts` | `products.service.ts` |
| Store | `{domain}.store.ts` | `auth.store.ts` |
| Validation | `{domain}.ts` | `auth.ts` |
| Type file | `{domain}.ts` in `types/` | `types/dashboard.ts` |
| Constants | `constants.ts` | `utils/constants.ts` |

Use kebab-case for all file names. Component function names are PascalCase.

## Critical Rules

1. **Server/Client boundary** — `'use client'` only where hooks or events are needed
2. **Routing** — always use `@/i18n/navigation`, never `next/navigation`
3. **API calls** — services layer only; never Axios/fetch in components
4. **State** — Zustand for shared state; `useState` only for local UI state
5. **Forms** — `react-hook-form` + Zod; no manual validation
6. **Translations** — `useTranslations`/`getTranslations` for all UI text
7. **Styling** — Tailwind + `cn()`; no inline styles, no CSS modules
8. **Constants** — `@/utils/constants`; no hardcoded routes, limits, or messages
9. **TypeScript** — no `any`; use `unknown` + narrowing; no relative imports
10. **Errors** — let Axios interceptor handle toasts; use `<FormMessage />` for fields

## Verification Checklist

Before committing client code, verify:

1. **Server/Client** — Is `'use client'` present only where needed?
2. **Routing** — Are all navigations using `@/i18n/navigation`?
3. **Services** — Are all API calls inside `src/services/`?
4. **Translations** — Is every user-facing string behind `t('...')`?
5. **TypeScript** — No `any` types anywhere?
6. **Imports** — All using `@/` or `#/` aliases, no `../..` traversal?
7. **Constants** — No hardcoded route strings or magic numbers?
8. **Forms** — Schema in `src/validations/`, `zodResolver` in `useForm`?
9. **Styling** — Only Tailwind classes with `cn()` for conditionals?
10. **Errors** — No `console.log`, no manual toast calls for API errors?

If ANY fails, the code is incomplete. Check `src/lib/`, `src/store/`, `src/services/`, and `src/utils/constants.ts` for existing patterns.
