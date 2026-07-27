import { getInternalApiBaseUrl, getPublicApiBaseUrl } from '@/lib/api-base-url'
import type { ApiResponse } from '@shopper/shared'
import type { BrandColors } from '@/lib/store-templates'

function isServer(): boolean {
  return typeof window === 'undefined'
}

function resolveCatalogApiRoot(): string {
  return isServer() ? getInternalApiBaseUrl() : getPublicApiBaseUrl()
}

async function parseEnvelope<T>(
  url: string,
  res: Response,
): Promise<{ data: T | null; devHint?: string }> {
  if (!res.ok) {
    return { data: null, devHint: `${url} — HTTP ${res.status}` }
  }
  let body: unknown
  try {
    body = await res.json()
  } catch {
    return { data: null, devHint: `${url} — response was not JSON` }
  }
  const envelope = body as ApiResponse<T> & { data?: T }
  return { data: (envelope.data ?? null) as T | null }
}

export interface CatalogStoreSummary {
  id: string
  displayName: string
  logoUrl: string | null
  /** Preferred public store path segment */
  slug?: string
  /** Legacy field — use `slug ?? subdomain` */
  subdomain: string
  brandColors: BrandColors | null
  description: string | null
  currency: string
  contactEmail: string | null
  contactPhone: string | null
  averageRating?: number | null
  reviewCount?: number | null
}

export function storePublicSlug(store: Pick<CatalogStoreSummary, 'slug' | 'subdomain'>): string {
  return store.slug ?? store.subdomain
}

export interface CatalogVariantSummary {
  id: string
  sku: string
  title: string
  colorName: string | null
  colorHex: string | null
  size: string | null
  price: number
  compareAt: number | null
  inventory?: {
    available: number
    status: string
  }
}

export interface CatalogProductAttribute {
  key: string
  label: string
  value: string
}

export interface CatalogProductPublic {
  id: string
  name: string
  description: string | null
  vendor: string
  category: string
  tags: string[]
  images: string[]
  primaryImage: string | null
  deliveryEnabled: boolean
  deliveryLocation: string | null
  deliveryPrice: number | null
  priceFrom: number | null
  compareAtFrom: number | null
  createdAt: string
  store: CatalogStoreSummary
  variants: CatalogVariantSummary[]
  averageRating?: number | null
  reviewCount?: number | null
  attributes?: CatalogProductAttribute[]
}

export interface CatalogGroup {
  category: string
  products: CatalogProductPublic[]
  total: number
}

export interface CatalogStoreWithProductCount {
  store: CatalogStoreSummary
  productCount: number
}

export interface CatalogGroupsPayload {
  groups: CatalogGroup[]
  store?: CatalogStoreSummary | null
  stores?: CatalogStoreWithProductCount[]
}

export type CatalogFetchResult = {
  data: CatalogGroupsPayload | null
  devHint?: string
}

export interface CatalogQueryOptions {
  search?: string
  /** @deprecated Prefer storeSlug */
  subdomain?: string | null
  storeSlug?: string | null
  cache?: RequestCache
}

export interface CatalogHomeSectionProduct {
  product: CatalogProductPublic
}

export interface CatalogHomeSectionStore {
  store: CatalogStoreSummary
  productCount?: number
  averageRating?: number | null
}

export interface CatalogHomePayload {
  topRated: CatalogProductPublic[]
  newArrivals: CatalogProductPublic[]
  risingStores: CatalogStoreWithProductCount[]
  onPromotion: CatalogProductPublic[]
}

export type CatalogHomeFetchResult = {
  data: CatalogHomePayload | null
  devHint?: string
}

export interface CatalogStoresPayload {
  stores: CatalogStoreWithProductCount[]
  total?: number
}

export type CatalogStoresFetchResult = {
  data: CatalogStoresPayload | null
  devHint?: string
}

export type CatalogStoreFetchResult = {
  data: CatalogStoreSummary | null
  devHint?: string
}

export interface PromoValidationResult {
  valid: boolean
  code: string
  discountType?: 'PERCENT' | 'FIXED'
  discountValue?: number
  message?: string
}

/** Server-side fetch for marketplace home sections. Falls back to groups if /home is missing. */
export async function fetchCatalogHome(
  options: { cache?: RequestCache } = {},
): Promise<CatalogHomeFetchResult> {
  const root = resolveCatalogApiRoot()
  const url = `${root}/catalog/home`

  const controller = new AbortController()
  const timeoutMs = 12_000
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  let res: Response
  try {
    res = await fetch(url, {
      cache: options.cache ?? 'no-store',
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    })
  } catch (err) {
    clearTimeout(timer)
    // Do NOT fall back to /catalog/groups (loads thousands of rows and can hang Neon).
    const msg = err instanceof Error ? err.message : 'Network error'
    return {
      data: {
        topRated: [],
        newArrivals: [],
        risingStores: [],
        onPromotion: [],
      },
      devHint: `${url} — ${msg}`,
    }
  }
  clearTimeout(timer)

  if (res.status === 404) {
    return {
      data: {
        topRated: [],
        newArrivals: [],
        risingStores: [],
        onPromotion: [],
      },
      devHint: `${url} — HTTP 404`,
    }
  }

  const parsed = await parseEnvelope<CatalogHomePayload>(url, res)
  if (!parsed.data) {
    return {
      data: {
        topRated: [],
        newArrivals: [],
        risingStores: [],
        onPromotion: [],
      },
      devHint: parsed.devHint,
    }
  }

  return {
    data: {
      topRated: parsed.data.topRated ?? [],
      newArrivals: parsed.data.newArrivals ?? [],
      risingStores: parsed.data.risingStores ?? [],
      onPromotion: parsed.data.onPromotion ?? [],
    },
  }
}

async function buildHomeFallbackFromGroups(
  cache?: RequestCache,
  devHint?: string,
): Promise<CatalogHomeFetchResult> {
  const groups = await fetchCatalogGroups({ cache })
  if (!groups.data) {
    return { data: null, devHint: devHint ?? groups.devHint }
  }

  const products = groups.data.groups.flatMap((g) => g.products)
  const byNewest = [...products].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )
  const byRating = [...products].sort(
    (a, b) => (b.averageRating ?? 0) - (a.averageRating ?? 0),
  )
  const onPromo = products.filter(
    (p) =>
      p.compareAtFrom != null &&
      p.priceFrom != null &&
      p.compareAtFrom > p.priceFrom,
  )

  const risingStores =
    groups.data.stores?.slice(0, 8) ??
    []

  return {
    data: {
      topRated: byRating.slice(0, 8),
      newArrivals: byNewest.slice(0, 8),
      risingStores,
      onPromotion: onPromo.slice(0, 8),
    },
    devHint,
  }
}

export async function fetchStores(
  options: { search?: string; cache?: RequestCache } = {},
): Promise<CatalogStoresFetchResult> {
  const root = resolveCatalogApiRoot()
  const url = new URL(`${root}/catalog/stores`)
  if (options.search?.trim()) {
    url.searchParams.set('search', options.search.trim())
  }

  let res: Response
  try {
    res = await fetch(url.toString(), {
      cache: options.cache ?? 'no-store',
      headers: { Accept: 'application/json' },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Network error'
    return storesFallbackFromGroups(options.cache, `${url.toString()} — ${msg}`)
  }

  if (res.status === 404) {
    return storesFallbackFromGroups(options.cache, `${url.toString()} — HTTP 404`)
  }

  const parsed = await parseEnvelope<CatalogStoresPayload | CatalogStoreWithProductCount[]>(
    url.toString(),
    res,
  )
  if (!parsed.data) {
    return storesFallbackFromGroups(options.cache, parsed.devHint)
  }

  if (Array.isArray(parsed.data)) {
    return { data: { stores: parsed.data, total: parsed.data.length } }
  }

  return {
    data: {
      stores: parsed.data.stores ?? [],
      total: parsed.data.total,
    },
  }
}

async function storesFallbackFromGroups(
  cache?: RequestCache,
  devHint?: string,
): Promise<CatalogStoresFetchResult> {
  const groups = await fetchCatalogGroups({ cache })
  if (!groups.data) {
    return { data: null, devHint: devHint ?? groups.devHint }
  }
  if (groups.data.stores?.length) {
    return {
      data: { stores: groups.data.stores, total: groups.data.stores.length },
      devHint,
    }
  }
  return { data: { stores: [], total: 0 }, devHint }
}

export async function fetchStoreBySlug(
  slug: string,
  options: { cache?: RequestCache } = {},
): Promise<CatalogStoreFetchResult> {
  const root = resolveCatalogApiRoot()
  const url = `${root}/catalog/stores/${encodeURIComponent(slug)}`

  let res: Response
  try {
    res = await fetch(url, {
      cache: options.cache ?? 'no-store',
      headers: { Accept: 'application/json' },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Network error'
    return storeFallbackFromGroups(slug, options.cache, `${url} — ${msg}`)
  }

  if (res.status === 404) {
    return storeFallbackFromGroups(slug, options.cache, `${url} — HTTP 404`)
  }

  const parsed = await parseEnvelope<CatalogStoreSummary>(url, res)
  if (parsed.data) return { data: parsed.data }

  return storeFallbackFromGroups(slug, options.cache, parsed.devHint)
}

async function storeFallbackFromGroups(
  slug: string,
  cache?: RequestCache,
  devHint?: string,
): Promise<CatalogStoreFetchResult> {
  const groups = await fetchCatalogGroups({ storeSlug: slug, cache })
  if (groups.data?.store) {
    return { data: groups.data.store, devHint }
  }
  return { data: null, devHint: devHint ?? groups.devHint }
}

/** Server-side fetch for the public catalog (no auth). */
export async function fetchCatalogGroups(
  searchOrOptions?: string | CatalogQueryOptions,
): Promise<CatalogFetchResult> {
  const options: CatalogQueryOptions =
    typeof searchOrOptions === 'string' || searchOrOptions === undefined
      ? { search: searchOrOptions }
      : searchOrOptions

  const root = resolveCatalogApiRoot()
  const url = new URL(`${root}/catalog/groups`)
  if (options.search?.trim()) {
    url.searchParams.set('search', options.search.trim())
  }
  const slug = options.storeSlug?.trim() || options.subdomain?.trim()
  if (slug) {
    url.searchParams.set('storeSlug', slug)
    // Back-compat for older API
    url.searchParams.set('subdomain', slug)
  }

  let res: Response
  try {
    res = await fetch(url.toString(), {
      cache: options.cache ?? 'no-store',
      next: { revalidate: 0 },
      headers: { Accept: 'application/json' },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Network error'
    return { data: null, devHint: `${url.toString()} — ${msg}` }
  }

  if (!res.ok) {
    return { data: null, devHint: `${url.toString()} — HTTP ${res.status}` }
  }

  let body: unknown
  try {
    body = await res.json()
  } catch {
    return { data: null, devHint: `${url.toString()} — response was not JSON` }
  }

  const envelope = body as ApiResponse<CatalogGroupsPayload> & {
    groups?: CatalogGroupsPayload['groups']
    store?: CatalogGroupsPayload['store']
    stores?: CatalogGroupsPayload['stores']
  }

  const data =
    envelope.data ??
    (Array.isArray(envelope.groups)
      ? {
          groups: envelope.groups,
          store: envelope.store ?? null,
          stores: envelope.stores,
        }
      : null)

  if (!data?.groups) {
    return { data: null, devHint: `${url.toString()} — unexpected JSON shape (missing data.groups)` }
  }

  return {
    data: {
      groups: data.groups,
      store: data.store ?? null,
      stores: data.stores,
    },
  }
}

export type CatalogProductFetchResult = {
  data: CatalogProductPublic | null
  devHint?: string
}

export type GuestOrderSummary = {
  id: string
  orderNumber: string
  storeId: string
  storeName: string
  total: number
  paymentInstructions?: string | null
  paymentMethods?: string[]
}

export type PlaceGuestOrderPayload = {
  customerPhone: string
  customerName?: string
  items: Array<{
    productVariantId: string
    quantity: number
  }>
  promoCode?: string
  paymentMethod?: 'MOBILE_MONEY' | 'BANK_TRANSFER' | 'CASH_ON_DELIVERY' | 'CARD'
}

export type PlaceGuestOrderResult = {
  orders: GuestOrderSummary[]
}

export async function placeGuestOrder(
  payload: PlaceGuestOrderPayload,
): Promise<PlaceGuestOrderResult> {
  const root = resolveCatalogApiRoot()
  const url = `${root}/catalog/orders`

  let res: Response
  try {
    res = await fetch(url, {
      method: 'POST',
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Idempotency-Key': crypto.randomUUID(),
      },
      body: JSON.stringify(payload),
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Network error'
    throw new Error(msg)
  }

  let body: unknown
  try {
    body = await res.json()
  } catch {
    throw new Error(`HTTP ${res.status}`)
  }

  if (!res.ok) {
    const envelope = body as { message?: string | string[] }
    const raw = envelope.message
    const message = Array.isArray(raw) ? raw.join(', ') : raw
    throw new Error(message || `HTTP ${res.status}`)
  }

  const envelope = body as ApiResponse<PlaceGuestOrderResult> & PlaceGuestOrderResult
  const data = envelope.data ?? (Array.isArray(envelope.orders) ? envelope : null)

  if (!data?.orders?.length) {
    throw new Error('Unexpected response from server')
  }

  return { orders: data.orders }
}

export async function validatePromo(
  code: string,
  options: {
    storeId?: string
    subtotal?: number
    lineItems?: Array<{
      productId: string
      productVariantId?: string
      unitPrice: number
      quantity: number
    }>
    customerPhone?: string
  } = {},
): Promise<PromoValidationResult> {
  const root = resolveCatalogApiRoot()
  const url = `${root}/catalog/promo/validate`
  const subtotal = options.subtotal ?? 0
  const lineItems =
    options.lineItems && options.lineItems.length > 0
      ? options.lineItems
      : [
          {
            productId: '00000000-0000-0000-0000-000000000000',
            unitPrice: subtotal,
            quantity: 1,
          },
        ]

  let res: Response
  try {
    res = await fetch(url, {
      method: 'POST',
      cache: 'no-store',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: code.trim(),
        storeId: options.storeId,
        subtotal,
        lineItems,
        customerPhone: options.customerPhone,
      }),
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Network error'
    throw new Error(msg)
  }

  let body: unknown
  try {
    body = await res.json()
  } catch {
    throw new Error(`HTTP ${res.status}`)
  }

  if (!res.ok) {
    const envelope = body as { message?: string | string[] }
    const raw = envelope.message
    const message = Array.isArray(raw) ? raw.join(', ') : raw
    return { valid: false, code: code.trim(), message: message || `HTTP ${res.status}` }
  }

  const envelope = body as ApiResponse<PromoValidationResult> & PromoValidationResult
  const data = envelope.data ?? (typeof envelope.valid === 'boolean' ? envelope : null)
  if (!data) {
    return { valid: false, code: code.trim(), message: 'Unexpected response' }
  }
  return data
}

export async function fetchCatalogProductById(
  id: string,
  options: CatalogQueryOptions = {},
): Promise<CatalogProductFetchResult> {
  const root = resolveCatalogApiRoot()
  const url = new URL(`${root}/catalog/products/${id}`)
  const slug = options.storeSlug?.trim() || options.subdomain?.trim()
  if (slug) {
    url.searchParams.set('storeSlug', slug)
    url.searchParams.set('subdomain', slug)
  }

  let res: Response
  try {
    res = await fetch(url.toString(), {
      cache: options.cache ?? 'no-store',
      headers: { Accept: 'application/json' },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Network error'
    return { data: null, devHint: `${url.toString()} — ${msg}` }
  }

  if (!res.ok) {
    return { data: null, devHint: `${url.toString()} — HTTP ${res.status}` }
  }

  let body: unknown
  try {
    body = await res.json()
  } catch {
    return { data: null, devHint: `${url.toString()} — response was not JSON` }
  }

  const envelope = body as ApiResponse<CatalogProductPublic> & { data?: CatalogProductPublic }
  return { data: envelope.data ?? null }
}


export type ProductReviewPublic = {
  id: string
  rating: number
  title?: string | null
  body?: string | null
  createdAt: string
  status?: string
}

export async function fetchProductReviews(
  productId: string,
): Promise<ProductReviewPublic[]> {
  const root = resolveCatalogApiRoot()
  const url = `${root}/catalog/products/${encodeURIComponent(productId)}/reviews`
  try {
    const res = await fetch(url, { cache: 'no-store', headers: { Accept: 'application/json' } })
    if (!res.ok) return []
    const body = (await res.json()) as { data?: { data?: ProductReviewPublic[] } | ProductReviewPublic[] }
    const payload = body.data
    if (Array.isArray(payload)) return payload
    if (payload && Array.isArray((payload as { data?: ProductReviewPublic[] }).data)) {
      return (payload as { data: ProductReviewPublic[] }).data
    }
    return []
  } catch {
    return []
  }
}

export async function submitProductReview(
  productId: string,
  dto: { rating: number; title?: string; body?: string },
): Promise<void> {
  const { api } = await import('@/lib/axios')
  await api.post(`/catalog/products/${productId}/reviews`, dto)
}
