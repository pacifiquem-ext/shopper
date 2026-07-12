import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ProductStatus, StoreStatus } from '@prisma/client';
import type { Prisma } from '@prisma/client';

import { APP_ENVIRONMENT } from '../../app/enums/app.enum';
import { DatabaseService } from '../../common/database/services/database.service';
import { withDbRetry } from '../../common/database/utils/with-db-retry';

// Marketplace grouped catalog still loads products in one query for category
// grouping; hard cap prevents unbounded memory/IO as the catalog grows.
const CATALOG_GROUPED_MAX_PRODUCTS = 2000;

const catalogStoreSelect = {
    id: true,
    displayName: true,
    logoUrl: true,
    subdomain: true,
    brandColors: true,
    description: true,
    currency: true,
    contactEmail: true,
    contactPhone: true,
} as const;

const catalogProductInclude = {
    store: {
        select: catalogStoreSelect,
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

export type PublicCatalogStoreProfile = {
    id: string;
    displayName: string;
    logoUrl: string | null;
    subdomain: string;
    storeTemplate: string;
    brandColors: { primary?: string; secondary?: string } | null;
    description: string | null;
    currency: string;
    contactEmail: string | null;
    contactPhone: string | null;
};

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
        storeTemplate: string;
        brandColors: { primary?: string; secondary?: string } | null;
        description: string | null;
        currency: string;
        contactEmail: string | null;
        contactPhone: string | null;
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
    constructor(
        private readonly prisma: DatabaseService,
        private readonly config: ConfigService,
    ) {}

    private marketplaceStoreStatuses(): StoreStatus[] {
        const env = this.config.get<string>('app.env');
        if (env === APP_ENVIRONMENT.LOCAL) {
            return [StoreStatus.APPROVED, StoreStatus.SUBMITTED];
        }

        return [StoreStatus.APPROVED];
    }

    private marketplaceStoreWhere(
        storeId?: string,
    ): Prisma.StoreWhereInput {
        return {
            status: { in: this.marketplaceStoreStatuses() },
            ...(storeId ? { id: storeId } : {}),
        };
    }

    async getCatalogGrouped(search?: string, subdomain?: string) {
        const storeId = await this.resolveApprovedStoreId(subdomain);
        if (subdomain && !storeId) {
            return { groups: [] };
        }

        const where: Prisma.ProductWhereInput = {
            status: ProductStatus.ACTIVE,
            store: this.marketplaceStoreWhere(storeId),
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
                    take: CATALOG_GROUPED_MAX_PRODUCTS,
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

        let store: PublicCatalogStoreProfile | null = null;
        if (storeId) {
            const fromProduct = products.find(p => p.store.id === storeId)?.store;
            if (fromProduct) {
                store = this.serializeStoreProfile(fromProduct);
            } else {
                const storeRow = await withDbRetry(
                    this.prisma,
                    () =>
                        this.prisma.store.findFirst({
                            where: {
                                id: storeId,
                                status: { in: this.marketplaceStoreStatuses() },
                            },
                            select: catalogStoreSelect,
                        }),
                    { label: 'catalog.getCatalogGrouped.store' }
                );
                if (storeRow) {
                    store = this.serializeStoreProfile(storeRow);
                }
            }
        }

        let stores: Awaited<
            ReturnType<CatalogService['listMarketplaceStoresWithProducts']>
        > | undefined;
        if (!subdomain && !q) {
            try {
                stores = await this.listMarketplaceStoresWithProducts();
            } catch {
                stores = undefined;
            }
        }

        return { groups, store, stores };
    }

    async listMarketplaceStoresWithProducts(limit = 4) {
        const grouped = await withDbRetry(
            this.prisma,
            () =>
                this.prisma.product.groupBy({
                    by: ['storeId'],
                    where: {
                        status: ProductStatus.ACTIVE,
                        store: { status: { in: this.marketplaceStoreStatuses() } },
                    },
                    _count: { _all: true },
                    orderBy: { _count: { storeId: 'desc' } },
                    take: limit,
                }),
            { label: 'catalog.listMarketplaceStoresWithProducts.group' }
        );

        if (grouped.length === 0) {
            return [];
        }

        const storeRows = await withDbRetry(
            this.prisma,
            () =>
                this.prisma.store.findMany({
                    where: {
                        id: { in: grouped.map(row => row.storeId) },
                    },
                    select: catalogStoreSelect,
                }),
            { label: 'catalog.listMarketplaceStoresWithProducts.stores' }
        );

        const storeById = new Map(storeRows.map(row => [row.id, row]));

        return grouped
            .map(row => {
                const storeRow = storeById.get(row.storeId);
                if (!storeRow) {
                    return null;
                }

                return {
                    store: this.serializeStoreProfile(storeRow),
                    productCount: row._count._all,
                };
            })
            .filter((entry): entry is NonNullable<typeof entry> => entry != null);
    }

    async listProductCategories() {
        const rows = await withDbRetry(
            this.prisma,
            () =>
                this.prisma.product.groupBy({
                    by: ['category'],
                    where: {
                        status: ProductStatus.ACTIVE,
                        store: { status: { in: this.marketplaceStoreStatuses() } },
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
                        store: this.marketplaceStoreWhere(storeId),
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

        const trimmed = identifier!.trim();

        const directMatch = await withDbRetry(
            this.prisma,
            () =>
                this.prisma.store.findFirst({
                    where: {
                        status: { in: this.marketplaceStoreStatuses() },
                        OR: [
                            { subdomain: { equals: trimmed, mode: 'insensitive' } },
                            {
                                subdomain: {
                                    equals: normalizedIdentifier,
                                    mode: 'insensitive',
                                },
                            },
                        ],
                    },
                    select: { id: true },
                }),
            { label: 'catalog.resolveApprovedStoreId.direct' }
        );
        if (directMatch) {
            return directMatch.id;
        }

        const stores = await withDbRetry(
            this.prisma,
            () =>
                this.prisma.store.findMany({
                    where: { status: { in: this.marketplaceStoreStatuses() } },
                    select: {
                        id: true,
                        subdomain: true,
                        displayName: true,
                        registeredName: true,
                    },
                }),
            { label: 'catalog.resolveApprovedStoreId.fallback' }
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

    private serializeStoreProfile(
        store: Prisma.StoreGetPayload<{ select: typeof catalogStoreSelect }>
    ): PublicCatalogStoreProfile {
        const brandColors = store.brandColors as
            | { primary?: string; secondary?: string; template?: string }
            | null;
        const rawTemplate = brandColors?.template?.trim().toUpperCase();
        const storeTemplate =
            rawTemplate === 'VIBRANT_MARKET'
                ? 'VIBRANT_MARKET'
                : rawTemplate === 'ISHUSHO_CRAFTS'
                  ? 'ISHUSHO_CRAFTS'
                  : 'DEFAULT';

        return {
            id: store.id,
            displayName: store.displayName,
            logoUrl: store.logoUrl,
            subdomain: store.subdomain,
            storeTemplate,
            brandColors: brandColors ?? null,
            description: store.description,
            currency: store.currency,
            contactEmail: store.contactEmail,
            contactPhone: store.contactPhone,
        };
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
            store: this.serializeStoreProfile(p.store),
            variants,
        };
    }
}
