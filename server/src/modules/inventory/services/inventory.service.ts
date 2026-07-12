import { BadRequestException, Injectable } from '@nestjs/common';
import { InventoryRepository } from '../repositories/inventory.repository';
import { DatabaseService } from '../../../common/database/services/database.service';
import { InventoryNotFoundException } from '../../../common/exceptions/domain.exception';
import { StockStatus, InventoryEventType } from '../../../common/constants/status.constants';
import {
    StockStatus as PrismaStockStatus,
    InventoryEventType as PrismaInventoryEventType,
} from '@prisma/client';

const EXPORT_MAX_ROWS = 5000;

@Injectable()
export class InventoryService {
    constructor(
        private readonly inventoryRepository: InventoryRepository,
        private readonly prisma: DatabaseService,
    ) {}

    async findAll(storeId: string, filters: any) {
        const page = +(filters.page ?? 1);
        const limit = Math.min(+(filters.limit ?? 10), 100);
        const { status, category, vendor, search } = filters;
        const skip = (page - 1) * limit;

        const where: any = {};

        if (status) {
            where.status = status;
        }

        if (category || vendor || search) {
            where.productVariant = {
                product: {},
            };

            if (category) {
                where.productVariant.product.category = category;
            }

            if (vendor) {
                where.productVariant.product.vendor = vendor;
            }

            if (search) {
                where.productVariant.product.OR = [
                    { name: { contains: search, mode: 'insensitive' } },
                    { vendor: { contains: search, mode: 'insensitive' } },
                ];
            }
        }

        const [inventory, total] = await Promise.all([
            this.inventoryRepository.findManyByStoreId(storeId, {
                skip,
                take: limit,
                where,
                orderBy: { updatedAt: 'desc' },
            }),
            this.inventoryRepository.count(storeId, where),
        ]);

        return {
            data: inventory,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    async findByVariantId(variantId: string, storeId: string) {
        const inventory = await this.inventoryRepository.findByVariantId(variantId);

        if (!inventory || inventory.productVariant.product.storeId !== storeId) {
            throw new InventoryNotFoundException(variantId);
        }

        return inventory;
    }

    async adjustStock(
        variantId: string,
        storeId: string,
        userId: string,
        quantity: number,
        reason: string,
    ) {
        if (!Number.isFinite(quantity) || quantity === 0) {
            throw new BadRequestException('Quantity must be a non-zero number');
        }

        await this.prisma.$transaction(async tx => {
            const inventory = await tx.inventoryRecord.findUnique({
                where: { productVariantId: variantId },
                include: {
                    productVariant: {
                        include: { product: true },
                    },
                },
            });

            if (!inventory || inventory.productVariant.product.storeId !== storeId) {
                throw new InventoryNotFoundException(variantId);
            }

            if (quantity < 0) {
                const result = await tx.inventoryRecord.updateMany({
                    where: {
                        productVariantId: variantId,
                        onHand: { gte: Math.abs(quantity) },
                    },
                    data: {
                        onHand: { increment: quantity },
                        updatedBy: userId,
                    },
                });

                if (result.count === 0) {
                    throw new BadRequestException('Cannot reduce stock below zero');
                }
            } else {
                await tx.inventoryRecord.update({
                    where: { productVariantId: variantId },
                    data: {
                        onHand: { increment: quantity },
                        lastRestockedAt: new Date(),
                        updatedBy: userId,
                    },
                });
            }

            const updated = await tx.inventoryRecord.findUniqueOrThrow({
                where: { productVariantId: variantId },
            });

            const available = updated.onHand - updated.reserved;
            const status = this.calculateStockStatus(
                updated.onHand,
                updated.reorderPoint,
            ) as PrismaStockStatus;

            await tx.inventoryRecord.update({
                where: { productVariantId: variantId },
                data: { available, status },
            });

            const eventType =
                quantity > 0
                    ? InventoryEventType.RESTOCKED
                    : InventoryEventType.ADJUSTED;

            await tx.inventoryEvent.create({
                data: {
                    inventoryRecordId: inventory.id,
                    type: eventType as PrismaInventoryEventType,
                    quantity: Math.abs(quantity),
                    reason,
                    performedBy: userId,
                },
            });
        });

        return this.findByVariantId(variantId, storeId);
    }

    async getEvents(variantId: string, storeId: string) {
        await this.findByVariantId(variantId, storeId);
        return this.inventoryRepository.getEvents(variantId);
    }

    async exportCsv(storeId: string): Promise<string> {
        // Cap rows for sync HTTP export; full/async export should use a background job later.
        const items = await this.inventoryRepository.findManyByStoreId(storeId, {
            take: EXPORT_MAX_ROWS,
            orderBy: { updatedAt: 'desc' },
        });

        const headers = [
            'SKU',
            'Product',
            'Variant',
            'On Hand',
            'Reserved',
            'Available',
            'Status',
            'Reorder Point',
        ];
        const rows = (items as any[]).map(i => [
            i.productVariant.sku,
            i.productVariant.product.name,
            i.productVariant.title,
            i.onHand,
            i.reserved,
            i.available,
            i.status,
            i.reorderPoint ?? '',
        ]);

        return this.toCsv(headers, rows);
    }

    private toCsv(headers: string[], rows: any[][]): string {
        const esc = (v: any) => {
            const s = String(v ?? '');
            return s.includes(',') || s.includes('"') || s.includes('\n')
                ? `"${s.replace(/"/g, '""')}"`
                : s;
        };
        return [headers.join(','), ...rows.map(r => r.map(esc).join(','))].join(
            '\n',
        );
    }

    private calculateStockStatus(stock: number, reorderPoint: number): string {
        if (stock === 0) return StockStatus.OUT_OF_STOCK;
        if (stock < reorderPoint) return StockStatus.LOW_STOCK;
        return StockStatus.IN_STOCK;
    }
}
