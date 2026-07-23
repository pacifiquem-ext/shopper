import {
    Body,
    Controller,
    Get,
    Header,
    HttpStatus,
    Param,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { PublicRoute } from '../../common/request/decorators/request.public.decorator';
import { AuthUser } from '../../common/request/decorators/request.user.decorator';
import { JwtAccessGuard } from '../../common/request/guards/jwt.access.guard';
import { PlaceGuestOrderDto } from '../orders/dtos/place-guest-order.dto';
import { UploadPaymentProofDto } from '../orders/dtos/upload-payment-proof.dto';
import { OrdersService } from '../orders/services/orders.service';
import { CatalogService } from './catalog.service';
import {
    CatalogPaginationDto,
    CatalogQueryDto,
} from './dtos/catalog-query.dto';
import { CreateReviewDto } from './dtos/create-review.dto';
import { PromoValidateDto } from './dtos/promo-validate.dto';

@ApiTags('Catalog')
@Controller({ path: 'catalog', version: '1' })
export class CatalogController {
    constructor(
        private readonly catalogService: CatalogService,
        private readonly ordersService: OrdersService,
    ) {}

    @PublicRoute()
    @Get('home')
    @Header('Cache-Control', 'public, max-age=60')
    @ApiOperation({ summary: 'Marketplace home sections' })
    @ApiResponse({ status: 200, description: 'Home catalog sections' })
    async getHome() {
        return this.catalogService.getHome();
    }

    @PublicRoute()
    @Get('groups')
    @Header('Cache-Control', 'no-store, no-cache, must-revalidate')
    @ApiOperation({
        summary:
            'List all active products from approved stores, grouped by category',
    })
    @ApiResponse({ status: 200, description: 'Catalog groups' })
    async getGroups(@Query() query: CatalogQueryDto) {
        const slug = query.storeSlug || query.subdomain;
        return this.catalogService.getCatalogGrouped(query.search, slug);
    }

    @PublicRoute()
    @Get('categories')
    @ApiOperation({
        summary: 'Product categories (taxonomy or legacy string groups)',
    })
    @ApiResponse({ status: 200, description: 'Category index' })
    async getCategories() {
        return this.catalogService.listProductCategories();
    }

    @PublicRoute()
    @Get('stores')
    @ApiOperation({ summary: 'Paginated approved store directory' })
    @ApiResponse({ status: 200, description: 'Store list' })
    async listStores(@Query() query: CatalogPaginationDto) {
        return this.catalogService.listStores(
            query.page ?? 1,
            query.limit ?? 20,
            query.search,
        );
    }

    @PublicRoute()
    @Get('stores/:slug')
    @ApiOperation({ summary: 'Store profile and products page' })
    @ApiResponse({ status: 200, description: 'Store profile' })
    @ApiResponse({ status: 404, description: 'Store not found' })
    async getStore(
        @Param('slug') slug: string,
        @Query() query: CatalogPaginationDto,
    ) {
        return this.catalogService.getStoreBySlug(
            slug,
            query.page ?? 1,
            query.limit ?? 20,
        );
    }

    @PublicRoute()
    @Get('products/:id')
    @ApiOperation({
        summary: 'Get a public product by id (approved store, active product)',
    })
    @ApiResponse({ status: 200, description: 'Product details' })
    @ApiResponse({ status: 404, description: 'Product not found' })
    async getProduct(
        @Param('id') id: string,
        @Query() query: CatalogQueryDto,
    ) {
        const slug = query.storeSlug || query.subdomain;
        return this.catalogService.getProductById(id, slug);
    }

    @PublicRoute()
    @Get('products/:id/reviews')
    @ApiOperation({ summary: 'List approved public reviews for a product' })
    async listReviews(
        @Param('id') id: string,
        @Query() query: CatalogPaginationDto,
    ) {
        return this.catalogService.listProductReviews(
            id,
            query.page ?? 1,
            query.limit ?? 20,
        );
    }

    @Post('products/:id/reviews')
    @UseGuards(JwtAccessGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Submit a product review (JWT customer)' })
    @ApiResponse({ status: HttpStatus.CREATED, description: 'Review created' })
    async createReview(
        @Param('id') id: string,
        @AuthUser('userId') userId: string,
        @Body() dto: CreateReviewDto,
    ) {
        return this.catalogService.createProductReview(id, userId, dto);
    }

    @PublicRoute()
    @Post('promo/validate')
    @ApiOperation({ summary: 'Validate a promo code against cart lines' })
    async validatePromo(@Body() dto: PromoValidateDto) {
        return this.catalogService.validatePromo(dto);
    }

    @PublicRoute()
    @Post('orders')
    @ApiOperation({
        summary: 'Place a guest order from the public cart (phone required)',
    })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Order(s) created for vendor follow-up',
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Invalid input or insufficient stock',
    })
    async placeGuestOrder(@Body() dto: PlaceGuestOrderDto) {
        return this.ordersService.createGuestOrder(dto);
    }

    @PublicRoute()
    @Get('orders/:id')
    @ApiOperation({
        summary: 'Public order status lookup (requires matching customer phone)',
    })
    async getPublicOrder(
        @Param('id') id: string,
        @Query('phone') phone: string,
    ) {
        return this.ordersService.getPublicOrderByPhone(id, phone);
    }

    @PublicRoute()
    @Post('orders/:id/payment-proof')
    @ApiOperation({
        summary: 'Customer uploads payment proof (verified by phone query)',
    })
    async uploadPaymentProof(
        @Param('id') id: string,
        @Query('phone') phone: string,
        @Body() dto: UploadPaymentProofDto,
    ) {
        return this.ordersService.uploadPaymentProof(id, phone, dto);
    }
}
