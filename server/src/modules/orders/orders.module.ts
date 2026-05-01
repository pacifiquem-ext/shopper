import { Module } from '@nestjs/common';
import { OrdersController } from './controllers/orders.controller';
import { PaymentsController } from './controllers/payments.controller';
import { OrdersService } from './services/orders.service';
import { OrdersRepository } from './repositories/orders.repository';
import { DatabaseModule } from '../../common/database/database.module';

@Module({
    imports: [DatabaseModule],
    controllers: [OrdersController, PaymentsController],
    providers: [OrdersService, OrdersRepository],
    exports: [OrdersService, OrdersRepository],
})
export class OrdersModule {}
