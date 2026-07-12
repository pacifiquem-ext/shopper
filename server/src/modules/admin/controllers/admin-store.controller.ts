import {
    Controller,
    Get,
    Param,
    ParseUUIDPipe,
    Post,
    Query,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiOperation,
    ApiQuery,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { StoreStatus, UserRole } from '@prisma/client';
import { AdminStoreService } from '../services/admin-store.service';
import { AllowedRoles } from '../../../common/request/decorators/request.role.decorator';

@ApiTags('Admin / Stores')
@ApiBearerAuth()
@AllowedRoles([UserRole.PLATFORM_ADMIN])
@Controller({ path: 'admin/stores', version: '1' })
export class AdminStoreController {
    constructor(private readonly adminStoreService: AdminStoreService) {}

    @Get()
    @ApiOperation({ summary: 'List stores, optionally filtered by status' })
    @ApiQuery({
        name: 'status',
        enum: [
            'DRAFT',
            'SUBMITTED',
            'UNDER_REVIEW',
            'APPROVED',
            'REJECTED',
            'SUSPENDED',
            'DELETED',
        ],
        required: false,
    })
    @ApiQuery({ name: 'skip', type: Number, required: false })
    @ApiQuery({ name: 'take', type: Number, required: false })
    @ApiResponse({ status: 200, description: 'List of stores' })
    async getStores(
        @Query('status') status?: string,
        @Query('skip') skip?: number,
        @Query('take') take?: number
    ) {
        const parsedTake = take ? parseInt(String(take), 10) : 20;
        return this.adminStoreService.getStores(
            status as StoreStatus,
            skip ? parseInt(String(skip), 10) : 0,
            Math.min(Number.isFinite(parsedTake) ? parsedTake : 20, 100)
        );
    }

    @Get(':id/kyc')
    @ApiOperation({ summary: 'Get full KYC details of a specific store' })
    @ApiResponse({ status: 200, description: 'Store KYC data returned' })
    async getStoreKyc(@Param('id', ParseUUIDPipe) id: string) {
        return this.adminStoreService.getStoreKyc(id);
    }

    @Post(':id/approve')
    @ApiOperation({ summary: 'Approve a submitted store' })
    @ApiResponse({ status: 200, description: 'Store approved' })
    async approveStore(@Param('id', ParseUUIDPipe) id: string) {
        return this.adminStoreService.approveStore(id);
    }

    @Post(':id/reject')
    @ApiOperation({ summary: 'Reject a submitted store' })
    @ApiQuery({ name: 'reason', type: String, required: false })
    @ApiResponse({ status: 200, description: 'Store rejected' })
    async rejectStore(
        @Param('id', ParseUUIDPipe) id: string,
        @Query('reason') reason?: string
    ) {
        return this.adminStoreService.rejectStore(id, reason);
    }
}
