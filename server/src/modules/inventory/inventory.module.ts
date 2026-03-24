import { Module } from '@nestjs/common';
import { InventoryController } from './controllers/inventory.controller';
import { InventoryService } from './services/inventory.service';
import { InventoryRepository } from './repositories/inventory.repository';
import { DatabaseModule } from '../../common/database/database.module';

@Module({
    imports: [DatabaseModule],
    controllers: [InventoryController],
    providers: [InventoryService, InventoryRepository],
    exports: [InventoryService, InventoryRepository],
})
export class InventoryModule {}
