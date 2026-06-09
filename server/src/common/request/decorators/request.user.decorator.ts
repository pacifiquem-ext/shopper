import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { IRequest } from '../interfaces/request.interface';

export const AuthUser = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest<IRequest>();
        const user = request.user;

        // Allow selecting a field, e.g. @AuthUser('userId')
        if (typeof data === 'string' && user && typeof user === 'object') {
            return (user as Record<string, unknown>)[data];
        }

        return user;
    }
);
