import {
    Body,
    Controller,
    Get,
    Header,
    HttpStatus,
    Param,
    Post,
    Query,
    Req,
    Res,
    UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
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
import { IngestShopperSignalsDto } from './dtos/shopper-signal.dto';
import {
    SHOPPER_VISITOR_COOKIE,
    ShopperProfileService,
} from './services/shopper-profile.service';

@ApiTags('Catalog')
@Controller({ path: 'catalog', version: '1' })
export class CatalogController {
    constructor(
        private readonly catalogService: CatalogService,
        private readonly ordersService: OrdersService,
        private readonly shopperProfiles: ShopperProfileService,
    ) {}

    private visitor(req: Request, explicit?: string) {
        return this.shopperProfiles.visitorIdFromRequest(req, explicit)
    }

    private rememberVisitor(res: Response, visitorId: string | null) {
        if (!visitorId) return
        res.cookie(SHOPPER_VISITOR_COOKIE, visitorId, {
            httpOnly: false,
            sameSite: 'lax',
            maxAge: 1000 * 60 * 60 * 24 * 180,
            path: '/',
        })
    }

    @PublicRoute()
    @Get('home')
    @Header('Cache-Control', 'private, no-store')
    @ApiOperation({ summary: 'Marketplace home sections' })
    @ApiResponse({ status: 200, description: 'Home catalog sections' })
    async getHome(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        const visitorId = this.visitor(req)
        this.rememberVisitor(res, visitorId)
        return this.catalogService.getHome(
            visitorId,
            this.shopperProfiles.contextFromRequest(req),
        );
    }

    @PublicRoute()
    @Get('groups')
    @Header('Cache-Control', 'no-store, no-cache, must-revalidate')
    @ApiOperation({
        summary:
            'List all active products from approved stores, grouped by category',
    })
    @ApiResponse({ status: 200, description: 'Catalog groups' })
    async getGroups(
        @Query() query: CatalogQueryDto,
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ) {
        const visitorId = this.visitor(req)
        this.rememberVisitor(res, visitorId)
        return this.catalogService.getCatalogGrouped(query.search, query.storeSlug, {
            visitorId,
            sort: query.sort,
            context: this.shopperProfiles.contextFromRequest(req),
        });
    }

    @PublicRoute()
    @Post('signals')
    @ApiOperation({ summary: 'Ingest first-party shopper signals' })
    async ingestSignals(
        @Body() dto: IngestShopperSignalsDto,
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ) {
        const visitorId = this.visitor(req, dto.visitorId)
        if (!visitorId) {
            return { accepted: 0 }
        }
        this.rememberVisitor(res, visitorId)
        const affinity = await this.shopperProfiles.ingest(
            visitorId,
            dto.events,
            this.shopperProfiles.contextFromRequest(req),
        )
        return { accepted: dto.events.length, visitorId, personalized: true, affinity }
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
        @Req() req: Request,
    ) {
        return this.catalogService.getStoreBySlug(
            slug,
            query.page ?? 1,
            query.limit ?? 20,
            {
                visitorId: this.visitor(req),
                context: this.shopperProfiles.contextFromRequest(req),
            },
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
        return this.catalogService.getProductById(id, query.storeSlug);
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
