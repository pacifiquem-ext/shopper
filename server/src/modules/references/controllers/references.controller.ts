import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PublicRoute } from '../../../common/request/decorators/request.public.decorator';
import { ReferencesService } from '../services/references.service';

@ApiTags('References')
@Controller({ path: 'references', version: '1' })
export class ReferencesController {
    constructor(private readonly referencesService: ReferencesService) {}

    @PublicRoute()
    @Get('industries')
    @ApiOperation({ summary: 'Get all industry sectors for KYC dropdown' })
    @ApiResponse({ status: 200, description: 'List of industries' })
    async getIndustries() {
        return this.referencesService.getIndustries();
    }

    @PublicRoute()
    @Get('categories')
    @ApiOperation({
        summary:
            'Get business categories, optionally filtered by industry sector',
    })
    @ApiQuery({
        name: 'industrySectorId',
        required: false,
        type: String,
        description: 'Filter by Industry ID',
    })
    @ApiResponse({ status: 200, description: 'List of business categories' })
    async getCategories(@Query('industrySectorId') industrySectorId?: string) {
        return this.referencesService.getCategories(industrySectorId);
    }
}
