import { ProductStatus, StoreStatus } from '@prisma/client';
import { CatalogService } from './catalog.service';

describe('CatalogService', () => {
    const productRow = {
        id: 'p1',
        name: 'Test Product',
        description: null,
        vendor: 'Vendor',
        category: 'Fashion',
        categoryId: null,
        tags: [],
        images: [],
        primaryImage: null,
        attributes: {},
        ratingAvg: 4.5,
        ratingCount: 2,
        deliveryEnabled: true,
        deliveryLocation: null,
        deliveryPrice: null,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        storeId: 's1',
        productCategory: null,
        store: {
            id: 's1',
            displayName: 'Demo Store',
            logoUrl: null,
            slug: 'demo-store',
            brandColors: { primary: '#111' },
            description: null,
            currency: 'RWF',
            contactEmail: null,
            contactPhone: null,
            contactAddress: null,
            ratingAvg: 0,
            ratingCount: 0,
            approvedAt: new Date(),
            createdAt: new Date(),
            aboutUs: null,
        },
        variants: [
            {
                id: 'v1',
                sku: 'SKU-1',
                title: 'Default',
                colorName: null,
                colorHex: null,
                size: null,
                price: 1000,
                compareAt: 1200,
                attributes: {},
                images: [],
                inventory: { available: 5, status: 'IN_STOCK' },
            },
        ],
    };

    function buildService(overrides: Record<string, unknown> = {}) {
        const prisma = {
            product: {
                findMany: jest.fn().mockResolvedValue([productRow]),
                findFirst: jest.fn().mockResolvedValue(productRow),
                groupBy: jest.fn().mockResolvedValue([]),
                count: jest.fn().mockResolvedValue(1),
            },
            store: {
                findMany: jest.fn().mockResolvedValue([productRow.store]),
                findFirst: jest.fn().mockResolvedValue({ id: 's1' }),
                count: jest.fn().mockResolvedValue(1),
            },
            productCategory: {
                findMany: jest.fn().mockResolvedValue([]),
            },
            productVariant: {
                findMany: jest.fn().mockResolvedValue([]),
            },
            orderLineItem: {
                groupBy: jest.fn().mockResolvedValue([]),
            },
            promotion: {
                findMany: jest.fn().mockResolvedValue([]),
            },
            productReview: {
                findMany: jest.fn().mockResolvedValue([]),
                count: jest.fn().mockResolvedValue(0),
                create: jest.fn(),
            },
            promotionRedemption: {
                count: jest.fn().mockResolvedValue(0),
            },
            shopperProfile: {
                findUnique: jest.fn().mockResolvedValue(null),
                create: jest.fn(),
                update: jest.fn(),
            },
            shopperEvent: {
                createMany: jest.fn().mockResolvedValue({ count: 0 }),
            },
            $connect: jest.fn().mockResolvedValue(undefined),
            $disconnect: jest.fn().mockResolvedValue(undefined),
            $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
            ...overrides,
        };

        const config = {
            get: jest.fn().mockReturnValue('local'),
        };
        const shopperProfiles = {
            loadAffinity: jest.fn().mockResolvedValue({
                visitorId: null,
                affinity: {
                    searches: [],
                    categories: {},
                    stores: {},
                    products: {},
                    tags: {},
                    priceBand: { low: 0, mid: 0, high: 0 },
                },
                context: {},
            }),
            ingest: jest.fn(),
        };

        return {
            service: new CatalogService(prisma as any, config as any, shopperProfiles as any),
            prisma,
        };
    }

    it('getHome returns ranked sections with serialized products', async () => {
        const { service, prisma } = buildService();
        const home = await service.getHome();

        expect(home.topRated).toHaveLength(1);
        expect(home.topRated[0].store.slug).toBe('demo-store');
        expect(home.topRated[0].priceFrom).toBe(1000);
        expect(home.newArrivals).toHaveLength(1);
        expect(home.risingStores).toHaveLength(1);
        expect(home.onPromotion).toBeDefined();
        expect(prisma.product.findMany).toHaveBeenCalled();
    });

    it('validatePromo rejects unknown codes', async () => {
        const { service } = buildService({
            promotion: { findMany: jest.fn().mockResolvedValue([]) },
        });

        const result = await service.validatePromo({
            code: 'NOPE',
            subtotal: 10000,
            lineItems: [
                {
                    productId: 'p1',
                    unitPrice: 10000,
                    quantity: 1,
                },
            ],
        });

        expect(result.valid).toBe(false);
        expect(result.discount).toBe(0);
    });

    it('validatePromo applies percent discount', async () => {
        const { service } = buildService({
            promotion: {
                findMany: jest.fn().mockResolvedValue([
                    {
                        id: 'promo1',
                        code: 'SAVE10',
                        name: 'Save 10',
                        type: 'PERCENT',
                        value: 10,
                        scope: 'PLATFORM',
                        storeId: null,
                        minOrderAmount: null,
                        maxRedemptions: null,
                        perUserLimit: null,
                        targets: [],
                        _count: { redemptions: 0 },
                    },
                ]),
            },
        });

        const result = await service.validatePromo({
            code: 'SAVE10',
            subtotal: 10000,
            lineItems: [
                { productId: 'p1', unitPrice: 10000, quantity: 1 },
            ],
        });

        expect(result.valid).toBe(true);
        expect(result.discount).toBe(1000);
    });

    it('getCatalogGrouped resolves store by slug', async () => {
        const { service, prisma } = buildService();
        prisma.store.findFirst = jest.fn().mockResolvedValue({ id: 's1' });

        const result = await service.getCatalogGrouped(undefined, 'demo-store');
        expect(result.groups.length).toBeGreaterThanOrEqual(1);
        expect(prisma.product.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: expect.objectContaining({
                    status: ProductStatus.ACTIVE,
                    store: expect.objectContaining({
                        status: {
                            in: [StoreStatus.APPROVED, StoreStatus.SUBMITTED],
                        },
                        id: 's1',
                    }),
                }),
            }),
        );
    });
});
