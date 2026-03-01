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

        const hostParts = host.split('.');

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
