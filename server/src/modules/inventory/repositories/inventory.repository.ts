import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../common/database/services/database.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class InventoryRepository {
    constructor(private readonly prisma: DatabaseService) {}

    async findByVariantId(variantId: string) {
        return this.prisma.inventoryRecord.findUnique({
            where: { productVariantId: variantId },
            include: {
                productVariant: {
                    include: {
                        product: true,
                    },
                },
                events: {
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                },
            },
        });
    }

    async findManyByStoreId(storeId: string, params: {
        skip?: number;
        take?: number;
        where?: any;
        orderBy?: Prisma.InventoryRecordOrderByWithRelationInput;
    }) {
        const { skip, take, where, orderBy } = params;

        return this.prisma.inventoryRecord.findMany({
            skip,
            take,
            where: {
                ...where,
                productVariant: {
                    product: {
                        storeId,
                    },
                },
            },
            orderBy,
            include: {
                productVariant: {
                    include: {
                        product: true,
                    },
                },
            },
        });
    }

    async count(storeId: string, where?: any) {
        return this.prisma.inventoryRecord.count({
            where: {
                ...where,
                productVariant: {
                    product: {
                        storeId,
                    },
                },
            },
        });
    }

    async update(variantId: string, data: Prisma.InventoryRecordUpdateInput) {
        return this.prisma.inventoryRecord.update({
            where: { productVariantId: variantId },
            data,
        });
    }

    async createEvent(data: Prisma.InventoryEventCreateInput) {
        return this.prisma.inventoryEvent.create({ data });
    }

    async getEvents(variantId: string) {
        const inventory = await this.prisma.inventoryRecord.findUnique({
            where: { productVariantId: variantId },
        });

        if (!inventory) return [];

        return this.prisma.inventoryEvent.findMany({
            where: { inventoryRecordId: inventory.id },
            orderBy: { createdAt: 'desc' },
        });
    }
}
