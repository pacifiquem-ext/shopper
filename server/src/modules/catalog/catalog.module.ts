import { Module } from '@nestjs/common';

import { DatabaseModule } from '../../common/database/database.module';
import { OrdersModule } from '../orders/orders.module';
import { CatalogController } from './catalog.controller';
import { CatalogService } from './catalog.service';
import { ShopperProfileService } from './services/shopper-profile.service';

@Module({
    imports: [DatabaseModule, OrdersModule],
    controllers: [CatalogController],
    providers: [CatalogService, ShopperProfileService],
    exports: [ShopperProfileService],
})
export class CatalogModule {}
