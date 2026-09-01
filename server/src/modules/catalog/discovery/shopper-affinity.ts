export const SHOPPER_SIGNAL_TYPES = [
    'SEARCH',
    'VIEW_PRODUCT',
    'VIEW_CATEGORY',
    'VIEW_STORE',
    'ADD_CART',
    'WISHLIST',
    'PURCHASE',
] as const

export type ShopperSignalType = (typeof SHOPPER_SIGNAL_TYPES)[number]

export type ShopperSignal = {
    type: ShopperSignalType
    query?: string | null
    productId?: string | null
    storeId?: string | null
    category?: string | null
    tags?: string[]
    price?: number | null
}

export type ShopperAffinity = {
    searches: Array<{ query: string; count: number }>
    categories: Record<string, number>
    stores: Record<string, number>
    products: Record<string, number>
    tags: Record<string, number>
    priceBand: { low: number; mid: number; high: number }
}

export type ShopperContext = {
    country?: string | null
    region?: string | null
    city?: string | null
    deviceType?: 'mobile' | 'tablet' | 'desktop' | null
}

export type RankableProduct = {
    id: string
    name: string
    description?: string | null
    vendor?: string | null
    category: string
    tags: string[]
    priceFrom: number | null
    deliveryLocation?: string | null
    deliveryPrice?: number | null
    ratingAvg?: number
    ratingCount?: number
    createdAt: string
    store: { id: string; displayName?: string }
}

const SIGNAL_WEIGHT: Record<ShopperSignalType, number> = {
    SEARCH: 3,
    VIEW_PRODUCT: 2,
    VIEW_CATEGORY: 1,
    VIEW_STORE: 2,
    ADD_CART: 5,
    WISHLIST: 4,
    PURCHASE: 8,
}

const MID_PRICE = 20000
const HIGH_PRICE = 50000

export function emptyAffinity(): ShopperAffinity {
    return {
        searches: [],
        categories: {},
        stores: {},
        products: {},
        tags: {},
        priceBand: { low: 0, mid: 0, high: 0 },
    }
}

export function normalizeKey(value: string | null | undefined): string {
    return (value ?? '').trim().toLowerCase()
}

function bump(map: Record<string, number>, key: string, amount: number) {
    const normalized = normalizeKey(key)
    if (!normalized) return
    const current = map[normalized] ?? 0
    map[normalized] = current + amount / (1 + current)
}

function priceBand(price: number | null | undefined): 'low' | 'mid' | 'high' | null {
    if (price == null || Number.isNaN(price)) return null
    if (price < MID_PRICE) return 'low'
    if (price < HIGH_PRICE) return 'mid'
    return 'high'
}

export function applySignal(
    affinity: ShopperAffinity,
    signal: ShopperSignal,
): ShopperAffinity {
    const next: ShopperAffinity = {
        searches: [...affinity.searches],
        categories: { ...affinity.categories },
        stores: { ...affinity.stores },
        products: { ...affinity.products },
        tags: { ...affinity.tags },
        priceBand: { ...affinity.priceBand },
    }
    const weight = SIGNAL_WEIGHT[signal.type] ?? 1

    if (signal.query?.trim()) {
        const query = normalizeKey(signal.query)
        const existing = next.searches.find((row) => row.query === query)
        if (existing) existing.count += 1
        else next.searches.unshift({ query, count: 1 })
        next.searches = next.searches.slice(0, 24)
        for (const token of query.split(/\s+/).filter((part) => part.length > 2)) {
            bump(next.tags, token, weight * 0.6)
        }
    }
    if (signal.category) bump(next.categories, signal.category, weight)
    if (signal.storeId) bump(next.stores, signal.storeId, weight)
    if (signal.productId) bump(next.products, signal.productId, weight)
    for (const tag of signal.tags ?? []) bump(next.tags, tag, weight * 0.8)
    const band = priceBand(signal.price)
    if (band) next.priceBand[band] += weight

    return next
}

export function hasAffinity(affinity: ShopperAffinity | null | undefined): boolean {
    if (!affinity) return false
    return (
        affinity.searches.length > 0 ||
        Object.keys(affinity.categories).length > 0 ||
        Object.keys(affinity.stores).length > 0 ||
        Object.keys(affinity.products).length > 0 ||
        Object.keys(affinity.tags).length > 0
    )
}

function lookup(map: Record<string, number>, key: string | null | undefined): number {
    return map[normalizeKey(key)] ?? 0
}

export function affinityScore(
    product: RankableProduct,
    affinity: ShopperAffinity,
    context: ShopperContext = {},
): number {
    let score = 0
    score += lookup(affinity.products, product.id) * 4
    score += lookup(affinity.stores, product.store.id) * 2.4
    score += lookup(affinity.categories, product.category) * 2.2
    for (const tag of product.tags) {
        score += lookup(affinity.tags, tag) * 1.6
    }
    const name = normalizeKey(product.name)
    for (const search of affinity.searches) {
        if (name.includes(search.query) || search.query.split(/\s+/).some((token) => name.includes(token))) {
            score += 1.8 * Math.log2(1 + search.count)
        }
    }

    const band = priceBand(product.priceFrom)
    if (band) {
        const total =
            affinity.priceBand.low + affinity.priceBand.mid + affinity.priceBand.high
        if (total > 0) score += (affinity.priceBand[band] / total) * 1.2
    }

    const locationHay = normalizeKey(
        [context.city, context.region, context.country].filter(Boolean).join(' '),
    )
    const delivery = normalizeKey(product.deliveryLocation)
    if (locationHay && delivery && (locationHay.includes(delivery) || delivery.includes(locationHay.split(' ')[0] ?? ''))) {
        score += 1.1
    }

    if (context.deviceType === 'mobile' && (product.deliveryPrice ?? 0) <= 2000) {
        score += 0.25
    }

    return score
}

export function popularityScore(product: RankableProduct, now = Date.now()): number {
    const rating = product.ratingAvg ?? 0
    const reviews = product.ratingCount ?? 0
    const ageDays = Math.max(
        0,
        (now - new Date(product.createdAt).getTime()) / (1000 * 60 * 60 * 24),
    )
    const recency = Math.max(0, 14 - ageDays) / 14
    return rating * Math.log2(2 + reviews) * 0.35 + recency * 0.8
}
