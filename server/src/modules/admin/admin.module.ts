import { Module } from '@nestjs/common';
import { AdminStoreController } from './controllers/admin-store.controller';
import { AdminStoreService } from './services/admin-store.service';
import { DatabaseModule } from '../../common/database/database.module';

@Module({
    imports: [DatabaseModule],
    controllers: [AdminStoreController],
    providers: [AdminStoreService],
})
export class AdminModule {}
