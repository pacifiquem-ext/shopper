import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
    FulfillmentStatus,
    ProductStatus,
    PromotionStatus,
    PromotionType,
    ReviewStatus,
    StoreStatus,
} from '@prisma/client';
import type { Prisma } from '@prisma/client';

import { APP_ENVIRONMENT } from '../../app/enums/app.enum';
import { DatabaseService } from '../../common/database/services/database.service';
import { withDbRetry } from '../../common/database/utils/with-db-retry';
import { CreateReviewDto } from './dtos/create-review.dto';
import { PromoValidateDto } from './dtos/promo-validate.dto';

const CATALOG_GROUPED_MAX_PRODUCTS = 2000;
const HOME_PRODUCT_LIMIT = 12;
const HOME_STORE_LIMIT = 8;

const catalogStoreSelect = {
    id: true,
    displayName: true,
    logoUrl: true,
    slug: true,
    brandColors: true,
    description: true,
    currency: true,
    contactEmail: true,
    contactPhone: true,
    contactAddress: true,
    ratingAvg: true,
    ratingCount: true,
    approvedAt: true,
    createdAt: true,
    aboutUs: true,
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
    productCategory: {
        select: {
            id: true,
            slug: true,
            nameEn: true,
            nameRw: true,
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
    slug: string;
    /** @deprecated Alias of slug for client back-compat */
    subdomain: string;
    storeTemplate: 'DEFAULT';
    brandColors: { primary?: string; secondary?: string } | null;
    description: string | null;
    currency: string;
    contactEmail: string | null;
    contactPhone: string | null;
    contactAddress?: string | null;
    ratingAvg: number;
    ratingCount: number;
    aboutUs?: string | null;
};

export type PublicCatalogProduct = {
    id: string;
    name: string;
    description: string | null;
    vendor: string;
    category: string;
    categoryId: string | null;
    productCategory: {
        id: string;
        slug: string;
        nameEn: string;
        nameRw: string;
    } | null;
    tags: string[];
    images: string[];
    primaryImage: string | null;
    attributes: Record<string, unknown>;
    ratingAvg: number;
    ratingCount: number;
    averageRating: number;
    reviewCount: number;
    deliveryEnabled: boolean;
    deliveryLocation: string | null;
    deliveryPrice: number | null;
    priceFrom: number | null;
    compareAtFrom: number | null;
    createdAt: string;
    store: PublicCatalogStoreProfile;
    variants: Array<{
        id: string;
        sku: string;
        title: string;
        colorName: string | null;
        colorHex: string | null;
        size: string | null;
        price: number;
        compareAt: number | null;
        attributes: Record<string, unknown>;
        images: string[];
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

    private marketplaceStoreWhere(storeId?: string): Prisma.StoreWhereInput {
        return {
            status: { in: this.marketplaceStoreStatuses() },
            ...(storeId ? { id: storeId } : {}),
        };
    }

    private resolveStoreSlugParam(storeSlug?: string, subdomain?: string) {
        return storeSlug?.trim() || subdomain?.trim() || undefined;
    }

    async getHome() {
        // Keep homepage to two DB round-trips so Neon cold-start cannot time out clients.
        try {
            await this.prisma.$queryRaw`SELECT 1`;
        } catch {
            // continue; queries below still use the pool
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let products: any[] = [];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let stores: any[] = [];

        const leanStoreSelect = {
            id: true,
            displayName: true,
            logoUrl: true,
            slug: true,
            brandColors: true,
            description: true,
            currency: true,
            contactEmail: true,
            contactPhone: true,
            contactAddress: true,
            ratingAvg: true,
            ratingCount: true,
            approvedAt: true,
            createdAt: true,
            aboutUs: true,
        } as const;

        try {
            // Parallel after pool is warm; lean selects only.
            const [productRows, storeRows] = await Promise.all([
                this.prisma.product.findMany({
                    where: {
                        status: ProductStatus.ACTIVE,
                        store: { status: StoreStatus.APPROVED },
                    },
                    orderBy: { createdAt: 'desc' },
                    take: HOME_PRODUCT_LIMIT,
                    include: {
                        store: { select: leanStoreSelect },
                        variants: {
                            select: {
                                id: true,
                                sku: true,
                                title: true,
                                colorName: true,
                                colorHex: true,
                                size: true,
                                price: true,
                                compareAt: true,
                                attributes: true,
                                images: true,
                                inventory: {
                                    select: { available: true, status: true },
                                },
                            },
                            take: 3,
                        },
                        productCategory: {
                            select: {
                                id: true,
                                slug: true,
                                nameEn: true,
                                nameRw: true,
                            },
                        },
                    },
                }),
                this.prisma.store.findMany({
                    where: { status: StoreStatus.APPROVED },
                    orderBy: [{ createdAt: 'desc' }],
                    take: HOME_STORE_LIMIT,
                    select: leanStoreSelect,
                }),
            ]);
            products = productRows;
            stores = storeRows;
        } catch {
            products = [];
            stores = [];
        }

        const serialized = products.map((p) => this.serializeProduct(p));
        const topRated = [...serialized].sort(
            (a, b) =>
                (b.ratingAvg ?? 0) - (a.ratingAvg ?? 0) ||
                (b.ratingCount ?? 0) - (a.ratingCount ?? 0),
        );
        const onPromotion = serialized.filter(
            (p) =>
                p.compareAtFrom != null &&
                p.priceFrom != null &&
                p.compareAtFrom > p.priceFrom,
        );

        const risingStores = stores.map((store) => ({
            store: this.serializeStoreProfile(store),
            productCount: 0,
            sampleProducts: [] as PublicCatalogProduct[],
        }));

        return {
            topRated,
            newArrivals: serialized,
            risingStores,
            onPromotion:
                onPromotion.length > 0 ? onPromotion : serialized.slice(0, 4),
        };
    }

    private async getTopRatedProducts(): Promise<PublicCatalogProduct[]> {
        // Fast path only: avoid multi-round-trip groupBy fallbacks on Neon.
        const rated = await this.prisma.product.findMany({
            where: {
                status: ProductStatus.ACTIVE,
                ratingCount: { gte: 1 },
                store: this.marketplaceStoreWhere(),
            },
            orderBy: [{ ratingAvg: 'desc' }, { ratingCount: 'desc' }],
            take: HOME_PRODUCT_LIMIT,
            include: catalogProductInclude,
        });

        if (rated.length > 0) {
            return rated.map((p) => this.serializeProduct(p));
        }

        // No reviews yet → show newest actives so the section is never empty.
        return this.getNewArrivals();
    }

    private async getNewArrivals(): Promise<PublicCatalogProduct[]> {
        const products = await this.prisma.product.findMany({
            where: {
                status: ProductStatus.ACTIVE,
                store: this.marketplaceStoreWhere(),
            },
            orderBy: { createdAt: 'desc' },
            take: HOME_PRODUCT_LIMIT,
            include: catalogProductInclude,
        });
        return products.map((p) => this.serializeProduct(p));
    }

    private async getRisingStores() {
        const stores = await this.prisma.store.findMany({
            where: {
                status: StoreStatus.APPROVED,
            },
            orderBy: [{ approvedAt: 'desc' }, { createdAt: 'desc' }],
            take: HOME_STORE_LIMIT,
            select: catalogStoreSelect,
        });

        if (stores.length === 0) return [];

        // Lightweight counts only — skip sample product fan-out on homepage.
        const storeIds = stores.map((s) => s.id);
        const counts = await this.prisma.product.groupBy({
            by: ['storeId'],
            where: {
                storeId: { in: storeIds },
                status: ProductStatus.ACTIVE,
            },
            _count: { _all: true },
        });
        const countByStore = new Map(
            counts.map((c) => [c.storeId, c._count._all]),
        );

        return stores.map((store) => ({
            store: this.serializeStoreProfile(store),
            productCount: countByStore.get(store.id) ?? 0,
            sampleProducts: [] as PublicCatalogProduct[],
        }));
    }

    private async getOnPromotionProducts(): Promise<PublicCatalogProduct[]> {
        // Prefer compareAt discounts first (cheap index-friendly filter).
        let products = await this.prisma.product.findMany({
            where: {
                status: ProductStatus.ACTIVE,
                store: this.marketplaceStoreWhere(),
                variants: {
                    some: {
                        compareAt: { not: null },
                    },
                },
            },
            take: HOME_PRODUCT_LIMIT,
            orderBy: { updatedAt: 'desc' },
            include: catalogProductInclude,
        });

        if (products.length === 0) {
            products = await this.prisma.product.findMany({
                where: {
                    status: ProductStatus.ACTIVE,
                    store: this.marketplaceStoreWhere(),
                    variants: {
                        some: {
                            compareAt: { not: null },
                        },
                    },
                },
                take: HOME_PRODUCT_LIMIT * 2,
                include: catalogProductInclude,
            });

            products = products
                .filter((p) =>
                    p.variants.some(
                        (v) =>
                            v.compareAt != null &&
                            Number(v.compareAt) > Number(v.price),
                    ),
                )
                .slice(0, HOME_PRODUCT_LIMIT);
        }

        return products.map((p) => this.serializeProduct(p));
    }

    async getCatalogGrouped(search?: string, storeSlug?: string) {
        const storeId = await this.resolveApprovedStoreId(storeSlug);
        if (storeSlug && !storeId) {
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
            { label: 'catalog.getCatalogGrouped' },
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
            const fromProduct = products.find((p) => p.store.id === storeId)
                ?.store;
            if (fromProduct) {
                store = this.serializeStoreProfile(fromProduct);
            } else {
                const storeRow = await withDbRetry(
                    this.prisma,
                    () =>
                        this.prisma.store.findFirst({
                            where: {
                                id: storeId,
                                status: {
                                    in: this.marketplaceStoreStatuses(),
                                },
                            },
                            select: catalogStoreSelect,
                        }),
                    { label: 'catalog.getCatalogGrouped.store' },
                );
                if (storeRow) {
                    store = this.serializeStoreProfile(storeRow);
                }
            }
        }

        let stores:
            | Awaited<
                  ReturnType<CatalogService['listMarketplaceStoresWithProducts']>
              >
            | undefined;
        if (!storeSlug && !q) {
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
                        store: {
                            status: { in: this.marketplaceStoreStatuses() },
                        },
                    },
                    _count: { _all: true },
                    orderBy: { _count: { storeId: 'desc' } },
                    take: limit,
                }),
            { label: 'catalog.listMarketplaceStoresWithProducts.group' },
        );

        if (grouped.length === 0) {
            return [];
        }

        const storeRows = await withDbRetry(
            this.prisma,
            () =>
                this.prisma.store.findMany({
                    where: {
                        id: { in: grouped.map((row) => row.storeId) },
                    },
                    select: catalogStoreSelect,
                }),
            { label: 'catalog.listMarketplaceStoresWithProducts.stores' },
        );

        const storeById = new Map(storeRows.map((row) => [row.id, row]));

        return grouped
            .map((row) => {
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

    async listStores(page = 1, limit = 20, search?: string) {
        const safePage = Math.max(1, page);
        const safeLimit = Math.min(Math.max(1, limit), 100);
        const skip = (safePage - 1) * safeLimit;

        const where: Prisma.StoreWhereInput = {
            status: { in: this.marketplaceStoreStatuses() },
        };

        const q = search?.trim();
        if (q) {
            where.OR = [
                { displayName: { contains: q, mode: 'insensitive' } },
                { description: { contains: q, mode: 'insensitive' } },
                { slug: { contains: q, mode: 'insensitive' } },
            ];
        }

        const [stores, total] = await Promise.all([
            this.prisma.store.findMany({
                where,
                orderBy: [{ ratingAvg: 'desc' }, { createdAt: 'desc' }],
                skip,
                take: safeLimit,
                select: catalogStoreSelect,
            }),
            this.prisma.store.count({ where }),
        ]);

        const counts = await this.prisma.product.groupBy({
            by: ['storeId'],
            where: {
                storeId: { in: stores.map((s) => s.id) },
                status: ProductStatus.ACTIVE,
            },
            _count: { _all: true },
        });
        const countByStore = new Map(
            counts.map((c) => [c.storeId, c._count._all]),
        );

        return {
            data: stores.map((s) => ({
                store: this.serializeStoreProfile(s),
                productCount: countByStore.get(s.id) ?? 0,
            })),
            total,
            page: safePage,
            limit: safeLimit,
            totalPages: Math.ceil(total / safeLimit) || 1,
        };
    }

    async getStoreBySlug(slug: string, page = 1, limit = 20) {
        const storeId = await this.resolveApprovedStoreId(slug);
        if (!storeId) {
            throw new NotFoundException('Store not found');
        }

        const store = await this.prisma.store.findFirst({
            where: {
                id: storeId,
                status: { in: this.marketplaceStoreStatuses() },
            },
            select: catalogStoreSelect,
        });

        if (!store) {
            throw new NotFoundException('Store not found');
        }

        const safePage = Math.max(1, page);
        const safeLimit = Math.min(Math.max(1, limit), 100);
        const skip = (safePage - 1) * safeLimit;

        const where: Prisma.ProductWhereInput = {
            storeId,
            status: ProductStatus.ACTIVE,
        };

        const [products, total] = await Promise.all([
            this.prisma.product.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: safeLimit,
                include: catalogProductInclude,
            }),
            this.prisma.product.count({ where }),
        ]);

        return {
            store: this.serializeStoreProfile(store),
            products: products.map((p) => this.serializeProduct(p)),
            total,
            page: safePage,
            limit: safeLimit,
            totalPages: Math.ceil(total / safeLimit) || 1,
        };
    }

    async listProductCategories() {
        const taxonomy = await this.prisma.productCategory.findMany({
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' },
            include: {
                attributeDefs: {
                    orderBy: { sortOrder: 'asc' },
                },
                _count: {
                    select: {
                        products: {
                            where: {
                                status: ProductStatus.ACTIVE,
                                store: this.marketplaceStoreWhere(),
                            },
                        },
                    },
                },
            },
        });

        if (taxonomy.length > 0) {
            return taxonomy.map((row) => ({
                id: row.id,
                slug: row.slug,
                nameEn: row.nameEn,
                nameRw: row.nameRw,
                sortOrder: row.sortOrder,
                count: row._count.products,
                attributeDefs: row.attributeDefs,
            }));
        }

        const rows = await withDbRetry(
            this.prisma,
            () =>
                this.prisma.product.groupBy({
                    by: ['category'],
                    where: {
                        status: ProductStatus.ACTIVE,
                        store: {
                            status: { in: this.marketplaceStoreStatuses() },
                        },
                    },
                    _count: { _all: true },
                    orderBy: { category: 'asc' },
                }),
            { label: 'catalog.listProductCategories' },
        );

        return rows.map((row) => ({
            category: row.category,
            count: row._count._all,
        }));
    }

    async getProductById(id: string, storeSlug?: string) {
        const storeId = await this.resolveApprovedStoreId(storeSlug);
        if (storeSlug && !storeId) {
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
            { label: 'catalog.getProductById' },
        );

        if (!product) {
            throw new NotFoundException('Product not found');
        }

        return this.serializeProduct(product);
    }

    async listProductReviews(productId: string, page = 1, limit = 20) {
        const product = await this.prisma.product.findFirst({
            where: {
                id: productId,
                status: ProductStatus.ACTIVE,
                store: this.marketplaceStoreWhere(),
            },
            select: { id: true },
        });
        if (!product) {
            throw new NotFoundException('Product not found');
        }

        const safePage = Math.max(1, page);
        const safeLimit = Math.min(Math.max(1, limit), 100);
        const skip = (safePage - 1) * safeLimit;

        const where = {
            productId,
            status: ReviewStatus.APPROVED,
        } as const;

        const [reviews, total] = await Promise.all([
            this.prisma.productReview.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: safeLimit,
                select: {
                    id: true,
                    rating: true,
                    title: true,
                    body: true,
                    createdAt: true,
                    user: {
                        select: { fullName: true },
                    },
                },
            }),
            this.prisma.productReview.count({ where }),
        ]);

        return {
            data: reviews.map((r) => ({
                id: r.id,
                rating: r.rating,
                title: r.title,
                body: r.body,
                createdAt: r.createdAt.toISOString(),
                authorName: r.user?.fullName ?? 'Customer',
            })),
            total,
            page: safePage,
            limit: safeLimit,
            totalPages: Math.ceil(total / safeLimit) || 1,
        };
    }

    async createProductReview(
        productId: string,
        userId: string,
        dto: CreateReviewDto,
    ) {
        const product = await this.prisma.product.findFirst({
            where: {
                id: productId,
                status: ProductStatus.ACTIVE,
                store: this.marketplaceStoreWhere(),
            },
            select: { id: true, storeId: true },
        });
        if (!product) {
            throw new NotFoundException('Product not found');
        }

        let orderId = dto.orderId ?? null;
        if (orderId) {
            const order = await this.prisma.order.findFirst({
                where: {
                    id: orderId,
                    storeId: product.storeId,
                    lineItems: {
                        some: {
                            productVariant: { productId },
                        },
                    },
                },
                include: { fulfillment: true },
            });
            if (!order) {
                throw new BadRequestException(
                    'Order not found or does not include this product',
                );
            }
        } else {
            const delivered = await this.prisma.order.findFirst({
                where: {
                    storeId: product.storeId,
                    lineItems: {
                        some: { productVariant: { productId } },
                    },
                    fulfillment: {
                        status: FulfillmentStatus.FULFILLED,
                    },
                    OR: [
                        {
                            customerPhone: {
                                in: await this.userPhones(userId),
                            },
                        },
                        { createdBy: userId },
                    ],
                },
                select: { id: true },
            });
            if (delivered) {
                orderId = delivered.id;
            }
        }

        const review = await this.prisma.productReview.create({
            data: {
                productId,
                storeId: product.storeId,
                userId,
                orderId,
                rating: dto.rating,
                title: dto.title,
                body: dto.body,
                status: ReviewStatus.PENDING,
            },
        });

        return {
            id: review.id,
            status: review.status,
            rating: review.rating,
            message: 'Review submitted for moderation',
        };
    }

    private async userPhones(userId: string): Promise<string[]> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { phoneNumber: true },
        });
        return user?.phoneNumber ? [user.phoneNumber] : [];
    }

    async validatePromo(dto: PromoValidateDto) {
        const code = dto.code.trim().toUpperCase();
        const now = new Date();

        const promotions = await this.prisma.promotion.findMany({
            where: {
                code: { equals: code, mode: 'insensitive' },
                status: PromotionStatus.ACTIVE,
                startsAt: { lte: now },
                OR: [{ endsAt: null }, { endsAt: { gte: now } }],
                AND: [
                    {
                        OR: [
                            { scope: 'PLATFORM', storeId: null },
                            ...(dto.storeId
                                ? [
                                      {
                                          scope: 'STORE' as const,
                                          storeId: dto.storeId,
                                      },
                                  ]
                                : []),
                        ],
                    },
                ],
            },
            include: {
                targets: true,
                _count: { select: { redemptions: true } },
            },
            take: 5,
        });

        const promotion =
            promotions.find((p) => p.scope === 'STORE') ?? promotions[0];

        if (!promotion) {
            return {
                valid: false,
                discount: 0,
                message: 'Promo code is invalid or expired',
            };
        }

        if (
            promotion.maxRedemptions != null &&
            promotion._count.redemptions >= promotion.maxRedemptions
        ) {
            return {
                valid: false,
                discount: 0,
                message: 'Promo code redemption limit reached',
            };
        }

        if (dto.customerPhone && promotion.perUserLimit != null) {
            const userCount = await this.prisma.promotionRedemption.count({
                where: {
                    promotionId: promotion.id,
                    customerPhone: dto.customerPhone,
                },
            });
            if (userCount >= promotion.perUserLimit) {
                return {
                    valid: false,
                    discount: 0,
                    message: 'Promo code already used for this customer',
                };
            }
        }

        if (
            promotion.minOrderAmount != null &&
            dto.subtotal < Number(promotion.minOrderAmount)
        ) {
            return {
                valid: false,
                discount: 0,
                message: `Minimum order amount is ${Number(promotion.minOrderAmount)}`,
            };
        }

        let eligibleSubtotal = dto.subtotal;
        if (promotion.targets.length > 0) {
            const productIds = new Set(
                promotion.targets
                    .map((t) => t.productId)
                    .filter((id): id is string => !!id),
            );
            const categoryIds = new Set(
                promotion.targets
                    .map((t) => t.categoryId)
                    .filter((id): id is string => !!id),
            );

            let categoryProductIds = new Set<string>();
            if (categoryIds.size > 0) {
                const cats = await this.prisma.product.findMany({
                    where: {
                        id: {
                            in: dto.lineItems.map((l) => l.productId),
                        },
                        categoryId: { in: [...categoryIds] },
                    },
                    select: { id: true },
                });
                categoryProductIds = new Set(cats.map((c) => c.id));
            }

            eligibleSubtotal = dto.lineItems
                .filter(
                    (line) =>
                        productIds.has(line.productId) ||
                        categoryProductIds.has(line.productId),
                )
                .reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);

            if (eligibleSubtotal <= 0) {
                return {
                    valid: false,
                    discount: 0,
                    message: 'Promo code does not apply to cart items',
                };
            }
        }

        let discount = 0;
        if (promotion.type === PromotionType.PERCENT) {
            discount = (eligibleSubtotal * Number(promotion.value)) / 100;
        } else {
            discount = Math.min(Number(promotion.value), eligibleSubtotal);
        }
        discount = Math.round(discount * 100) / 100;

        return {
            valid: true,
            discount,
            promotionId: promotion.id,
            code: promotion.code,
            name: promotion.name,
            type: promotion.type,
            value: Number(promotion.value),
            message: 'Promo code applied',
        };
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
                            { slug: { equals: trimmed, mode: 'insensitive' } },
                            {
                                slug: {
                                    equals: normalizedIdentifier,
                                    mode: 'insensitive',
                                },
                            },
                        ],
                    },
                    select: { id: true },
                }),
            { label: 'catalog.resolveApprovedStoreId.direct' },
        );
        if (directMatch) {
            return directMatch.id;
        }

        const stores = await withDbRetry(
            this.prisma,
            () =>
                this.prisma.store.findMany({
                    where: {
                        status: { in: this.marketplaceStoreStatuses() },
                    },
                    select: {
                        id: true,
                        slug: true,
                        displayName: true,
                        registeredName: true,
                    },
                }),
            { label: 'catalog.resolveApprovedStoreId.fallback' },
        );

        const store = stores.find((current) => {
            const identifiers = [
                current.slug,
                current.displayName,
                current.registeredName,
            ];
            return identifiers.some(
                (value) =>
                    normalizeStoreIdentifier(value) === normalizedIdentifier,
            );
        });

        return store?.id ?? null;
    }

    private serializeStoreProfile(
        store: Prisma.StoreGetPayload<{ select: typeof catalogStoreSelect }>,
    ): PublicCatalogStoreProfile {
        const brandColors = store.brandColors as {
            primary?: string;
            secondary?: string;
        } | null;

        return {
            id: store.id,
            displayName: store.displayName,
            logoUrl: store.logoUrl,
            slug: store.slug,
            subdomain: store.slug,
            storeTemplate: 'DEFAULT',
            brandColors: brandColors ?? null,
            description: store.description,
            currency: store.currency,
            contactEmail: store.contactEmail,
            contactPhone: store.contactPhone,
            contactAddress: store.contactAddress ?? null,
            ratingAvg: Number(store.ratingAvg),
            ratingCount: store.ratingCount,
            aboutUs: store.aboutUs ?? null,
        };
    }

    private serializeProduct(p: ProductWithCatalog): PublicCatalogProduct {
        const variants = p.variants.map((v) => ({
            id: v.id,
            sku: v.sku,
            title: v.title,
            colorName: v.colorName,
            colorHex: v.colorHex,
            size: v.size,
            price: Number(v.price),
            compareAt: v.compareAt ? Number(v.compareAt) : null,
            attributes: (v.attributes as Record<string, unknown>) ?? {},
            images: v.images ?? [],
            inventory: v.inventory
                ? {
                      available: v.inventory.available,
                      status: v.inventory.status,
                  }
                : undefined,
        }));

        const prices = variants.map((v) => v.price);
        const priceFrom = prices.length ? Math.min(...prices) : null;
        const compareAtPrices = variants
            .map((v) => v.compareAt)
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
            categoryId: p.categoryId,
            productCategory: p.productCategory
                ? {
                      id: p.productCategory.id,
                      slug: p.productCategory.slug,
                      nameEn: p.productCategory.nameEn,
                      nameRw: p.productCategory.nameRw,
                  }
                : null,
            tags: p.tags,
            images: p.images,
            primaryImage: p.primaryImage,
            attributes: (p.attributes as Record<string, unknown>) ?? {},
            ratingAvg: Number(p.ratingAvg),
            ratingCount: p.ratingCount,
            averageRating: Number(p.ratingAvg),
            reviewCount: p.ratingCount,
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
