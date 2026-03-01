import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { TenantMiddleware } from './tenant.middleware';

@Module({
    imports: [DatabaseModule],
    providers: [TenantMiddleware],
    exports: [TenantMiddleware],
})
export class TenantModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(TenantMiddleware).forRoutes('*');
    }
}
