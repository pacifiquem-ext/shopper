import {
    Body,
    Controller,
    Get,
    Put,
    Query,
    Request,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiOperation,
    ApiQuery,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { PublicRoute } from '../../../common/request/decorators/request.public.decorator';
import { OnboardingService } from '../services/onboarding.service';
import { UpdateDraftDto } from '../dtos/draft.dto';
import { SubmitStoreDto } from '../dtos/submit-store.dto';

@ApiTags('Store Onboarding')
@ApiBearerAuth()
@Controller({ path: 'onboarding', version: '1' })
export class OnboardingController {
    constructor(private readonly onboardingService: OnboardingService) {}

    @Get('draft')
    @ApiOperation({
        summary:
            'Retrieve or initialize the active user store ONBOARDING draft',
    })
    @ApiResponse({ status: 200, description: 'Store Draft fetched' })
    async getDraft(@Request() req: any) {
        return this.onboardingService.getDraft(req.user.id);
    }

    @Put('draft')
    @ApiOperation({
        summary:
            'Update or save ongoing store onboarding progress (no expiration)',
    })
    @ApiResponse({ status: 200, description: 'Store Draft saved' })
    async updateDraft(
        @Request() req: any,
        @Body() updateDraftDto: UpdateDraftDto,
    ) {
        return this.onboardingService.updateDraft(req.user.id, updateDraftDto);
    }

    @PublicRoute()
    @Get('check-slug')
    @ApiOperation({
        summary: 'Real-time check for store slug availability',
    })
    @ApiQuery({
        name: 'slug',
        required: true,
        type: String,
        description: 'Requested store slug',
    })
    @ApiResponse({
        status: 200,
        description: 'Availability status returned correctly',
    })
    async checkSlugAvailability(@Query('slug') slug: string) {
        return this.onboardingService.checkSlugAvailability(slug);
    }

    /** @deprecated Prefer check-slug */
    @PublicRoute()
    @Get('check-subdomain')
    @ApiOperation({
        summary: 'Deprecated alias for check-slug',
        deprecated: true,
    })
    @ApiQuery({
        name: 'subdomain',
        required: false,
        type: String,
    })
    @ApiQuery({
        name: 'slug',
        required: false,
        type: String,
    })
    @ApiResponse({
        status: 200,
        description: 'Availability status returned correctly',
    })
    async checkSubdomainAvailability(
        @Query('subdomain') subdomain?: string,
        @Query('slug') slug?: string,
    ) {
        return this.onboardingService.checkSlugAvailability(
            slug || subdomain || '',
        );
    }

    @Put('submit')
    @ApiOperation({ summary: 'Submit full store profile for KYC Admin review' })
    @ApiResponse({ status: 201, description: 'Store successfully submitted' })
    async submitStore(
        @Request() req: any,
        @Body() submitStoreDto: SubmitStoreDto,
    ) {
        return this.onboardingService.submitStore(req.user.id, submitStoreDto);
    }
}
