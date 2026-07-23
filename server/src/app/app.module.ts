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
import { CatalogModule } from 'src/modules/catalog/catalog.module';
import { CategoriesModule } from 'src/modules/categories/categories.module';
import { PromotionsModule } from 'src/modules/promotions/promotions.module';

import { HealthController } from './controllers/health.controller';
import { RootController } from './controllers/root.controller';

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
        CatalogModule,
        CategoriesModule,
        PromotionsModule,

        // Background Processing
        WorkerModule,

        // Health Check
        TerminusModule,
    ],
    controllers: [RootController, HealthController],
})
export class AppModule {}
