import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/** Request shape used by `@CurrentTenant`. */
export interface TenantRequest extends Request {
    tenantId?: string;
    storeData?: unknown;
}

/** Store access is enforced with JWT + StoreGuard. */
@Injectable()
export class TenantMiddleware implements NestMiddleware {
    use(_req: Request, _res: Response, next: NextFunction) {
        next();
    }
}
