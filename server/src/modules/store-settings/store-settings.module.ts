import { Module } from '@nestjs/common';
import { StoreSettingsController } from './controllers/store-settings.controller';
import { StoreSettingsService } from './services/store-settings.service';
import { StoreSettingsRepository } from './repositories/store-settings.repository';
import { DatabaseModule } from '../../common/database/database.module';

@Module({
    imports: [DatabaseModule],
    controllers: [StoreSettingsController],
    providers: [StoreSettingsService, StoreSettingsRepository],
    exports: [StoreSettingsService],
})
export class StoreSettingsModule {}
