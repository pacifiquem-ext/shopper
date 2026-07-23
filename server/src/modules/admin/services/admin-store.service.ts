import {
    Injectable,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import {
    PaymentStatus,
    ProductStatus,
    ReviewStatus,
    StoreStatus,
    Prisma,
} from '@prisma/client';
import { DatabaseService } from '../../../common/database/services/database.service';

@Injectable()
export class AdminStoreService {
    constructor(private readonly prisma: DatabaseService) {}

    async getDashboardStats() {
        const [
            storesTotal,
            storesApproved,
            storesPending,
            productsActive,
            ordersTotal,
            paymentsPending,
            reviewsPending,
            promotionsActive,
        ] = await Promise.all([
            this.prisma.store.count(),
            this.prisma.store.count({ where: { status: StoreStatus.APPROVED } }),
            this.prisma.store.count({
                where: {
                    status: {
                        in: [StoreStatus.SUBMITTED, StoreStatus.UNDER_REVIEW],
                    },
                },
            }),
            this.prisma.product.count({
                where: { status: ProductStatus.ACTIVE },
            }),
            this.prisma.order.count(),
            this.prisma.orderPayment.count({
                where: { status: PaymentStatus.PENDING },
            }),
            this.prisma.productReview.count({
                where: { status: ReviewStatus.PENDING },
            }),
            this.prisma.promotion.count({
                where: { status: 'ACTIVE' },
            }),
        ]);

        return {
            storesTotal,
            storesApproved,
            storesPending,
            productsTotal: productsActive,
            productsActive,
            ordersTotal,
            paymentsPending,
            reviewsPending,
            promotionsActive,
            stores: {
                total: storesTotal,
                approved: storesApproved,
                pendingReview: storesPending,
            },
        };
    }

    async getStores(status?: StoreStatus, skip = 0, take = 20) {
        const cappedTake = Math.min(Math.max(take, 1), 100);
        const whereArgs = status ? { status } : {};
        const [stores, total] = await Promise.all([
            this.prisma.store.findMany({
                where: whereArgs,
                skip,
                take: cappedTake,
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

        return { data: stores, total, skip, take: cappedTake };
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
            reason,
        );
    }

    async listReviews(status?: ReviewStatus, skip = 0, take = 20) {
        const cappedTake = Math.min(Math.max(take, 1), 100);
        const where = status ? { status } : {};
        const [data, total] = await Promise.all([
            this.prisma.productReview.findMany({
                where,
                skip,
                take: cappedTake,
                orderBy: { createdAt: 'desc' },
                include: {
                    product: { select: { id: true, name: true } },
                    store: { select: { id: true, displayName: true, slug: true } },
                    user: { select: { id: true, fullName: true } },
                },
            }),
            this.prisma.productReview.count({ where }),
        ]);
        return { data, total, skip, take: cappedTake };
    }

    async moderateReview(
        reviewId: string,
        status: Extract<ReviewStatus, 'APPROVED' | 'REJECTED'>,
        moderatorId: string,
    ) {
        const review = await this.prisma.productReview.findUnique({
            where: { id: reviewId },
        });
        if (!review) {
            throw new NotFoundException('Review not found');
        }
        if (review.status !== ReviewStatus.PENDING) {
            throw new BadRequestException('Review is not pending moderation');
        }

        return this.prisma.$transaction(async (tx) => {
            const updated = await tx.productReview.update({
                where: { id: reviewId },
                data: {
                    status,
                    moderatedAt: new Date(),
                    moderatedBy: moderatorId,
                },
            });

            if (status === ReviewStatus.APPROVED) {
                await this.recomputeProductRating(tx, review.productId);
                await this.recomputeStoreRating(tx, review.storeId);
            }

            return updated;
        });
    }

    private async recomputeProductRating(
        tx: Prisma.TransactionClient,
        productId: string,
    ) {
        const agg = await tx.productReview.aggregate({
            where: { productId, status: ReviewStatus.APPROVED },
            _avg: { rating: true },
            _count: { _all: true },
        });
        await tx.product.update({
            where: { id: productId },
            data: {
                ratingAvg: agg._avg.rating ?? 0,
                ratingCount: agg._count._all,
            },
        });
    }

    private async recomputeStoreRating(
        tx: Prisma.TransactionClient,
        storeId: string,
    ) {
        const agg = await tx.productReview.aggregate({
            where: { storeId, status: ReviewStatus.APPROVED },
            _avg: { rating: true },
            _count: { _all: true },
        });
        await tx.store.update({
            where: { id: storeId },
            data: {
                ratingAvg: agg._avg.rating ?? 0,
                ratingCount: agg._count._all,
            },
        });
    }

    private async changeStoreStatus(
        storeId: string,
        newStatus: StoreStatus,
        allowedPreviousStatuses: StoreStatus[],
        rejectionReason?: string,
    ) {
        const store = await this.prisma.store.findUnique({
            where: { id: storeId },
        });
        if (!store) {
            throw new NotFoundException('Store not found');
        }

        if (!allowedPreviousStatuses.includes(store.status)) {
            throw new BadRequestException(
                `Cannot change status from ${store.status} to ${newStatus}`,
            );
        }

        return this.prisma.store.update({
            where: { id: storeId },
            data: {
                status: newStatus,
                ...(newStatus === StoreStatus.APPROVED
                    ? { approvedAt: new Date() }
                    : {}),
                ...(rejectionReason && newStatus === StoreStatus.REJECTED
                    ? { rejectionReason }
                    : {}),
            },
        });
    }
}
