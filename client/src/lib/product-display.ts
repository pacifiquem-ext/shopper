/**
 * UI-only helpers that derive a stable, plausible rating + review count
 * from a product id. Used across the shop until a real review system exists.
 *
 * The values are deterministic per id so the same product always shows the
 * same star average and review count between pages and renders.
 */

function hashString(value: string): number {
    let hash = 0
    for (let i = 0; i < value.length; i++) {
        hash = (hash * 31 + value.charCodeAt(i)) | 0
    }
    return Math.abs(hash)
}

export interface PseudoRating {
    /** 3.6 - 4.9, one decimal place */
    rating: number
    /** 24 - 503 */
    reviews: number
}

export function pseudoRating(productId: string): PseudoRating {
    const hash = hashString(productId || 'product')
    const rating = Math.round((3.6 + (hash % 14) / 10) * 10) / 10
    const reviews = 24 + (hash % 480)
    return { rating, reviews }
}

export function formatRwf(amount: number): string {
    return new Intl.NumberFormat('en-RW', { maximumFractionDigits: 0 }).format(amount)
}

export function discountPercent(
    price: number | null | undefined,
    compareAt: number | null | undefined
): number | null {
    if (!price || !compareAt) return null
    if (compareAt <= price) return null
    return Math.round(((compareAt - price) / compareAt) * 100)
}

export function isNewListing(createdAtIso: string, withinDays = 14): boolean {
    const createdAt = new Date(createdAtIso).getTime()
    if (Number.isNaN(createdAt)) return false
    return Date.now() - createdAt < withinDays * 24 * 60 * 60 * 1000
}
