import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';

@Injectable()
export class StoreGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const storeId = request.storeId ?? request.user?.storeId;

        if (!storeId) {
            throw new ForbiddenException(
                'No associated store found. Please complete store onboarding.',
            );
        }

        return true;
    }
}
