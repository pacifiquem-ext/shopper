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
            useFactory: (configService: ConfigService): Redis => {
                const logger = new Logger('RedisCache');
                const client = new Redis(
                    configService.getOrThrow<string>('redis.url'),
                    {
                        lazyConnect: true,
                        maxRetriesPerRequest: 0,
                    }
                );

                client.on('error', err => {
                    logger.error(`Redis error: ${err.message}`);
                });

                return client;
            },
        },
        CacheService,
    ],
    exports: [CacheService],
})
export class CacheModule {}
