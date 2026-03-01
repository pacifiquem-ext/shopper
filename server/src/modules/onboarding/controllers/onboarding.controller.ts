import {
    Body,
    Controller,
    Get,
    Put,
    Query,
    UseGuards,
    Request,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiOperation,
    ApiQuery,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
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
        @Body() updateDraftDto: UpdateDraftDto
    ) {
        return this.onboardingService.updateDraft(req.user.id, updateDraftDto);
    }

    @Get('check-subdomain')
    @ApiOperation({
        summary:
            'Real-time check for subdomain availability and constraint validations',
    })
    @ApiQuery({
        name: 'subdomain',
        required: true,
        type: String,
        description: 'Requested subdomain string',
    })
    @ApiResponse({
        status: 200,
        description: 'Availability status returned correctly',
    })
    async checkSubdomainAvailability(@Query('subdomain') subdomain: string) {
        return this.onboardingService.checkSubdomainAvailability(subdomain);
    }

    @Put('submit')
    @ApiOperation({ summary: 'Submit full store profile for KYC Admin review' })
    @ApiResponse({ status: 201, description: 'Store successfully submitted' })
    async submitStore(
        @Request() req: any,
        @Body() submitStoreDto: SubmitStoreDto
    ) {
        return this.onboardingService.submitStore(req.user.id, submitStoreDto);
    }
}
