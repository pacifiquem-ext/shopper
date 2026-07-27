import { Inject, Injectable, Logger, Optional, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

import { LruMemoryStore } from '../lru-memory-store';
import { REDIS_CLIENT } from '../constants/cache.constant';

@Injectable()
export class CacheService implements OnModuleDestroy {
    private readonly logger = new Logger(CacheService.name);
    private readonly memory: LruMemoryStore;

    constructor(@Optional() @Inject(REDIS_CLIENT) private readonly redis: Redis | null) {
        const maxItems = Number(process.env.CACHE_MAX_ITEMS || 10_000);
        this.memory = new LruMemoryStore(Number.isFinite(maxItems) ? maxItems : 10_000);
        if (!this.redis) {
            this.logger.log('Cache: lru-cache in-process store');
        }
    }

    async onModuleDestroy(): Promise<void> {
        if (this.redis) {
            await this.redis.quit();
        }
        this.memory.flush();
    }

    async get<T = string>(key: string): Promise<T | null> {
        const value = this.redis
            ? await this.redis.get(key)
            : this.memory.get(key);
        if (value === null) return null;
        try {
            return JSON.parse(value) as T;
        } catch {
            return value as unknown as T;
        }
    }

    async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
        const serialised =
            typeof value === 'string' ? value : JSON.stringify(value);
        if (this.redis) {
            if (ttlSeconds !== undefined && ttlSeconds > 0) {
                await this.redis.set(key, serialised, 'EX', ttlSeconds);
            } else {
                await this.redis.set(key, serialised);
            }
            return;
        }
        this.memory.set(key, serialised, ttlSeconds);
    }

    async del(...keys: string[]): Promise<void> {
        if (keys.length === 0) return;
        if (this.redis) {
            await this.redis.del(...keys);
            return;
        }
        this.memory.del(...keys);
    }

    async exists(key: string): Promise<boolean> {
        if (this.redis) {
            return (await this.redis.exists(key)) > 0;
        }
        return this.memory.exists(key);
    }

    async keys(pattern: string): Promise<string[]> {
        if (this.redis) {
            return this.redis.keys(pattern);
        }
        return this.memory.keys(pattern);
    }

    async hset(key: string, field: string, value: unknown): Promise<void> {
        const serialised =
            typeof value === 'string' ? value : JSON.stringify(value);
        if (this.redis) {
            await this.redis.hset(key, field, serialised);
            return;
        }
        this.memory.hset(key, field, serialised);
    }

    async hget<T = string>(key: string, field: string): Promise<T | null> {
        const value = this.redis
            ? await this.redis.hget(key, field)
            : this.memory.hget(key, field);
        if (value === null) return null;
        try {
            return JSON.parse(value) as T;
        } catch {
            return value as unknown as T;
        }
    }

    async hgetall<T = Record<string, string>>(key: string): Promise<T | null> {
        if (this.redis) {
            const value = await this.redis.hgetall(key);
            if (!value || Object.keys(value).length === 0) return null;
            return value as unknown as T;
        }
        return this.memory.hgetall(key) as T | null;
    }

    async hdel(key: string, ...fields: string[]): Promise<void> {
        if (fields.length === 0) return;
        if (this.redis) {
            await this.redis.hdel(key, ...fields);
            return;
        }
        this.memory.hdel(key, ...fields);
    }

    async incr(key: string): Promise<number> {
        if (this.redis) return this.redis.incr(key);
        return this.memory.incr(key);
    }

    async decr(key: string): Promise<number> {
        if (this.redis) return this.redis.decr(key);
        return this.memory.decr(key);
    }

    async expire(key: string, ttlSeconds: number): Promise<void> {
        if (this.redis) {
            await this.redis.expire(key, ttlSeconds);
            return;
        }
        this.memory.expire(key, ttlSeconds);
    }

    async ttl(key: string): Promise<number> {
        if (this.redis) return this.redis.ttl(key);
        return this.memory.ttl(key);
    }

    async flush(): Promise<void> {
        if (this.redis) {
            await this.redis.flushdb();
            return;
        }
        this.memory.flush();
    }

    isHealthy(): boolean {
        return this.redis ? this.redis.status === 'ready' : true;
    }

    getClient(): Redis | null {
        return this.redis;
    }
}
