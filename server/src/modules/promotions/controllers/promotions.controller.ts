import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseUUIDPipe,
    Post,
    Put,
    UseGuards,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiOperation,
    ApiTags,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { AllowedRoles } from '../../../common/request/decorators/request.role.decorator';
import { JwtAccessGuard } from '../../../common/request/guards/jwt.access.guard';
import { StoreGuard } from '../../../common/request/guards/store.guard';
import { StoreId } from '../../../common/tenant/decorators/store-id.decorator';
import {
    CreatePromotionDto,
    UpdatePromotionDto,
} from '../dtos/promotion.dto';
import { PromotionsService } from '../services/promotions.service';

@ApiTags('Promotions')
@ApiBearerAuth()
@UseGuards(JwtAccessGuard, StoreGuard)
@Controller({ path: 'promotions', version: '1' })
export class StorePromotionsController {
    constructor(private readonly promotionsService: PromotionsService) {}

    @Get()
    @ApiOperation({ summary: 'List store promotions' })
    async list(@StoreId() storeId: string) {
        return this.promotionsService.listForStore(storeId);
    }

    @Post()
    @ApiOperation({ summary: 'Create store promotion' })
    async create(
        @StoreId() storeId: string,
        @Body() dto: CreatePromotionDto,
    ) {
        return this.promotionsService.createStorePromotion(storeId, dto);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update store promotion' })
    async update(
        @StoreId() storeId: string,
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: UpdatePromotionDto,
    ) {
        return this.promotionsService.updateStorePromotion(storeId, id, dto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete store promotion' })
    async remove(
        @StoreId() storeId: string,
        @Param('id', ParseUUIDPipe) id: string,
    ) {
        return this.promotionsService.deleteStorePromotion(storeId, id);
    }
}

@ApiTags('Admin / Promotions')
@ApiBearerAuth()
@AllowedRoles([UserRole.PLATFORM_ADMIN])
@Controller({ path: 'admin/promotions', version: '1' })
export class AdminPromotionsController {
    constructor(private readonly promotionsService: PromotionsService) {}

    @Get()
    @ApiOperation({ summary: 'List platform promotions' })
    async list() {
        return this.promotionsService.listPlatform();
    }

    @Post()
    @ApiOperation({ summary: 'Create platform promotion' })
    async create(@Body() dto: CreatePromotionDto) {
        return this.promotionsService.createPlatformPromotion(dto);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update platform promotion' })
    async update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: UpdatePromotionDto,
    ) {
        return this.promotionsService.updatePlatformPromotion(id, dto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete platform promotion' })
    async remove(@Param('id', ParseUUIDPipe) id: string) {
        return this.promotionsService.deletePlatformPromotion(id);
    }
}
