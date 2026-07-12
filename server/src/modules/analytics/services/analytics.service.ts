import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../common/database/services/database.service';

@Injectable()
export class AnalyticsService {
    constructor(private readonly prisma: DatabaseService) {}

    async getDashboardMetrics(storeId: string, period: string = 'today') {
        const dateRange = this.getDateRange(period);
        const orderWhere = {
            storeId,
            placedAt: {
                gte: dateRange.start,
                lte: dateRange.end,
            },
        };
        const inventoryWhere = {
            productVariant: {
                product: {
                    storeId,
                },
            },
        };

        const [
            revenueAgg,
            totalOrders,
            completedOrders,
            pendingOrders,
            customerGroups,
            activeProducts,
            inventoryByStatus,
        ] = await Promise.all([
            this.prisma.order.aggregate({
                where: orderWhere,
                _sum: { total: true },
            }),
            this.prisma.order.count({ where: orderWhere }),
            this.prisma.order.count({
                where: {
                    ...orderWhere,
                    fulfillment: { status: 'FULFILLED' },
                },
            }),
            this.prisma.order.count({
                where: {
                    ...orderWhere,
                    payment: { status: 'PENDING' },
                },
            }),
            this.prisma.order.groupBy({
                by: ['customerEmail'],
                where: orderWhere,
            }),
            this.prisma.product.count({
                where: { storeId, status: 'ACTIVE' },
            }),
            this.prisma.inventoryRecord.groupBy({
                by: ['status'],
                where: inventoryWhere,
                _count: { _all: true },
            }),
        ]);

        const statusCount = (status: string) =>
            inventoryByStatus.find(row => row.status === status)?._count._all ?? 0;

        return {
            totalRevenue: Number(revenueAgg._sum.total ?? 0),
            totalOrders,
            activeProducts,
            totalCustomers: customerGroups.length,
            completedOrders,
            pendingOrders,
            lowStockCount: statusCount('LOW_STOCK'),
            outOfStockCount: statusCount('OUT_OF_STOCK'),
        };
    }

    async getSalesTrends(storeId: string, days: number = 7) {
        const safeDays = Math.min(Math.max(days, 1), 366);
        const snapshots = await this.prisma.dailyMetricsSnapshot.findMany({
            where: {
                storeId,
                snapshotDate: {
                    gte: new Date(Date.now() - safeDays * 24 * 60 * 60 * 1000),
                },
            },
            orderBy: {
                snapshotDate: 'asc',
            },
            take: safeDays + 1,
        });

        return snapshots.map(s => ({
            date: s.snapshotDate,
            revenue: Number(s.totalRevenue),
            cost: Number(s.totalCost),
            orders: s.totalOrders,
            profit: Number(s.totalProfit),
        }));
    }

    async getTopProducts(
        storeId: string,
        limit: number = 10,
        period?: string,
    ) {
        const safeLimit = Math.min(Math.max(limit, 1), 50);
        const dateRange = period ? this.getDateRange(period) : null;

        const variantSales = await this.prisma.orderLineItem.groupBy({
            by: ['productVariantId'],
            where: {
                order: {
                    storeId,
                    ...(dateRange
                        ? {
                              placedAt: {
                                  gte: dateRange.start,
                                  lte: dateRange.end,
                              },
                          }
                        : {}),
                },
            },
            _sum: {
                quantity: true,
                total: true,
            },
            orderBy: {
                _sum: {
                    total: 'desc',
                },
            },
            take: Math.min(safeLimit * 10, 200),
        });

        if (variantSales.length === 0) {
            return [];
        }

        const variants = await this.prisma.productVariant.findMany({
            where: {
                id: { in: variantSales.map(row => row.productVariantId) },
            },
            select: {
                id: true,
                product: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        const variantById = new Map(variants.map(v => [v.id, v]));
        const productSales = new Map<
            string,
            { productId: string; productName: string; unitsSold: number; revenue: number }
        >();

        for (const row of variantSales) {
            const variant = variantById.get(row.productVariantId);
            if (!variant) continue;

            const productId = variant.product.id;
            const existing = productSales.get(productId);
            const unitsSold = row._sum.quantity ?? 0;
            const revenue = Number(row._sum.total ?? 0);

            if (existing) {
                existing.unitsSold += unitsSold;
                existing.revenue += revenue;
            } else {
                productSales.set(productId, {
                    productId,
                    productName: variant.product.name,
                    unitsSold,
                    revenue,
                });
            }
        }

        return [...productSales.values()]
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, safeLimit);
    }

    async getInventorySummary(storeId: string) {
        const inventoryWhere = {
            productVariant: {
                product: {
                    storeId,
                },
            },
        };

        const [statusGroups, valueRows] = await Promise.all([
            this.prisma.inventoryRecord.groupBy({
                by: ['status'],
                where: inventoryWhere,
                _count: { _all: true },
                _sum: { onHand: true },
            }),
            this.prisma.$queryRaw<Array<{ totalValue: unknown }>>`
                SELECT COALESCE(SUM(ir."onHand" * pv.price), 0) AS "totalValue"
                FROM inventory_records ir
                INNER JOIN product_variants pv ON pv.id = ir."productVariantId"
                INNER JOIN products p ON p.id = pv."productId"
                WHERE p."storeId" = ${storeId}
            `,
        ]);

        const countFor = (status: string) =>
            statusGroups.find(row => row.status === status)?._count._all ?? 0;

        const totalProducts = statusGroups.reduce(
            (sum, row) => sum + row._count._all,
            0,
        );
        const totalStockQuantity = statusGroups.reduce(
            (sum, row) => sum + (row._sum.onHand ?? 0),
            0,
        );
        const totalStockValue = Number(valueRows[0]?.totalValue ?? 0);

        return {
            totalProducts,
            inStock: countFor('IN_STOCK'),
            lowStock: countFor('LOW_STOCK'),
            outOfStock: countFor('OUT_OF_STOCK'),
            totalStockValue,
            totalStockQuantity,
        };
    }

    async getRecentActivity(storeId: string, limit: number = 10) {
        const safeLimit = Math.min(Math.max(limit, 1), 50);
        const events = await this.prisma.orderEvent.findMany({
            where: { order: { storeId } },
            include: {
                order: { select: { orderNumber: true, customerName: true } },
            },
            orderBy: { createdAt: 'desc' },
            take: safeLimit,
        });

        return events.map(e => ({
            id: e.id,
            type: e.type,
            title: e.title,
            description: e.description,
            orderNumber: e.order.orderNumber,
            customerName: e.order.customerName,
            createdAt: e.createdAt,
        }));
    }

    async getDashboardOverview(
        storeId: string,
        period: string = 'month',
        options: {
            topLimit?: number;
            trendDays?: number;
            activityLimit?: number;
        } = {},
    ) {
        const topLimit = options.topLimit ?? 3;
        const trendDays = options.trendDays ?? 365;
        const activityLimit = options.activityLimit ?? 8;

        const [metrics, topProducts, inventory, salesTrend, recentActivity] =
            await Promise.all([
                this.getDashboardMetrics(storeId, period),
                this.getTopProducts(storeId, topLimit, period),
                this.getInventorySummary(storeId),
                this.getSalesTrends(storeId, trendDays),
                this.getRecentActivity(storeId, activityLimit),
            ]);

        return {
            metrics,
            topProducts,
            inventory,
            salesTrend,
            recentActivity,
        };
    }

    async getReport(storeId: string, period: string = 'month'): Promise<string> {
        const [dashboard, topProducts] = await Promise.all([
            this.getDashboardMetrics(storeId, period),
            this.getTopProducts(storeId, 10, period),
        ]);

        const lines: string[] = [
            'DASHBOARD REPORT',
            `Period,${period}`,
            `Generated,${new Date().toISOString()}`,
            '',
            'METRICS',
            `Total Revenue,${dashboard.totalRevenue}`,
            `Total Orders,${dashboard.totalOrders}`,
            `Active Products,${dashboard.activeProducts}`,
            `Total Customers,${dashboard.totalCustomers}`,
            `Completed Orders,${dashboard.completedOrders}`,
            `Pending Orders,${dashboard.pendingOrders}`,
            `Low Stock Items,${dashboard.lowStockCount}`,
            `Out of Stock Items,${dashboard.outOfStockCount}`,
            '',
            'TOP PRODUCTS',
            'Product Name,Units Sold,Revenue',
            ...(topProducts as any[]).map(
                p => `${p.productName},${p.unitsSold},${p.revenue}`,
            ),
        ];

        return lines.join('\n');
    }

    private getDateRange(period: string) {
        const now = new Date();
        const start = new Date();

        switch (period) {
            case 'today':
                start.setHours(0, 0, 0, 0);
                break;
            case 'week':
                start.setDate(now.getDate() - 7);
                break;
            case 'month':
                start.setMonth(now.getMonth() - 1);
                break;
            case 'year':
                start.setFullYear(now.getFullYear() - 1);
                break;
            default:
                start.setHours(0, 0, 0, 0);
        }

        return { start, end: now };
    }
}
