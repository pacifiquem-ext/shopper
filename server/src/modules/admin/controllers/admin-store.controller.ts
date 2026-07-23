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
import { ReviewStatus, StoreStatus, UserRole } from '@prisma/client';
import { AdminStoreService } from '../services/admin-store.service';
import { AllowedRoles } from '../../../common/request/decorators/request.role.decorator';
import { AuthUser } from '../../../common/request/decorators/request.user.decorator';

@ApiTags('Admin / Stores')
@ApiBearerAuth()
@AllowedRoles([UserRole.PLATFORM_ADMIN])
@Controller({ path: 'admin', version: '1' })
export class AdminStoreController {
    constructor(private readonly adminStoreService: AdminStoreService) {}

    @Get('dashboard')
    @ApiOperation({ summary: 'Platform admin dashboard stats' })
    async dashboard() {
        return this.adminStoreService.getDashboardStats();
    }

    @Get('stores')
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
        @Query('take') take?: number,
    ) {
        const parsedTake = take ? parseInt(String(take), 10) : 20;
        return this.adminStoreService.getStores(
            status as StoreStatus,
            skip ? parseInt(String(skip), 10) : 0,
            Math.min(Number.isFinite(parsedTake) ? parsedTake : 20, 100),
        );
    }

    @Get('stores/:id/kyc')
    @ApiOperation({ summary: 'Get full KYC details of a specific store' })
    @ApiResponse({ status: 200, description: 'Store KYC data returned' })
    async getStoreKyc(@Param('id', ParseUUIDPipe) id: string) {
        return this.adminStoreService.getStoreKyc(id);
    }

    @Post('stores/:id/approve')
    @ApiOperation({ summary: 'Approve a submitted store' })
    @ApiResponse({ status: 200, description: 'Store approved' })
    async approveStore(@Param('id', ParseUUIDPipe) id: string) {
        return this.adminStoreService.approveStore(id);
    }

    @Post('stores/:id/reject')
    @ApiOperation({ summary: 'Reject a submitted store' })
    @ApiQuery({ name: 'reason', type: String, required: false })
    @ApiResponse({ status: 200, description: 'Store rejected' })
    async rejectStore(
        @Param('id', ParseUUIDPipe) id: string,
        @Query('reason') reason?: string,
    ) {
        return this.adminStoreService.rejectStore(id, reason);
    }

    @Get('reviews')
    @ApiOperation({ summary: 'List product reviews for moderation' })
    @ApiQuery({ name: 'status', enum: ReviewStatus, required: false })
    @ApiQuery({ name: 'skip', type: Number, required: false })
    @ApiQuery({ name: 'take', type: Number, required: false })
    async listReviews(
        @Query('status') status?: ReviewStatus,
        @Query('skip') skip?: number,
        @Query('take') take?: number,
    ) {
        const parsedTake = take ? parseInt(String(take), 10) : 20;
        return this.adminStoreService.listReviews(
            status,
            skip ? parseInt(String(skip), 10) : 0,
            Math.min(Number.isFinite(parsedTake) ? parsedTake : 20, 100),
        );
    }

    @Post('reviews/:id/approve')
    @ApiOperation({ summary: 'Approve a pending review' })
    async approveReview(
        @Param('id', ParseUUIDPipe) id: string,
        @AuthUser('userId') userId: string,
    ) {
        return this.adminStoreService.moderateReview(
            id,
            ReviewStatus.APPROVED,
            userId,
        );
    }

    @Post('reviews/:id/reject')
    @ApiOperation({ summary: 'Reject a pending review' })
    async rejectReview(
        @Param('id', ParseUUIDPipe) id: string,
        @AuthUser('userId') userId: string,
    ) {
        return this.adminStoreService.moderateReview(
            id,
            ReviewStatus.REJECTED,
            userId,
        );
    }
}
