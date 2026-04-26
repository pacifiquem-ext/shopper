import { Module } from '@nestjs/common';
import { DeliveryZonesController } from './controllers/delivery-zones.controller';
import { DeliveryZonesService } from './services/delivery-zones.service';
import { DeliveryZonesRepository } from './repositories/delivery-zones.repository';
import { DatabaseModule } from '../../common/database/database.module';

@Module({
    imports: [DatabaseModule],
    controllers: [DeliveryZonesController],
    providers: [DeliveryZonesService, DeliveryZonesRepository],
    exports: [DeliveryZonesService],
})
export class DeliveryZonesModule {}
