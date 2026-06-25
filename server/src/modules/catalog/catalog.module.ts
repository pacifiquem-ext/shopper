import { Module } from '@nestjs/common';

import { DatabaseModule } from '../../common/database/database.module';
import { OrdersModule } from '../orders/orders.module';
import { CatalogController } from './catalog.controller';
import { CatalogService } from './catalog.service';

@Module({
    imports: [DatabaseModule, OrdersModule],
    controllers: [CatalogController],
    providers: [CatalogService],
})
export class CatalogModule {}
