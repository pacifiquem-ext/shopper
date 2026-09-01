import { applySignal, emptyAffinity } from './shopper-affinity'
import { expandQueryTokens, levenshtein, searchProducts } from './catalog-search'
import { rankCatalog } from './catalog-discovery'

const coffee = {
    id: 'coffee',
    name: 'Sunrise Coffee Beans',
    description: 'Medium roast beans for daily brewing',
    vendor: 'Harvest Market',
    category: 'Groceries',
    tags: ['coffee', 'pantry'],
    priceFrom: 8000,
    deliveryLocation: 'City center',
    deliveryPrice: 1500,
    ratingAvg: 5,
    ratingCount: 4,
    createdAt: '2026-01-01T00:00:00.000Z',
    store: { id: 'harvest' },
}

const headphones = {
    id: 'headphones',
    name: 'Harbor Wireless Headphones',
    description: 'Everyday Bluetooth pair',
    vendor: 'Northline',
    category: 'Electronics',
    tags: ['audio', 'wireless'],
    priceFrom: 45000,
    deliveryLocation: 'City center',
    deliveryPrice: 2500,
    ratingAvg: 4,
    ratingCount: 2,
    createdAt: '2026-02-01T00:00:00.000Z',
    store: { id: 'northline' },
}

const tee = {
    id: 'tee',
    name: 'Coastal Cotton Tee',
    description: 'Light cotton tee',
    vendor: 'Atelier Threads',
    category: 'Fashion',
    tags: ['cotton', 'tee'],
    priceFrom: 15000,
    deliveryLocation: 'City center',
    deliveryPrice: 1500,
    ratingAvg: 5,
    ratingCount: 1,
    createdAt: '2026-03-01T00:00:00.000Z',
    store: { id: 'atelier' },
}

const catalog = [coffee, headphones, tee]

describe('catalog discovery', () => {
    it('treats a one-character coffee typo as a coffee hit', () => {
        const hits = searchProducts(catalog, 'cofee')
        expect(hits[0]?.id).toBe('coffee')
        expect(hits.find((hit) => hit.id === 'headphones')).toBeUndefined()
    })

    it('recovers headphone results from a misspelled query', () => {
        const hits = searchProducts(catalog, 'headfone')
        expect(hits[0]?.id).toBe('headphones')
    })

    it('ranks an exact product name above a weaker field match', () => {
        const hits = searchProducts(catalog, 'coffee beans')
        expect(hits[0]?.id).toBe('coffee')
        expect(hits[0].score).toBeGreaterThan(hits[1]?.score ?? 0)
    })

    it('expands a misspelled token against the catalog vocabulary', () => {
        expect(levenshtein('cofee', 'coffee')).toBe(1)
        const expanded = expandQueryTokens('cofee', ['coffee', 'cotton', 'charger'])
        expect(expanded).toContain('coffee')
    })

    it('boosts products the shopper has been browsing', () => {
        let affinity = emptyAffinity()
        affinity = applySignal(affinity, {
            type: 'VIEW_CATEGORY',
            category: 'Fashion',
            tags: ['cotton'],
        })
        affinity = applySignal(affinity, {
            type: 'ADD_CART',
            productId: 'tee',
            storeId: 'atelier',
            category: 'Fashion',
            tags: ['cotton', 'tee'],
            price: 15000,
        })

        const ranked = rankCatalog({
            products: catalog,
            affinity,
            sort: 'for-you',
        })
        expect(ranked[0].id).toBe('tee')
    })

    it('keeps search relevance first, then applies shopper affinity', () => {
        let affinity = emptyAffinity()
        affinity = applySignal(affinity, {
            type: 'VIEW_PRODUCT',
            productId: 'tee',
            category: 'Fashion',
        })

        const ranked = rankCatalog({
            products: catalog,
            query: 'coffee',
            affinity,
        })
        expect(ranked.map((product) => product.id)).toEqual(['coffee'])
    })
})
