import { Module } from '@nestjs/common';
import { ProductsController } from './controllers/products.controller';
import { ProductsService } from './services/products.service';
import { ProductsRepository } from './repositories/products.repository';
import { ProductVariantsRepository } from './repositories/product-variants.repository';
import { DatabaseModule } from '../../common/database/database.module';

@Module({
    imports: [DatabaseModule],
    controllers: [ProductsController],
    providers: [ProductsService, ProductsRepository, ProductVariantsRepository],
    exports: [ProductsService, ProductsRepository, ProductVariantsRepository],
})
export class ProductsModule {}
