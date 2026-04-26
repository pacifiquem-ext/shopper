import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';

import { CommonModule } from 'src/common/common.module';
import { AuthModule } from 'src/modules/auth/auth.module';
import { ReferencesModule } from 'src/modules/references/references.module';
import { TenantModule } from 'src/common/tenant/tenant.module';
import { AdminModule } from 'src/modules/admin/admin.module';
import { OnboardingModule } from 'src/modules/onboarding/onboarding.module';
import { WorkerModule } from 'src/workers/worker.module';
import { ProductsModule } from 'src/modules/products/products.module';
import { InventoryModule } from 'src/modules/inventory/inventory.module';
import { OrdersModule } from 'src/modules/orders/orders.module';
import { AnalyticsModule } from 'src/modules/analytics/analytics.module';
import { StoreSettingsModule } from 'src/modules/store-settings/store-settings.module';
import { DeliveryZonesModule } from 'src/modules/delivery-zones/delivery-zones.module';

import { HealthController } from './controllers/health.controller';

@Module({
    imports: [
        // Shared Common Services
        CommonModule,

        // Feature Modules
        TenantModule,
        AuthModule,
        ReferencesModule,
        AdminModule,
        OnboardingModule,

        // Dashboard Modules
        ProductsModule,
        InventoryModule,
        OrdersModule,
        AnalyticsModule,
        StoreSettingsModule,
        DeliveryZonesModule,

        // Background Processing
        WorkerModule,

        // Health Check
        TerminusModule,
    ],
    controllers: [HealthController],
})
export class AppModule {}
