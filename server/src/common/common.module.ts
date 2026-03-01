import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { CacheModule } from './cache/cache.module';
import configs from './config';
import { DatabaseModule } from './database/database.module';
import { CustomLoggerModule } from './logger/logger.module';
import { RequestModule } from './request/request.module';
import { ResponseModule } from './response/response.module';

@Module({
    imports: [
        // Configuration - Global
        ConfigModule.forRoot({
            load: configs,
            isGlobal: true,
            cache: true,
            envFilePath: ['.env'],
            expandVariables: true,
        }),

        // Core Infrastructure
        DatabaseModule,

        // Cross-cutting Concerns
        CustomLoggerModule,
        RequestModule,
        ResponseModule,
        CacheModule,
    ],
    exports: [DatabaseModule, CacheModule],
})
export class CommonModule {}
