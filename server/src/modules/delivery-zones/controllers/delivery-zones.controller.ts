import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    UseGuards,
    HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { DeliveryZonesService } from '../services/delivery-zones.service';
import { CreateDeliveryZoneDto } from '../dtos/create-delivery-zone.dto';
import { UpdateDeliveryZoneDto } from '../dtos/update-delivery-zone.dto';
import { StoreId } from '../../../common/tenant/decorators/store-id.decorator';
import { JwtAccessGuard } from '../../../common/request/guards/jwt.access.guard';
import { StoreGuard } from '../../../common/request/guards/store.guard';

@ApiTags('Delivery Zones')
@Controller({ path: 'delivery-zones', version: '1' })
@UseGuards(JwtAccessGuard, StoreGuard)
@ApiBearerAuth()
export class DeliveryZonesController {
    constructor(private readonly deliveryZonesService: DeliveryZonesService) {}

    @Get()
    @ApiOperation({ summary: 'Get all delivery zones for the store' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Delivery zones retrieved successfully' })
    async findAll(@StoreId() storeId: string) {
        return this.deliveryZonesService.findAll(storeId);
    }

    @Post()
    @ApiOperation({ summary: 'Create a new delivery zone' })
    @ApiResponse({ status: HttpStatus.CREATED, description: 'Delivery zone created successfully' })
    async create(@StoreId() storeId: string, @Body() dto: CreateDeliveryZoneDto) {
        return this.deliveryZonesService.create(storeId, dto);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update a delivery zone' })
    @ApiParam({ name: 'id', description: 'Delivery zone ID' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Delivery zone updated successfully' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Delivery zone not found' })
    async update(
        @Param('id') id: string,
        @StoreId() storeId: string,
        @Body() dto: UpdateDeliveryZoneDto,
    ) {
        return this.deliveryZonesService.update(id, storeId, dto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a delivery zone' })
    @ApiParam({ name: 'id', description: 'Delivery zone ID' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Delivery zone deleted successfully' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Delivery zone not found' })
    async delete(@Param('id') id: string, @StoreId() storeId: string) {
        return this.deliveryZonesService.delete(id, storeId);
    }
}
