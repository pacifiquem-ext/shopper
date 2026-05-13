import {
    Injectable,
    NestMiddleware,
    NotFoundException,
    ForbiddenException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { DatabaseService } from '../database/services/database.service';

export interface TenantRequest extends Request {
    tenantId?: string;
    storeData?: any;
}

@Injectable()
export class TenantMiddleware implements NestMiddleware {
    constructor(private readonly prisma: DatabaseService) {}

    async use(req: TenantRequest, res: Response, next: NextFunction) {
        const host = req.headers.host;
        if (!host) {
            throw new NotFoundException('Host header missing');
        }

        // Do not attempt tenant resolution for raw IP hosts (e.g. 127.0.0.1, [::1])
        const hostWithoutPort = host.split(':')[0];
        const isIpv4 = /^\d{1,3}(\.\d{1,3}){3}$/.test(hostWithoutPort);
        const isIpv6 = hostWithoutPort.startsWith('[') || hostWithoutPort.includes(':');
        if (isIpv4 || isIpv6) {
            return next();
        }

        const hostParts = host.split('.');

        // Extra safety: skip tenant resolution for IPv4 hosts that slipped through
        // (e.g. "127.0.0.1:3001" becomes ["127","0","0","1:3001"]).
        if (hostParts.length === 4) {
            const last = hostParts[3].split(':')[0];
            const allNumeric =
                hostParts
                    .slice(0, 3)
                    .every(part => /^\d+$/.test(part)) && /^\d+$/.test(last);
            if (allNumeric) {
                return next();
            }
        }

        let subdomain = null;
        if (hostParts.length > 2 && hostParts[0] !== 'www') {
            subdomain = hostParts[0];
        } else if (
            hostParts.length === 2 &&
            host.includes('localhost') &&
            hostParts[0] !== 'localhost'
        ) {
            subdomain = hostParts[0];
        }

        if (!subdomain) {
            return next();
        }

        const store = await this.prisma.store.findUnique({
            where: { subdomain },
        });

        if (!store) {
            throw new NotFoundException(`Store ${subdomain} not found`);
        }

        if (store.status !== 'APPROVED') {
            throw new ForbiddenException(
                `Store ${subdomain} is currently ${store.status.toLowerCase()}`
            );
        }

        req.tenantId = store.id;
        req.storeData = store;

        next();
    }
}
