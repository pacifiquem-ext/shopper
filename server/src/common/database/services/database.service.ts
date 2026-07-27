import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { HealthIndicatorResult } from '@nestjs/terminus';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class DatabaseService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(DatabaseService.name);

    async onModuleInit() {
        // Neon free tier auto-suspends compute after a few minutes of idle.
        // The very first connect after a long sleep can take a few seconds and
        // sometimes fail once while compute spins up — retry a few times.
        const attempts = 4;
        for (let attempt = 1; attempt <= attempts; attempt++) {
            try {
                await this.$connect();
                const provider = process.env.DATABASE_URL?.startsWith('file:')
                    ? 'sqlite'
                    : 'postgresql';
                this.logger.log(`Database connected (${provider})`);
                return;
            } catch (error) {
                const message =
                    error instanceof Error ? error.message : String(error);
                if (attempt === attempts) {
                    throw error;
                }
                const delay = 800 * attempt;
                this.logger.warn(
                    `Initial DB connect failed (attempt ${attempt}/${attempts}). Retrying in ${delay}ms: ${message}`
                );
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }

    async isHealthy(): Promise<HealthIndicatorResult> {
        try {
            await this.$queryRaw`SELECT 1`;
            return Promise.resolve({
                prisma: {
                    status: 'up',
                },
            });
        } catch {
            return Promise.resolve({
                prisma: {
                    status: 'down',
                },
            });
        }
    }
}
