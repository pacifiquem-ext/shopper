import { Document } from 'flexsearch'

import type { RankableProduct } from './shopper-affinity'

type SearchDoc = {
    id: string
    name: string
    tags: string
    category: string
    vendor: string
    description: string
}

export type SearchHit = {
    id: string
    score: number
}

const FIELD_WEIGHT: Record<string, number> = {
    name: 9,
    tags: 6,
    category: 5,
    vendor: 3,
    description: 2,
}

export function tokenize(value: string): string[] {
    return value
        .toLowerCase()
        .replace(/[^a-z0-9\s]+/g, ' ')
        .split(/\s+/)
        .filter((token) => token.length > 1)
}

export function levenshtein(a: string, b: string): number {
    if (a === b) return 0
    if (!a.length) return b.length
    if (!b.length) return a.length
    const prev = new Array(b.length + 1)
    const curr = new Array(b.length + 1)
    for (let j = 0; j <= b.length; j++) prev[j] = j
    for (let i = 1; i <= a.length; i++) {
        curr[0] = i
        for (let j = 1; j <= b.length; j++) {
            const cost = a[i - 1] === b[j - 1] ? 0 : 1
            curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost)
        }
        for (let j = 0; j <= b.length; j++) prev[j] = curr[j]
    }
    return prev[b.length]
}

export function buildVocabulary(products: RankableProduct[]): string[] {
    const vocab = new Set<string>()
    for (const product of products) {
        for (const token of tokenize(
            [product.name, product.category, product.vendor, ...(product.tags ?? [])].join(' '),
        )) {
            vocab.add(token)
        }
    }
    return [...vocab]
}

export function expandQueryTokens(query: string, vocabulary: string[]): string[] {
    const tokens = tokenize(query)
    const expanded = new Set<string>(tokens)
    for (const token of tokens) {
        if (token.length < 3 || vocabulary.includes(token)) continue
        const maxDist = token.length <= 4 ? 1 : token.length <= 7 ? 2 : 3
        const prefix = token.slice(0, Math.min(4, token.length))
        const close = vocabulary
            .map((word) => ({
                word,
                distance: levenshtein(token, word),
                prefixed: word.startsWith(prefix) || token.startsWith(word.slice(0, 4)),
            }))
            .filter(
                (row) =>
                    (row.distance > 0 &&
                        row.distance <= maxDist &&
                        Math.abs(row.word.length - token.length) <= maxDist + 1) ||
                    (row.prefixed && token.length >= 4),
            )
            .sort((a, b) => a.distance - b.distance)
            .slice(0, 4)
        for (const row of close) expanded.add(row.word)
    }
    return [...expanded]
}

function toDoc(product: RankableProduct): SearchDoc {
    return {
        id: product.id,
        name: product.name,
        tags: (product.tags ?? []).join(' '),
        category: product.category,
        vendor: product.vendor ?? '',
        description: product.description ?? '',
    }
}

export function createProductSearchIndex(products: RankableProduct[]) {
    const index = new Document({
        tokenize: 'forward',
        encoder: 'LatinBalance',
        document: {
            id: 'id',
            index: [
                { field: 'name', tokenize: 'full', encoder: 'LatinBalance' },
                { field: 'tags', tokenize: 'forward', encoder: 'LatinBalance' },
                { field: 'category', tokenize: 'forward', encoder: 'LatinBalance' },
                { field: 'vendor', tokenize: 'forward', encoder: 'LatinBalance' },
                { field: 'description', tokenize: 'forward', encoder: 'LatinBalance' },
            ],
        },
    })
    for (const product of products) {
        index.add(toDoc(product))
    }
    return index
}

function collectFlexHits(
    index: Document,
    query: string,
): Map<string, number> {
    const scores = new Map<string, number>()
    const raw = index.search(query, {
        limit: 200,
        suggest: true,
    }) as Array<{ field?: string; result?: Array<string | number> }>
    if (!Array.isArray(raw)) return scores
    for (const bucket of raw) {
        const field = bucket.field ?? 'name'
        const weight = FIELD_WEIGHT[field] ?? 1
        const ids = bucket.result ?? []
        ids.forEach((id, rank) => {
            const key = String(id)
            const add = weight / (rank + 1)
            scores.set(key, (scores.get(key) ?? 0) + add)
        })
    }
    return scores
}

export function lexicalScore(product: RankableProduct, query: string): number {
    const tokens = tokenize(query)
    if (tokens.length === 0) return 0
    const name = tokenize(product.name)
    const tags = tokenize((product.tags ?? []).join(' '))
    const category = tokenize(product.category)
    const vendor = tokenize(product.vendor ?? '')
    const description = tokenize(product.description ?? '')
    let score = 0
    let core = 0
    for (const token of tokens) {
        if (name.includes(token)) {
            score += 9
            core += 9
        } else if (name.some((part) => part.startsWith(token) || token.startsWith(part))) {
            score += 6
            core += 6
        }
        if (tags.includes(token)) {
            score += 5
            core += 5
        }
        if (category.includes(token)) {
            score += 4
            core += 4
        }
        if (vendor.includes(token)) {
            score += 3
            core += 3
        }
        if (description.includes(token)) score += 1
    }
    const joinedName = name.join(' ')
    if (joinedName.includes(tokenize(query).join(' '))) {
        score += 8
        core += 8
    }
    return core > 0 ? score : 0
}

export function searchProducts(
    products: RankableProduct[],
    query: string,
    index?: Document,
): SearchHit[] {
    const trimmed = query.trim()
    if (!trimmed) return products.map((product) => ({ id: product.id, score: 0 }))

    const vocabulary = buildVocabulary(products)
    const expanded = expandQueryTokens(trimmed, vocabulary)
    const searchIndex = index ?? createProductSearchIndex(products)
    const flexScores = new Map<string, number>()
    for (const variant of [trimmed, ...expanded]) {
        const hits = collectFlexHits(searchIndex, variant)
        for (const [id, score] of hits) {
            const penalty = variant === trimmed ? 1 : 0.85
            flexScores.set(id, Math.max(flexScores.get(id) ?? 0, score * penalty))
        }
    }

    const expandedQuery = expanded.join(' ')
    const hits: SearchHit[] = []
    for (const product of products) {
        const lexical = Math.max(
            lexicalScore(product, trimmed),
            lexicalScore(product, expandedQuery) * 0.9,
        )
        const flex = flexScores.get(product.id) ?? 0
        const score = flex + lexical
        if (lexical > 0) hits.push({ id: product.id, score })
    }

    return hits.sort((a, b) => b.score - a.score)
}
