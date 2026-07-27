import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

import { REDIS_CLIENT } from './constants/cache.constant';
import { CacheService } from './services/cache.service';

@Module({
    imports: [ConfigModule],
    providers: [
        {
            provide: REDIS_CLIENT,
            inject: [ConfigService],
            useFactory: async (configService: ConfigService): Promise<Redis | null> => {
                const logger = new Logger('RedisCache');
                const driver = configService.get<string>('redis.driver') ?? 'memory';
                if (driver === 'memory') {
                    logger.log('CACHE_DRIVER=memory — using lru-cache');
                    return null;
                }

                const url = configService.get<string>('redis.url') || 'redis://localhost:6379';
                const client = new Redis(url, {
                    lazyConnect: true,
                    maxRetriesPerRequest: 1,
                    connectTimeout: 800,
                    retryStrategy: () => null,
                });

                try {
                    await client.connect();
                    await client.ping();
                    return client;
                } catch (error) {
                    const message = error instanceof Error ? error.message : String(error);
                    logger.warn(`Redis unavailable (${message}) — using in-process cache`);
                    client.disconnect();
                    return null;
                }
            },
        },
        CacheService,
    ],
    exports: [CacheService],
})
export class CacheModule {}
