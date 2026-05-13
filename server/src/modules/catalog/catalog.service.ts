import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductStatus, StoreStatus } from '@prisma/client';
import type { Prisma } from '@prisma/client';

import { DatabaseService } from '../../common/database/services/database.service';
import { withDbRetry } from '../../common/database/utils/with-db-retry';

const catalogProductInclude = {
    store: {
        select: {
            id: true,
            displayName: true,
            logoUrl: true,
            subdomain: true,
        },
    },
    variants: {
        include: {
            inventory: true,
        },
    },
} satisfies Prisma.ProductInclude;

type ProductWithCatalog = Prisma.ProductGetPayload<{
    include: typeof catalogProductInclude;
}>;

const normalizeStoreIdentifier = (value: string | null | undefined) =>
    value
        ?.trim()
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '') || '';

export type PublicCatalogProduct = {
    id: string;
    name: string;
    description: string | null;
    vendor: string;
    category: string;
    tags: string[];
    images: string[];
    primaryImage: string | null;
    deliveryEnabled: boolean;
    deliveryLocation: string | null;
    deliveryPrice: number | null;
    priceFrom: number | null;
    compareAtFrom: number | null;
    createdAt: string;
    store: {
        id: string;
        displayName: string;
        logoUrl: string | null;
        subdomain: string;
    };
    variants: Array<{
        id: string;
        sku: string;
        title: string;
        colorName: string | null;
        colorHex: string | null;
        size: string | null;
        price: number;
        compareAt: number | null;
        inventory?: {
            available: number;
            status: string;
        };
    }>;
};

@Injectable()
export class CatalogService {
    constructor(private readonly prisma: DatabaseService) {}

    async getCatalogGrouped(search?: string, subdomain?: string) {
        const storeId = await this.resolveApprovedStoreId(subdomain);
        if (subdomain && !storeId) {
            return { groups: [] };
        }

        const where: Prisma.ProductWhereInput = {
            status: ProductStatus.ACTIVE,
            store: {
                status: StoreStatus.APPROVED,
                ...(storeId ? { id: storeId } : {}),
            },
        };

        const q = search?.trim();
        if (q) {
            where.OR = [
                { name: { contains: q, mode: 'insensitive' } },
                { description: { contains: q, mode: 'insensitive' } },
                { vendor: { contains: q, mode: 'insensitive' } },
                { category: { contains: q, mode: 'insensitive' } },
            ];
        }

        const products = await withDbRetry(
            this.prisma,
            () =>
                this.prisma.product.findMany({
                    where,
                    orderBy: [{ category: 'asc' }, { name: 'asc' }],
                    include: catalogProductInclude,
                }),
            { label: 'catalog.getCatalogGrouped' }
        );

        const groupsMap = new Map<string, PublicCatalogProduct[]>();
        for (const p of products) {
            const serialized = this.serializeProduct(p);
            const categoryLabel = serialized.category?.trim() || 'Other';
            const existing = groupsMap.get(categoryLabel) ?? [];
            existing.push(serialized);
            groupsMap.set(categoryLabel, existing);
        }

        const groups = [...groupsMap.entries()]
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([category, productsInGroup]) => ({
                category,
                products: productsInGroup,
                total: productsInGroup.length,
            }));

        return { groups };
    }

    async listProductCategories() {
        const rows = await withDbRetry(
            this.prisma,
            () =>
                this.prisma.product.groupBy({
                    by: ['category'],
                    where: {
                        status: ProductStatus.ACTIVE,
                        store: { status: StoreStatus.APPROVED },
                    },
                    _count: { _all: true },
                    orderBy: { category: 'asc' },
                }),
            { label: 'catalog.listProductCategories' }
        );

        return rows.map(row => ({
            category: row.category,
            count: row._count._all,
        }));
    }

    async getProductById(id: string, subdomain?: string) {
        const storeId = await this.resolveApprovedStoreId(subdomain);
        if (subdomain && !storeId) {
            throw new NotFoundException('Product not found');
        }

        const product = await withDbRetry(
            this.prisma,
            () =>
                this.prisma.product.findFirst({
                    where: {
                        id,
                        status: ProductStatus.ACTIVE,
                        store: {
                            status: StoreStatus.APPROVED,
                            ...(storeId ? { id: storeId } : {}),
                        },
                    },
                    include: catalogProductInclude,
                }),
            { label: 'catalog.getProductById' }
        );

        if (!product) {
            throw new NotFoundException('Product not found');
        }

        return this.serializeProduct(product);
    }

    private async resolveApprovedStoreId(identifier?: string) {
        const normalizedIdentifier = normalizeStoreIdentifier(identifier);
        if (!normalizedIdentifier) {
            return undefined;
        }

        const stores = await withDbRetry(
            this.prisma,
            () =>
                this.prisma.store.findMany({
                    where: { status: StoreStatus.APPROVED },
                    select: {
                        id: true,
                        subdomain: true,
                        displayName: true,
                        registeredName: true,
                    },
                }),
            { label: 'catalog.resolveApprovedStoreId' }
        );

        const store = stores.find(current => {
            const identifiers = [
                current.subdomain,
                current.displayName,
                current.registeredName,
            ];

            return identifiers.some(
                value => normalizeStoreIdentifier(value) === normalizedIdentifier
            );
        });

        return store?.id ?? null;
    }

    private serializeProduct(p: ProductWithCatalog): PublicCatalogProduct {
        const variants = p.variants.map(v => ({
            id: v.id,
            sku: v.sku,
            title: v.title,
            colorName: v.colorName,
            colorHex: v.colorHex,
            size: v.size,
            price: Number(v.price),
            compareAt: v.compareAt ? Number(v.compareAt) : null,
            inventory: v.inventory
                ? {
                      available: v.inventory.available,
                      status: v.inventory.status,
                  }
                : undefined,
        }));

        const prices = variants.map(v => v.price);
        const priceFrom = prices.length ? Math.min(...prices) : null;
        const compareAtPrices = variants
            .map(v => v.compareAt)
            .filter((n): n is number => typeof n === 'number');
        const compareAtFrom = compareAtPrices.length
            ? Math.min(...compareAtPrices)
            : null;

        return {
            id: p.id,
            name: p.name,
            description: p.description,
            vendor: p.vendor,
            category: p.category,
            tags: p.tags,
            images: p.images,
            primaryImage: p.primaryImage,
            deliveryEnabled: p.deliveryEnabled,
            deliveryLocation: p.deliveryLocation,
            deliveryPrice: p.deliveryPrice ? Number(p.deliveryPrice) : null,
            priceFrom,
            compareAtFrom,
            createdAt: p.createdAt.toISOString(),
            store: p.store,
            variants,
        };
    }
}
