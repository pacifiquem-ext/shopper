import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { TenantRequest } from '../tenant.middleware';

export const CurrentTenant = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest<TenantRequest>();
        return request.tenantId; // Returns the UUID of the resolved store
    }
);
