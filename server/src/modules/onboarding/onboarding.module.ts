import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/common/database/database.module';
import { OnboardingController } from './controllers/onboarding.controller';
import { OnboardingService } from './services/onboarding.service';

@Module({
    imports: [DatabaseModule],
    controllers: [OnboardingController],
    providers: [OnboardingService],
})
export class OnboardingModule {}
