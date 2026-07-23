import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../common/database/database.module';
import {
    AdminPromotionsController,
    StorePromotionsController,
} from './controllers/promotions.controller';
import { PromotionsService } from './services/promotions.service';

@Module({
    imports: [DatabaseModule],
    controllers: [StorePromotionsController, AdminPromotionsController],
    providers: [PromotionsService],
    exports: [PromotionsService],
})
export class PromotionsModule {}
