import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../common/database/services/database.service';

@Injectable()
export class AnalyticsService {
    constructor(private readonly prisma: DatabaseService) {}

    async getDashboardMetrics(storeId: string, period: string = 'today') {
        const dateRange = this.getDateRange(period);

        const [orders, products, inventory] = await Promise.all([
            this.prisma.order.findMany({
                where: {
                    storeId,
                    placedAt: {
                        gte: dateRange.start,
                        lte: dateRange.end,
                    },
                },
                include: {
                    payment: true,
                    fulfillment: true,
                },
            }),
            this.prisma.product.count({
                where: { storeId, status: 'ACTIVE' },
            }),
            this.prisma.inventoryRecord.findMany({
                where: {
                    productVariant: {
                        product: {
                            storeId,
                        },
                    },
                },
            }),
        ]);

        const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total), 0);
        const totalOrders = orders.length;
        const completedOrders = orders.filter(
            (o) => o.fulfillment?.status === 'FULFILLED',
        ).length;
        const pendingOrders = orders.filter(
            (o) => o.payment?.status === 'PENDING',
        ).length;

        const lowStockCount = inventory.filter((i) => i.status === 'LOW_STOCK').length;
        const outOfStockCount = inventory.filter((i) => i.status === 'OUT_OF_STOCK').length;

        const uniqueCustomers = new Set(orders.map((o) => o.customerEmail)).size;

        return {
            totalRevenue,
            totalOrders,
            activeProducts: products,
            totalCustomers: uniqueCustomers,
            completedOrders,
            pendingOrders,
            lowStockCount,
            outOfStockCount,
        };
    }

    async getSalesTrends(storeId: string, days: number = 7) {
        const snapshots = await this.prisma.dailyMetricsSnapshot.findMany({
            where: {
                storeId,
                snapshotDate: {
                    gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000),
                },
            },
            orderBy: {
                snapshotDate: 'asc',
            },
        });

        return snapshots.map((s) => ({
            date: s.snapshotDate,
            revenue: Number(s.totalRevenue),
            cost: Number(s.totalCost),
            orders: s.totalOrders,
            profit: Number(s.totalProfit),
        }));
    }

    async getTopProducts(storeId: string, limit: number = 10) {
        const orderLineItems = await this.prisma.orderLineItem.findMany({
            where: {
                order: {
                    storeId,
                },
            },
            include: {
                productVariant: {
                    include: {
                        product: true,
                    },
                },
            },
        });

        const productSales = orderLineItems.reduce((acc: any, item) => {
            const productId = item.productVariant.product.id;
            if (!acc[productId]) {
                acc[productId] = {
                    productId,
                    productName: item.productName,
                    unitsSold: 0,
                    revenue: 0,
                };
            }
            acc[productId].unitsSold += item.quantity;
            acc[productId].revenue += Number(item.total);
            return acc;
        }, {});

        return Object.values(productSales)
            .sort((a: any, b: any) => b.revenue - a.revenue)
            .slice(0, limit);
    }

    async getInventorySummary(storeId: string) {
        const inventory = await this.prisma.inventoryRecord.findMany({
            where: {
                productVariant: {
                    product: {
                        storeId,
                    },
                },
            },
            include: {
                productVariant: true,
            },
        });

        const totalProducts = inventory.length;
        const inStock = inventory.filter((i) => i.status === 'IN_STOCK').length;
        const lowStock = inventory.filter((i) => i.status === 'LOW_STOCK').length;
        const outOfStock = inventory.filter((i) => i.status === 'OUT_OF_STOCK').length;

        const totalStockValue = inventory.reduce(
            (sum, i) => sum + i.onHand * Number(i.productVariant.price),
            0,
        );
        const totalStockQuantity = inventory.reduce((sum, i) => sum + i.onHand, 0);

        return {
            totalProducts,
            inStock,
            lowStock,
            outOfStock,
            totalStockValue,
            totalStockQuantity,
        };
    }

    async getRecentActivity(storeId: string, limit: number = 10) {
        const events = await this.prisma.orderEvent.findMany({
            where: { order: { storeId } },
            include: {
                order: { select: { orderNumber: true, customerName: true } },
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });

        return events.map((e) => ({
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
        } = {}
    ) {
        const topLimit = options.topLimit ?? 3;
        const trendDays = options.trendDays ?? 365;
        const activityLimit = options.activityLimit ?? 8;

        const metrics = await this.getDashboardMetrics(storeId, period);
        const topProducts = await this.getTopProducts(storeId, topLimit);
        const inventory = await this.getInventorySummary(storeId);
        const salesTrend = await this.getSalesTrends(storeId, trendDays);
        const recentActivity = await this.getRecentActivity(
            storeId,
            activityLimit
        );

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
            this.getTopProducts(storeId, 10),
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
            ...(topProducts as any[]).map((p) => `${p.productName},${p.unitsSold},${p.revenue}`),
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
