import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { registerAs } from '@nestjs/config';

import { APP_ENVIRONMENT } from 'src/app/enums/app.enum';

function stripQuotes(value: string): string {
    return value.trim().replace(/^['"]|['"]$/g, '');
}

function parseCorsOrigins(raw: string | undefined): string[] | true {
    if (!raw || !raw.trim()) {
        return true;
    }
    const parts = raw
        .split(',')
        .map(part => stripQuotes(part))
        .filter(Boolean);
    if (parts.length === 0 || parts.includes('*')) {
        return true;
    }
    return parts;
}

function isPrivateLanHost(host: string): boolean {
    if (host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0') {
        return true;
    }
    if (host.endsWith('.localhost')) return true;
    // RFC1918 + common lab ranges so LAN IP access works in local APP_ENV
    if (/^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(host)) return true;
    if (/^192\.168\.\d{1,3}\.\d{1,3}$/.test(host)) return true;
    if (/^172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}$/.test(host)) return true;
    return false;
}

function isLocalDevOrigin(origin: string): boolean {
    try {
        return isPrivateLanHost(new URL(origin).hostname);
    } catch {
        return false;
    }
}

export default registerAs('app', (): Record<string, any> => {
    const env = process.env.APP_ENV ?? APP_ENVIRONMENT.LOCAL;
    const isLocal =
        env === APP_ENVIRONMENT.LOCAL ||
        env === APP_ENVIRONMENT.DEVELOPMENT ||
        process.env.NODE_ENV !== 'production';

    const configuredOrigins = parseCorsOrigins(process.env.APP_CORS_ORIGINS);

    const corsConfig: CorsOptions = {
        origin: (origin, callback) => {
            // Same-origin / curl / server-to-server (no Origin header)
            if (!origin) {
                callback(null, true);
                return;
            }

            if (configuredOrigins === true) {
                callback(null, true);
                return;
            }

            if (configuredOrigins.includes(origin)) {
                callback(null, true);
                return;
            }

            // Local DX: allow any localhost / 127.0.0.1 port (Next may pick 3000–3005)
            if (isLocal && isLocalDevOrigin(origin)) {
                callback(null, true);
                return;
            }

            callback(null, false);
        },
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: [
            'Content-Type',
            'Authorization',
            'Accept',
            'Origin',
            'X-Requested-With',
            'X-Workspace-Id',
        ],
        credentials: true,
        exposedHeaders: ['Content-Range', 'X-Content-Range'],
        optionsSuccessStatus: 204,
    };

    return {
        env,
        name: process.env.APP_NAME ?? 'OnlineShop.rw',

        versioning: {
            enable: process.env.HTTP_VERSIONING_ENABLE === 'true',
            prefix: 'v',
            version: process.env.HTTP_VERSION ?? '1',
        },

        throttle: {
            ttl: 60,
            limit: isLocal ? 200 : 10,
        },

        http: {
            host: process.env.HTTP_HOST ?? '0.0.0.0',
            port: process.env.HTTP_PORT
                ? Number.parseInt(process.env.HTTP_PORT, 10)
                : 3001,
        },

        cors: corsConfig,

        sentry: {
            dsn: process.env.SENTRY_DSN,
            environment: env,
        },

        debug: process.env.APP_DEBUG === 'true',
        logLevel: process.env.APP_LOG_LEVEL ?? 'info',
    };
});
