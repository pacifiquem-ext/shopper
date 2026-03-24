import { Controller, Get, Query, UseGuards, HttpStatus } from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiQuery,
} from '@nestjs/swagger';
import { AnalyticsService } from '../services/analytics.service';
import { StoreId } from '../../../common/tenant/decorators/store-id.decorator';
import { JwtAccessGuard } from '../../../common/request/guards/jwt.access.guard';

@ApiTags('Analytics')
@Controller({ path: 'analytics', version: '1' })
@UseGuards(JwtAccessGuard)
@ApiBearerAuth()
export class AnalyticsController {
    constructor(private readonly analyticsService: AnalyticsService) {}

    @Get('dashboard')
    @ApiOperation({ summary: 'Get dashboard KPIs and metrics' })
    @ApiQuery({ name: 'period', required: false, enum: ['today', 'week', 'month', 'year'] })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Dashboard metrics retrieved successfully',
    })
    async getDashboardMetrics(
        @StoreId() storeId: string,
        @Query('period') period?: string,
    ) {
        return this.analyticsService.getDashboardMetrics(storeId, period);
    }

    @Get('sales')
    @ApiOperation({ summary: 'Get sales trends over time' })
    @ApiQuery({ name: 'days', required: false, type: Number })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Sales trends retrieved successfully',
    })
    async getSalesTrends(
        @StoreId() storeId: string,
        @Query('days') days?: number,
    ) {
        return this.analyticsService.getSalesTrends(storeId, days ? +days : 7);
    }

    @Get('products/top')
    @ApiOperation({ summary: 'Get top selling products' })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Top products retrieved successfully',
    })
    async getTopProducts(
        @StoreId() storeId: string,
        @Query('limit') limit?: number,
    ) {
        return this.analyticsService.getTopProducts(storeId, limit ? +limit : 10);
    }

    @Get('inventory/summary')
    @ApiOperation({ summary: 'Get inventory summary statistics' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Inventory summary retrieved successfully',
    })
    async getInventorySummary(@StoreId() storeId: string) {
        return this.analyticsService.getInventorySummary(storeId);
    }
}
