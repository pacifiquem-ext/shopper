import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../common/database/services/database.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class OrdersRepository {
    constructor(private readonly prisma: DatabaseService) {}

    async create(data: Prisma.OrderCreateInput) {
        return this.prisma.order.create({ data });
    }

    async findById(id: string, storeId: string) {
        return this.prisma.order.findFirst({
            where: { id, storeId },
            include: {
                lineItems: {
                    include: {
                        productVariant: true,
                    },
                },
                payment: true,
                fulfillment: {
                    include: {
                        deliveryZone: true,
                    },
                },
                events: {
                    orderBy: { createdAt: 'desc' },
                },
                messages: {
                    orderBy: { createdAt: 'desc' },
                },
            },
        });
    }

    async findMany(storeId: string, params: {
        skip?: number;
        take?: number;
        where?: Prisma.OrderWhereInput;
        orderBy?: Prisma.OrderOrderByWithRelationInput;
    }) {
        const { skip, take, where, orderBy } = params;

        return this.prisma.order.findMany({
            skip,
            take,
            where: {
                ...where,
                storeId,
            },
            orderBy,
            include: {
                payment: true,
                fulfillment: true,
                lineItems: true,
            },
        });
    }

    async count(storeId: string, where?: Prisma.OrderWhereInput) {
        return this.prisma.order.count({
            where: {
                ...where,
                storeId,
            },
        });
    }

    async update(id: string, storeId: string, data: Prisma.OrderUpdateInput) {
        return this.prisma.order.updateMany({
            where: { id, storeId },
            data,
        });
    }

    async createLineItem(data: Prisma.OrderLineItemCreateInput) {
        return this.prisma.orderLineItem.create({ data });
    }

    async createPayment(data: Prisma.OrderPaymentCreateInput) {
        return this.prisma.orderPayment.create({ data });
    }

    async updatePayment(orderId: string, data: Prisma.OrderPaymentUpdateInput) {
        return this.prisma.orderPayment.update({
            where: { orderId },
            data,
        });
    }

    async createFulfillment(data: Prisma.OrderFulfillmentCreateInput) {
        return this.prisma.orderFulfillment.create({ data });
    }

    async updateFulfillment(orderId: string, data: Prisma.OrderFulfillmentUpdateInput) {
        return this.prisma.orderFulfillment.update({
            where: { orderId },
            data,
        });
    }

    async createEvent(data: Prisma.OrderEventCreateInput) {
        return this.prisma.orderEvent.create({ data });
    }

    async createMessage(data: Prisma.OrderMessageCreateInput) {
        return this.prisma.orderMessage.create({ data });
    }

    async findMessages(orderId: string) {
        return this.prisma.orderMessage.findMany({
            where: { orderId },
            orderBy: { createdAt: 'asc' },
        });
    }

    async findPayments(
        storeId: string,
        params: {
            skip?: number;
            take?: number;
            status?: string;
            method?: string;
            dateFrom?: string;
            dateTo?: string;
        },
    ) {
        const where: any = { order: { storeId } };
        if (params.status) where.status = params.status;
        if (params.method) where.method = params.method;
        if (params.dateFrom || params.dateTo) {
            where.createdAt = {};
            if (params.dateFrom) where.createdAt.gte = new Date(params.dateFrom);
            if (params.dateTo) where.createdAt.lte = new Date(params.dateTo);
        }

        const [payments, total] = await Promise.all([
            this.prisma.orderPayment.findMany({
                skip: params.skip,
                take: params.take,
                where,
                include: {
                    order: {
                        select: {
                            orderNumber: true,
                            customerName: true,
                            customerEmail: true,
                            customerPhone: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.orderPayment.count({ where }),
        ]);

        return { payments, total };
    }
}
