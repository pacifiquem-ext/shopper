import {
    Injectable,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { DatabaseService } from '../../../common/database/services/database.service';
import { StoreStatus } from '@prisma/client';

@Injectable()
export class AdminStoreService {
    constructor(private readonly prisma: DatabaseService) {}

    async getStores(status?: StoreStatus, skip = 0, take = 20) {
        const whereArgs = status ? { status } : {};
        const [stores, total] = await Promise.all([
            this.prisma.store.findMany({
                where: whereArgs,
                skip,
                take,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: {
                        select: {
                            fullName: true,
                            phoneNumber: true,
                            email: true,
                        },
                    },
                },
            }),
            this.prisma.store.count({ where: whereArgs }),
        ]);

        return { data: stores, total, skip, take };
    }

    async getStoreKyc(storeId: string) {
        const store = await this.prisma.store.findUnique({
            where: { id: storeId },
            include: {
                kyc: {
                    include: {
                        industrySector: true,
                        businessCategory: true,
                        businessAddress: true,
                        warehouseAddress: true,
                    },
                },
            },
        });

        if (!store) {
            throw new NotFoundException('Store not found');
        }

        return store;
    }

    async approveStore(storeId: string) {
        return this.changeStoreStatus(storeId, StoreStatus.APPROVED, [
            StoreStatus.SUBMITTED,
            StoreStatus.UNDER_REVIEW,
        ]);
    }

    async rejectStore(storeId: string, reason?: string) {
        return this.changeStoreStatus(
            storeId,
            StoreStatus.REJECTED,
            [StoreStatus.SUBMITTED, StoreStatus.UNDER_REVIEW],
            reason
        );
    }

    private async changeStoreStatus(
        storeId: string,
        newStatus: StoreStatus,
        allowedPreviousStatuses: StoreStatus[],
        rejectionReason?: string
    ) {
        const store = await this.prisma.store.findUnique({
            where: { id: storeId },
        });
        if (!store) {
            throw new NotFoundException('Store not found');
        }

        if (!allowedPreviousStatuses.includes(store.status)) {
            throw new BadRequestException(
                `Cannot change status from ${store.status} to ${newStatus}`
            );
        }

        return this.prisma.store.update({
            where: { id: storeId },
            data: {
                status: newStatus,
                ...(rejectionReason && newStatus === StoreStatus.REJECTED
                    ? { rejectionReason }
                    : {}),
            },
        });
    }
}
