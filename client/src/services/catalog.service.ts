import { getInternalApiBaseUrl, getPublicApiBaseUrl } from '@/lib/api-base-url'
import type { ApiResponse } from '@onlineshop/shared'

function isServer(): boolean {
  return typeof window === 'undefined'
}


function resolveCatalogApiRoot(): string {
  return isServer() ? getInternalApiBaseUrl() : getPublicApiBaseUrl()
}

import type { BrandColorsWithTemplate, StoreTemplateId } from '@/lib/store-templates'

export type { StoreTemplateId }

export interface CatalogStoreSummary {
  id: string
  displayName: string
  logoUrl: string | null
  subdomain: string
  /** Computed from brandColors.template when served by the API. */
  storeTemplate?: StoreTemplateId
  brandColors: BrandColorsWithTemplate | null
  description: string | null
  currency: string
  contactEmail: string | null
  contactPhone: string | null
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
  /** Technical detail for local debugging (only shown in development). */
  devHint?: string
}

export interface CatalogQueryOptions {
  search?: string
  subdomain?: string | null
  cache?: RequestCache
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
  if (options.subdomain?.trim()) {
    url.searchParams.set('subdomain', options.subdomain.trim())
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
}

export type PlaceGuestOrderPayload = {
  customerPhone: string
  customerName?: string
  items: Array<{
    productVariantId: string
    quantity: number
  }>
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

export async function fetchCatalogProductById(
  id: string,
  options: CatalogQueryOptions = {},
): Promise<CatalogProductFetchResult> {
  const root = resolveCatalogApiRoot()
  const url = new URL(`${root}/catalog/products/${id}`)
  if (options.subdomain?.trim()) {
    url.searchParams.set('subdomain', options.subdomain.trim())
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
