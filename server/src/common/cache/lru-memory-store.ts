import { LRUCache } from 'lru-cache'

const DEFAULT_MAX_ITEMS = 10_000

type ScalarEntry = {
    kind: 'scalar'
    value: string
    perishable: boolean
}

type HashEntry = {
    kind: 'hash'
    fields: Record<string, string>
    perishable: boolean
}

type CacheEntry = ScalarEntry | HashEntry

export class LruMemoryStore {
    private readonly cache: LRUCache<string, CacheEntry>

    constructor(maxItems = DEFAULT_MAX_ITEMS) {
        this.cache = new LRUCache<string, CacheEntry>({
            max: Math.max(1, maxItems),
            ttlAutopurge: true,
            updateAgeOnGet: false,
            updateAgeOnHas: false,
        })
    }

    get(key: string): string | null {
        const entry = this.cache.get(key)
        if (!entry || entry.kind !== 'scalar') return null
        return entry.value
    }

    set(key: string, value: string, ttlSeconds?: number): void {
        this.cache.set(
            key,
            { kind: 'scalar', value, perishable: hasTtl(ttlSeconds) },
            ttlOptions(ttlSeconds)
        )
    }

    del(...keys: string[]): void {
        for (const key of keys) this.cache.delete(key)
    }

    exists(key: string): boolean {
        return this.cache.has(key)
    }

    keys(pattern: string): string[] {
        const regex = globToRegExp(pattern)
        return [...this.cache.keys()].filter((key) => regex.test(key))
    }

    hset(key: string, field: string, value: string): void {
        const current = this.hashEntry(key)
        current.fields[field] = value
        this.cache.set(key, current)
    }

    hget(key: string, field: string): string | null {
        const entry = this.cache.get(key)
        if (!entry || entry.kind !== 'hash') return null
        return entry.fields[field] ?? null
    }

    hgetall(key: string): Record<string, string> | null {
        const entry = this.cache.get(key)
        if (!entry || entry.kind !== 'hash') return null
        const fields = entry.fields
        if (Object.keys(fields).length === 0) return null
        return { ...fields }
    }

    hdel(key: string, ...fields: string[]): void {
        const entry = this.cache.get(key)
        if (!entry || entry.kind !== 'hash') return
        for (const field of fields) delete entry.fields[field]
        this.cache.set(key, entry)
    }

    incr(key: string): number {
        return this.nudge(key, 1)
    }

    decr(key: string): number {
        return this.nudge(key, -1)
    }

    expire(key: string, ttlSeconds: number): void {
        const entry = this.cache.peek(key)
        if (!entry || !hasTtl(ttlSeconds)) return
        this.cache.set(key, { ...entry, perishable: true }, ttlOptions(ttlSeconds))
    }

    ttl(key: string): number {
        if (!this.cache.has(key)) return -2
        const entry = this.cache.peek(key)
        if (!entry?.perishable) return -1
        const remainingMs = this.cache.getRemainingTTL(key)
        if (remainingMs <= 0) return -2
        return Math.max(0, Math.ceil(remainingMs / 1000))
    }

    flush(): void {
        this.cache.clear()
    }

    private hashEntry(key: string): HashEntry {
        const existing = this.cache.get(key)
        if (existing?.kind === 'hash') return existing
        return { kind: 'hash', fields: {}, perishable: false }
    }

    private nudge(key: string, delta: number): number {
        const current = Number(this.get(key) ?? '0')
        const next = (Number.isFinite(current) ? current : 0) + delta
        const remaining = this.ttl(key)
        this.set(key, String(next), remaining > 0 ? remaining : undefined)
        return next
    }
}

function hasTtl(ttlSeconds?: number): boolean {
    return ttlSeconds !== undefined && ttlSeconds > 0
}

function ttlOptions(ttlSeconds?: number): { ttl?: number } {
    return hasTtl(ttlSeconds) ? { ttl: ttlSeconds! * 1000 } : {}
}

function globToRegExp(pattern: string): RegExp {
    const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&')
    return new RegExp(`^${escaped.replace(/\*/g, '.*').replace(/\?/g, '.')}$`)
}
