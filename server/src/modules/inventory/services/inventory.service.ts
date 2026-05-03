import { Injectable } from '@nestjs/common';
import { InventoryRepository } from '../repositories/inventory.repository';
import { InventoryNotFoundException } from '../../../common/exceptions/domain.exception';
import { StockStatus, InventoryEventType } from '../../../common/constants/status.constants';
import { StockStatus as PrismaStockStatus, InventoryEventType as PrismaInventoryEventType } from '@prisma/client';

@Injectable()
export class InventoryService {
    constructor(private readonly inventoryRepository: InventoryRepository) {}

    async findAll(storeId: string, filters: any) {
        const page = +(filters.page ?? 1);
        const limit = +(filters.limit ?? 10);
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
        const inventory = await this.findByVariantId(variantId, storeId);

        const newOnHand = inventory.onHand + quantity;
        const newAvailable = newOnHand - inventory.reserved;

        if (newOnHand < 0) {
            throw new Error('Cannot reduce stock below zero');
        }

        const newStatus = this.calculateStockStatus(newOnHand, inventory.reorderPoint);

        const eventType = quantity > 0 ? InventoryEventType.RESTOCKED : InventoryEventType.ADJUSTED;

        await this.inventoryRepository.update(variantId, {
            onHand: newOnHand,
            available: newAvailable,
            status: newStatus as PrismaStockStatus,
            lastRestockedAt: quantity > 0 ? new Date() : inventory.lastRestockedAt,
            updatedBy: userId,
        });

        await this.inventoryRepository.createEvent({
            type: eventType as PrismaInventoryEventType,
            quantity: Math.abs(quantity),
            reason,
            performedBy: userId,
            inventoryRecord: {
                connect: { id: inventory.id },
            },
        });

        return this.findByVariantId(variantId, storeId);
    }

    async getEvents(variantId: string, storeId: string) {
        const inventory = await this.findByVariantId(variantId, storeId);
        return this.inventoryRepository.getEvents(variantId);
    }

    async exportCsv(storeId: string): Promise<string> {
        const items = await this.inventoryRepository.findManyByStoreId(storeId, {
            orderBy: { updatedAt: 'desc' },
        });

        const headers = ['SKU', 'Product', 'Variant', 'On Hand', 'Reserved', 'Available', 'Status', 'Reorder Point'];
        const rows = (items as any[]).map((i) => [
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
            return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s;
        };
        return [headers.join(','), ...rows.map((r) => r.map(esc).join(','))].join('\n');
    }

    private calculateStockStatus(stock: number, reorderPoint: number): string {
        if (stock === 0) return StockStatus.OUT_OF_STOCK;
        if (stock < reorderPoint) return StockStatus.LOW_STOCK;
        return StockStatus.IN_STOCK;
    }
}
