import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/** Legacy shape kept so Existing `@CurrentTenant` decorator still typechecks. */
export interface TenantRequest extends Request {
    tenantId?: string;
    storeData?: unknown;
}

/**
 * Single marketplace (ADR 001): Host-based storefront tenancy is removed.
 * Merchant tenancy remains via JWT + StoreGuard. This middleware is a no-op.
 */
@Injectable()
export class TenantMiddleware implements NestMiddleware {
    use(_req: Request, _res: Response, next: NextFunction) {
        next();
    }
}
