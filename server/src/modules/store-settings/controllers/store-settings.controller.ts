import { Controller, Get, Put, Body, UseGuards, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { StoreSettingsService } from '../services/store-settings.service';
import { UpdateStoreSettingsDto } from '../dtos/update-store-settings.dto';
import { StoreId } from '../../../common/tenant/decorators/store-id.decorator';
import { JwtAccessGuard } from '../../../common/request/guards/jwt.access.guard';
import { StoreGuard } from '../../../common/request/guards/store.guard';

@ApiTags('Store Settings')
@Controller({ path: 'store/settings', version: '1' })
@UseGuards(JwtAccessGuard, StoreGuard)
@ApiBearerAuth()
export class StoreSettingsController {
    constructor(private readonly storeSettingsService: StoreSettingsService) {}

    @Get()
    @ApiOperation({ summary: 'Get store settings' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Store settings retrieved successfully' })
    async getSettings(@StoreId() storeId: string) {
        return this.storeSettingsService.getSettings(storeId);
    }

    @Put()
    @ApiOperation({ summary: 'Update store settings' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Store settings updated successfully' })
    async updateSettings(
        @StoreId() storeId: string,
        @Body() dto: UpdateStoreSettingsDto,
    ) {
        return this.storeSettingsService.updateSettings(storeId, dto);
    }
}
