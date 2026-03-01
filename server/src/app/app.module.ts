import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';

import { CommonModule } from 'src/common/common.module';
import { AuthModule } from 'src/modules/auth/auth.module';
import { WorkerModule } from 'src/workers/worker.module';

import { HealthController } from './controllers/health.controller';
@Module({
    imports: [
        // Shared Common Services
        CommonModule,

        // Feature Modules
        AuthModule,

        // Background Processing
        WorkerModule,

        // Health Check
        TerminusModule,
    ],
    controllers: [HealthController],
})
export class AppModule {}
