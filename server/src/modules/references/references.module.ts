import { Module } from '@nestjs/common';
import { ReferencesController } from './controllers/references.controller';
import { ReferencesService } from './services/references.service';
import { DatabaseModule } from '../../common/database/database.module';

@Module({
    imports: [DatabaseModule],
    controllers: [ReferencesController],
    providers: [ReferencesService],
})
export class ReferencesModule {}
