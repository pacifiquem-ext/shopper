import { LruMemoryStore } from './lru-memory-store'

describe('LruMemoryStore', () => {
    it('stores and reads scalar values', () => {
        const store = new LruMemoryStore()
        store.set('greeting', 'hello')
        expect(store.get('greeting')).toBe('hello')
        expect(store.exists('greeting')).toBe(true)
    })

    it('evicts the least recently used scalar when full', () => {
        const store = new LruMemoryStore(2)
        store.set('a', '1')
        store.set('b', '2')
        store.set('c', '3')
        expect(store.get('a')).toBeNull()
        expect(store.get('b')).toBe('2')
        expect(store.get('c')).toBe('3')
    })

    it('expires a key after its ttl', async () => {
        const store = new LruMemoryStore()
        store.set('temp', 'x', 1)
        expect(store.ttl('temp')).toBeGreaterThan(0)
        await new Promise((resolve) => setTimeout(resolve, 1100))
        expect(store.get('temp')).toBeNull()
        expect(store.ttl('temp')).toBe(-2)
    })

    it('increments, decrements, and supports hash fields', () => {
        const store = new LruMemoryStore()
        expect(store.incr('n')).toBe(1)
        expect(store.incr('n')).toBe(2)
        expect(store.decr('n')).toBe(1)

        store.hset('user:1', 'name', 'Ada')
        store.hset('user:1', 'city', 'Kigali')
        expect(store.hget('user:1', 'name')).toBe('Ada')
        expect(store.hgetall('user:1')).toEqual({ name: 'Ada', city: 'Kigali' })
        store.hdel('user:1', 'city')
        expect(store.hget('user:1', 'city')).toBeNull()
    })

    it('matches glob-style keys and flushes', () => {
        const store = new LruMemoryStore()
        store.set('user:1', 'a')
        store.set('user:2', 'b')
        store.set('order:1', 'c')
        expect(store.keys('user:*').sort()).toEqual(['user:1', 'user:2'])
        store.flush()
        expect(store.keys('*')).toEqual([])
    })
})
