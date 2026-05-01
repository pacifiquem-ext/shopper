import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Query,
    Res,
    UseGuards,
    HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiParam,
} from '@nestjs/swagger';
import { InventoryService } from '../services/inventory.service';
import { StoreId } from '../../../common/tenant/decorators/store-id.decorator';
import { AuthUser } from '../../../common/request/decorators/request.user.decorator';
import { JwtAccessGuard } from '../../../common/request/guards/jwt.access.guard';

class AdjustStockDto {
    quantity: number;
    reason: string;
}

@ApiTags('Inventory')
@Controller({ path: 'inventory', version: '1' })
@UseGuards(JwtAccessGuard)
@ApiBearerAuth()
export class InventoryController {
    constructor(private readonly inventoryService: InventoryService) {}

    @Get()
    @ApiOperation({ summary: 'Get all inventory records with filters' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Inventory records retrieved successfully',
    })
    async findAll(@StoreId() storeId: string, @Query() filters: any) {
        return this.inventoryService.findAll(storeId, filters);
    }

    @Get('export')
    @ApiOperation({ summary: 'Export inventory as CSV' })
    @ApiResponse({ status: HttpStatus.OK, description: 'CSV file returned' })
    async exportCsv(
        @StoreId() storeId: string,
        @Res() res: Response,
    ) {
        const csv = await this.inventoryService.exportCsv(storeId);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="inventory.csv"');
        res.send(csv);
    }

    @Get(':variantId')
    @ApiOperation({ summary: 'Get inventory details by variant ID' })
    @ApiParam({ name: 'variantId', description: 'Product Variant ID' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Inventory details retrieved successfully',
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Inventory not found',
    })
    async findByVariantId(
        @Param('variantId') variantId: string,
        @StoreId() storeId: string,
    ) {
        return this.inventoryService.findByVariantId(variantId, storeId);
    }

    @Post(':variantId/adjust')
    @ApiOperation({ summary: 'Adjust stock quantity' })
    @ApiParam({ name: 'variantId', description: 'Product Variant ID' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Stock adjusted successfully',
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Inventory not found',
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Invalid adjustment',
    })
    async adjustStock(
        @Param('variantId') variantId: string,
        @StoreId() storeId: string,
        @AuthUser('userId') userId: string,
        @Body() dto: AdjustStockDto,
    ) {
        return this.inventoryService.adjustStock(
            variantId,
            storeId,
            userId,
            dto.quantity,
            dto.reason,
        );
    }

    @Get(':variantId/events')
    @ApiOperation({ summary: 'Get inventory event history' })
    @ApiParam({ name: 'variantId', description: 'Product Variant ID' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Events retrieved successfully',
    })
    async getEvents(
        @Param('variantId') variantId: string,
        @StoreId() storeId: string,
    ) {
        return this.inventoryService.getEvents(variantId, storeId);
    }
}
