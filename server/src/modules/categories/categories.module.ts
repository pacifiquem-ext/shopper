import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../common/database/database.module';
import {
    AdminCategoriesController,
    CategoriesController,
} from './controllers/categories.controller';
import { CategoriesService } from './services/categories.service';

@Module({
    imports: [DatabaseModule],
    controllers: [CategoriesController, AdminCategoriesController],
    providers: [CategoriesService],
    exports: [CategoriesService],
})
export class CategoriesModule {}
