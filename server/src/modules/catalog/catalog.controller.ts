import { Body, Controller, Get, Header, HttpStatus, Param, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { PublicRoute } from '../../common/request/decorators/request.public.decorator';
import { PlaceGuestOrderDto } from '../orders/dtos/place-guest-order.dto';
import { OrdersService } from '../orders/services/orders.service';
import { CatalogService } from './catalog.service';
import { CatalogQueryDto } from './dtos/catalog-query.dto';

@ApiTags('Catalog')
@Controller({ path: 'catalog', version: '1' })
export class CatalogController {
    constructor(
        private readonly catalogService: CatalogService,
        private readonly ordersService: OrdersService,
    ) {}

    @PublicRoute()
    @Get('groups')
    @Header('Cache-Control', 'no-store, no-cache, must-revalidate')
    @ApiOperation({
        summary: 'List all active products from approved stores, grouped by category',
    })
    @ApiResponse({ status: 200, description: 'Catalog groups' })
    async getGroups(@Query() query: CatalogQueryDto) {
        return this.catalogService.getCatalogGrouped(query.search, query.subdomain);
    }

    @PublicRoute()
    @Get('categories')
    @ApiOperation({
        summary: 'Product category names with item counts (approved stores, active products)',
    })
    @ApiResponse({ status: 200, description: 'Category index' })
    async getCategories() {
        return this.catalogService.listProductCategories();
    }

    @PublicRoute()
    @Get('products/:id')
    @ApiOperation({ summary: 'Get a public product by id (approved store, active product)' })
    @ApiResponse({ status: 200, description: 'Product details' })
    @ApiResponse({ status: 404, description: 'Product not found' })
    async getProduct(
        @Param('id') id: string,
        @Query() query: CatalogQueryDto,
    ) {
        return this.catalogService.getProductById(id, query.subdomain);
    }

    @PublicRoute()
    @Post('orders')
    @ApiOperation({ summary: 'Place a guest order from the public cart (phone required)' })
    @ApiResponse({ status: HttpStatus.CREATED, description: 'Order(s) created for vendor follow-up' })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input or insufficient stock' })
    async placeGuestOrder(@Body() dto: PlaceGuestOrderDto) {
        return this.ordersService.createGuestOrder(dto);
    }
}
