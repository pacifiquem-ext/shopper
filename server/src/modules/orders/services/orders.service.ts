import { Injectable } from '@nestjs/common';
import { OrdersRepository } from '../repositories/orders.repository';
import { DatabaseService } from '../../../common/database/services/database.service';
import { OrderNotFoundException } from '../../../common/exceptions/domain.exception';
import {
    PaymentStatus,
    PaymentMethod,
    FulfillmentStatus,
    OrderEventType,
    MessageSender,
} from '../../../common/constants/status.constants';
import {
    PaymentStatus as PrismaPaymentStatus,
    PaymentMethod as PrismaPaymentMethod,
    FulfillmentStatus as PrismaFulfillmentStatus,
    OrderEventType as PrismaOrderEventType,
    MessageSender as PrismaMessageSender,
} from '@prisma/client';

@Injectable()
export class OrdersService {
    constructor(
        private readonly ordersRepository: OrdersRepository,
        private readonly prisma: DatabaseService,
    ) {}

    async create(storeId: string, userId: string, dto: any) {
        const orderNumber = await this.generateOrderNumber(storeId);

        const order = await this.ordersRepository.create({
            orderNumber,
            customerName: dto.customerName,
            customerPhone: dto.customerPhone,
            customerEmail: dto.customerEmail,
            shippingAddress: JSON.stringify(dto.shippingAddress),
            billingAddress: JSON.stringify(dto.billingAddress || dto.shippingAddress),
            subtotal: dto.subtotal,
            deliveryFee: dto.deliveryFee || 0,
            discount: dto.discount || 0,
            tax: dto.tax || 0,
            total: dto.total,
            customerNote: dto.customerNote,
            createdBy: userId,
            store: {
                connect: { id: storeId },
            },
        });

        for (const item of dto.items) {
            await this.ordersRepository.createLineItem({
                productName: item.productName,
                sku: item.sku,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                total: item.total,
                order: {
                    connect: { id: order.id },
                },
                productVariant: {
                    connect: { id: item.productVariantId },
                },
            });

            await this.prisma.inventoryRecord.update({
                where: { productVariantId: item.productVariantId },
                data: {
                    reserved: {
                        increment: item.quantity,
                    },
                    available: {
                        decrement: item.quantity,
                    },
                },
            });
        }

        await this.ordersRepository.createPayment({
            status: PaymentStatus.PENDING as PrismaPaymentStatus,
            method: dto.paymentMethod as PrismaPaymentMethod,
            amount: dto.total,
            order: {
                connect: { id: order.id },
            },
        });

        await this.ordersRepository.createFulfillment({
            status: FulfillmentStatus.UNFULFILLED as PrismaFulfillmentStatus,
            deliveryMethod: dto.deliveryMethod || 'Standard Delivery',
            order: {
                connect: { id: order.id },
            },
        });

        await this.ordersRepository.createEvent({
            type: OrderEventType.CREATED as PrismaOrderEventType,
            title: 'Order Created',
            description: 'Order was successfully created',
            performedBy: userId,
            order: {
                connect: { id: order.id },
            },
        });

        return this.findById(order.id, storeId);
    }

    async findAll(storeId: string, filters: any) {
        const { page = 1, limit = 10, paymentStatus, fulfillmentStatus, search, dateFrom, dateTo } = filters;
        const skip = (page - 1) * limit;

        const where: any = {};

        if (paymentStatus) {
            where.payment = { status: paymentStatus };
        }

        if (fulfillmentStatus) {
            where.fulfillment = { status: fulfillmentStatus };
        }

        if (dateFrom || dateTo) {
            where.placedAt = {};
            if (dateFrom) where.placedAt.gte = new Date(dateFrom);
            if (dateTo) where.placedAt.lte = new Date(dateTo);
        }

        if (search) {
            where.OR = [
                { orderNumber: { contains: search, mode: 'insensitive' } },
                { customerName: { contains: search, mode: 'insensitive' } },
                { customerEmail: { contains: search, mode: 'insensitive' } },
                { customerPhone: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [orders, total] = await Promise.all([
            this.ordersRepository.findMany(storeId, {
                skip,
                take: limit,
                where,
                orderBy: { placedAt: 'desc' },
            }),
            this.ordersRepository.count(storeId, where),
        ]);

        return {
            data: orders,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    async findById(id: string, storeId: string) {
        const order = await this.ordersRepository.findById(id, storeId);

        if (!order) {
            throw new OrderNotFoundException(id);
        }

        return order;
    }

    async updatePayment(id: string, storeId: string, userId: string, dto: any) {
        const order = await this.findById(id, storeId);

        await this.ordersRepository.updatePayment(id, {
            status: dto.status as PrismaPaymentStatus,
            reference: dto.reference,
            paymentProofUrl: dto.paymentProofUrl,
            paidAt: dto.status === PaymentStatus.SUCCESS ? new Date() : null,
        });

        if (dto.status === PaymentStatus.SUCCESS) {
            await this.ordersRepository.createEvent({
                type: OrderEventType.PAID as PrismaOrderEventType,
                title: 'Payment Confirmed',
                description: 'Payment has been verified',
                performedBy: userId,
                order: {
                    connect: { id },
                },
            });
        }

        return this.findById(id, storeId);
    }

    async updateFulfillment(id: string, storeId: string, userId: string, dto: any) {
        const order = await this.findById(id, storeId);

        await this.ordersRepository.updateFulfillment(id, {
            status: dto.status as PrismaFulfillmentStatus,
            trackingNumber: dto.trackingNumber,
            courierName: dto.courierName,
            driverName: dto.driverName,
            packedBy: dto.status === FulfillmentStatus.PACKED ? userId : order.fulfillment?.packedBy,
            deliveredBy: dto.status === FulfillmentStatus.FULFILLED ? dto.deliveredBy : null,
            deliveredAt: dto.status === FulfillmentStatus.FULFILLED ? new Date() : null,
        });

        const eventTypeMap: any = {
            [FulfillmentStatus.PACKED]: OrderEventType.PACKED,
            [FulfillmentStatus.SHIPPED]: OrderEventType.SHIPPED,
            [FulfillmentStatus.FULFILLED]: OrderEventType.DELIVERED,
            [FulfillmentStatus.CANCELLED]: OrderEventType.CANCELLED,
        };

        if (eventTypeMap[dto.status]) {
            await this.ordersRepository.createEvent({
                type: eventTypeMap[dto.status] as PrismaOrderEventType,
                title: `Order ${dto.status}`,
                description: `Order status updated to ${dto.status}`,
                performedBy: userId,
                order: {
                    connect: { id },
                },
            });
        }

        if (dto.status === FulfillmentStatus.FULFILLED) {
            for (const item of order.lineItems) {
                await this.prisma.inventoryRecord.update({
                    where: { productVariantId: item.productVariantId },
                    data: {
                        onHand: {
                            decrement: item.quantity,
                        },
                        reserved: {
                            decrement: item.quantity,
                        },
                        lastSoldAt: new Date(),
                    },
                });
            }
        }

        return this.findById(id, storeId);
    }

    async sendMessage(id: string, storeId: string, userId: string, dto: any) {
        await this.findById(id, storeId);

        await this.ordersRepository.createMessage({
            sender: MessageSender.ADMIN as PrismaMessageSender,
            senderName: dto.senderName || 'Store Admin',
            message: dto.message,
            order: {
                connect: { id },
            },
        });

        return this.findById(id, storeId);
    }

    async getMessages(id: string, storeId: string) {
        await this.findById(id, storeId);
        return this.ordersRepository.findMessages(id);
    }

    private async generateOrderNumber(storeId: string): Promise<string> {
        const count = await this.ordersRepository.count(storeId);
        return `#${1000 + count + 1}`;
    }
}
