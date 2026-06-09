import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';

import { DatabaseService } from '../../database/services/database.service';

@Injectable()
export class StoreGuard implements CanActivate {
    constructor(private readonly prisma: DatabaseService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const userId = request.user?.id ?? request.user?.userId;
        let storeId: string | undefined =
            request.storeId ?? request.user?.storeId ?? undefined;

        if (!storeId && userId) {
            const ownedStore = await this.prisma.store.findFirst({
                where: { userId },
                select: { id: true },
            });

            if (ownedStore) {
                storeId = ownedStore.id;
                request.storeId = storeId;
                if (request.user) {
                    request.user.storeId = storeId;
                }

                // Keep users.storeId in sync for future JWT validations
                void this.prisma.user
                    .update({
                        where: { id: userId },
                        data: {
                            storeId: ownedStore.id,
                            role: UserRole.STORE_OWNER,
                        },
                    })
                    .catch(() => undefined);
            }
        }

        if (!storeId) {
            throw new ForbiddenException(
                'No associated store found. Please complete store onboarding.',
            );
        }

        request.storeId = storeId;
        return true;
    }
}
