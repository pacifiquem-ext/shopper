import { Global, MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

import { DatabaseModule } from '../database/database.module';
import { JwtAccessGuard } from './guards/jwt.access.guard';
import { RolesGuard } from './guards/roles.guard';
import { StoreGuard } from './guards/store.guard';
import { RequestLoggerMiddleware } from './middlewares/request.middleware';

@Global()
@Module({
    imports: [
        DatabaseModule,
        ThrottlerModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
                throttlers: [
                    {
                        ttl: configService.get('app.throttle.ttl'),
                        limit: configService.get('app.throttle.limit'),
                    },
                ],
            }),
            inject: [ConfigService],
        }),
    ],
    exports: [StoreGuard],
    providers: [
        StoreGuard,
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard,
        },
        {
            provide: APP_GUARD,
            useClass: JwtAccessGuard,
        },
        {
            provide: APP_GUARD,
            useClass: RolesGuard,
        },
    ],
})
export class RequestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(RequestLoggerMiddleware).forRoutes('*');
    }
}
