import {
    affinityScore,
    hasAffinity,
    popularityScore,
    type RankableProduct,
    type ShopperAffinity,
    type ShopperContext,
} from './shopper-affinity'
import { searchProducts, type SearchHit } from './catalog-search'

export type DiscoverySort = 'for-you' | 'newest' | 'trending' | 'price-asc' | 'price-desc'

export function normalizeSort(sort?: string | null): DiscoverySort {
    if (sort === 'newest' || sort === 'trending' || sort === 'price-asc' || sort === 'price-desc') {
        return sort
    }
    return 'for-you'
}

export function rankCatalog<T extends RankableProduct>(input: {
    products: T[]
    query?: string | null
    affinity?: ShopperAffinity | null
    context?: ShopperContext
    sort?: string | null
}): T[] {
    const { products, query, affinity, sort } = input
    const context = input.context ?? {}
    const mode = normalizeSort(sort)
    const q = query?.trim() ?? ''
    const searchHits: SearchHit[] = q ? searchProducts(products, q) : []
    const searchById = new Map(searchHits.map((hit) => [hit.id, hit.score]))

    const pool =
        q && searchHits.length > 0
            ? products.filter((product) => searchById.has(product.id))
            : q
              ? []
              : products

    const profiled = Boolean(affinity && hasAffinity(affinity))
    const scored = pool.map((product) => {
        const search = searchById.get(product.id) ?? 0
        const affinityValue = affinity ? affinityScore(product, affinity, context) : 0
        const popular = popularityScore(product)
        let score = 0
        if (q) {
            score = search * 1.4 + affinityValue * 0.55 + popular * 0.2
        } else if (mode === 'for-you') {
            score = (profiled ? affinityValue * 1.6 : 0) + popular
        } else if (mode === 'trending') {
            score = popular * 1.4 + affinityValue * 0.4
        } else if (mode === 'newest') {
            score = new Date(product.createdAt).getTime()
        } else if (mode === 'price-asc') {
            score = -(product.priceFrom ?? Number.MAX_SAFE_INTEGER)
        } else if (mode === 'price-desc') {
            score = product.priceFrom ?? -1
        }
        return { product, score }
    })

    scored.sort((a, b) => b.score - a.score || a.product.name.localeCompare(b.product.name))
    return scored.map((row) => row.product)
}
