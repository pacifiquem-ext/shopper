import { Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import type { DatabaseService } from '../services/database.service';

/**
 * Prisma error codes that indicate a transient connection problem
 * (e.g. Neon free-tier auto-suspend, cold start, dropped pool, pool full of stale conns).
 * On these we try to reconnect and retry the operation.
 *
 * - P1001 / P1002 / P1008 / P1017: can't reach DB / connection dropped
 * - P2024: pool timeout — usually means the existing pool is full of dead
 *   connections (e.g. Neon went idle while we were holding sockets).
 *   Forcing a $disconnect() drops the stale pool so the next attempt opens
 *   fresh sockets against the now-awake compute.
 */
const RETRYABLE_PRISMA_CODES = new Set([
    'P1001',
    'P1002',
    'P1008',
    'P1017',
    'P2024',
]);

const RETRYABLE_MESSAGE_HINTS = [
    "can't reach database server",
    'connection refused',
    'connection terminated',
    'server has gone away',
    'connection closed',
    'timed out fetching a new connection',
];

const log = new Logger('withDbRetry');

interface WithDbRetryOptions {
    readonly attempts?: number;
    readonly baseDelayMs?: number;
    readonly label?: string;
}

function isRetryable(error: unknown): boolean {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        return RETRYABLE_PRISMA_CODES.has(error.code);
    }
    if (error instanceof Prisma.PrismaClientInitializationError) {
        return true;
    }
    if (error instanceof Error) {
        const msg = error.message.toLowerCase();
        return RETRYABLE_MESSAGE_HINTS.some(hint => msg.includes(hint));
    }
    return false;
}

function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Run a Prisma operation with automatic reconnect-and-retry on transient
 * connection errors (notably P1001 from Neon's serverless auto-suspend).
 *
 * Between attempts we force `$disconnect` + `$connect` so a stale pool is
 * discarded and a fresh one is opened against the now-awake compute.
 */
export async function withDbRetry<T>(
    prisma: DatabaseService,
    operation: () => Promise<T>,
    options: WithDbRetryOptions = {}
): Promise<T> {
    const attempts = Math.max(1, options.attempts ?? 3);
    const baseDelayMs = options.baseDelayMs ?? 600;
    const label = options.label ?? 'db.operation';

    let lastError: unknown;

    for (let attempt = 1; attempt <= attempts; attempt++) {
        try {
            return await operation();
        } catch (error) {
            lastError = error;

            if (attempt === attempts || !isRetryable(error)) {
                throw error;
            }

            const delay = baseDelayMs * 2 ** (attempt - 1);
            log.warn(
                `${label}: transient DB error on attempt ${attempt}/${attempts}, reconnecting and retrying in ${delay}ms`
            );

            try {
                await prisma.$disconnect();
            } catch {
                // ignore — disconnect is best effort
            }

            await sleep(delay);

            try {
                await prisma.$connect();
            } catch (reconnectError) {
                log.warn(
                    `${label}: reconnect attempt ${attempt} failed, will retry: ${
                        reconnectError instanceof Error
                            ? reconnectError.message
                            : String(reconnectError)
                    }`
                );
            }
        }
    }

    throw lastError;
}
