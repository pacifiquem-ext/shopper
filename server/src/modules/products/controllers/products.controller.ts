import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
    HttpStatus,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiParam,
} from '@nestjs/swagger';
import { ProductsService } from '../services/products.service';
import { CreateProductDto } from '../dtos/create-product.dto';
import { UpdateProductDto } from '../dtos/update-product.dto';
import { ProductFilterDto } from '../dtos/product-filter.dto';
import { ProductResponseDto, ProductListResponseDto } from '../dtos/product-response.dto';
import { StoreId } from '../../../common/tenant/decorators/store-id.decorator';
import { AuthUser } from '../../../common/request/decorators/request.user.decorator';
import { JwtAccessGuard } from '../../../common/request/guards/jwt.access.guard';

@ApiTags('Products')
@Controller({ path: 'products', version: '1' })
@UseGuards(JwtAccessGuard)
@ApiBearerAuth()
export class ProductsController {
    constructor(private readonly productsService: ProductsService) {}

    @Post()
    @ApiOperation({ summary: 'Create a new product with variants' })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Product created successfully',
        type: ProductResponseDto,
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Invalid input data',
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized',
    })
    async create(
        @StoreId() storeId: string,
        @AuthUser('userId') userId: string,
        @Body() dto: CreateProductDto,
    ) {
        return this.productsService.create(storeId, userId, dto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all products with filters and pagination' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Products retrieved successfully',
        type: ProductListResponseDto,
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized',
    })
    async findAll(
        @StoreId() storeId: string,
        @Query() filters: ProductFilterDto,
    ) {
        return this.productsService.findAll(storeId, filters);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get product by ID' })
    @ApiParam({ name: 'id', description: 'Product ID' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Product retrieved successfully',
        type: ProductResponseDto,
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Product not found',
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized',
    })
    async findById(
        @Param('id') id: string,
        @StoreId() storeId: string,
    ) {
        return this.productsService.findById(id, storeId);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update product' })
    @ApiParam({ name: 'id', description: 'Product ID' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Product updated successfully',
        type: ProductResponseDto,
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Product not found',
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Invalid input data',
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized',
    })
    async update(
        @Param('id') id: string,
        @StoreId() storeId: string,
        @AuthUser('userId') userId: string,
        @Body() dto: UpdateProductDto,
    ) {
        return this.productsService.update(id, storeId, userId, dto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete product' })
    @ApiParam({ name: 'id', description: 'Product ID' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Product deleted successfully',
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Product not found',
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized',
    })
    async delete(
        @Param('id') id: string,
        @StoreId() storeId: string,
    ) {
        return this.productsService.delete(id, storeId);
    }

    @Get(':id/analytics')
    @ApiOperation({ summary: 'Get product performance analytics' })
    @ApiParam({ name: 'id', description: 'Product ID' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Analytics retrieved successfully',
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Product not found',
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized',
    })
    async getAnalytics(
        @Param('id') id: string,
        @StoreId() storeId: string,
    ) {
        return this.productsService.getAnalytics(id, storeId);
    }
}
