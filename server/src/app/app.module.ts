import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';

import { CommonModule } from 'src/common/common.module';
import { AuthModule } from 'src/modules/auth/auth.module';
import { ReferencesModule } from 'src/modules/references/references.module';
import { TenantModule } from 'src/common/tenant/tenant.module';
import { AdminModule } from 'src/modules/admin/admin.module';
import { WorkerModule } from 'src/workers/worker.module';

import { HealthController } from './controllers/health.controller';
@Module({
    imports: [
        // Shared Common Services
        CommonModule,

        // Feature Modules
        TenantModule,
        AuthModule,
        ReferencesModule,
        AdminModule,

        // Background Processing
        WorkerModule,

        // Health Check
        TerminusModule,
    ],
    controllers: [HealthController],
})
export class AppModule {}
