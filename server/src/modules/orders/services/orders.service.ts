import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ProductStatus, StoreStatus } from '@prisma/client';
import { OrdersRepository } from '../repositories/orders.repository';
import { DatabaseService } from '../../../common/database/services/database.service';
import {
    InsufficientStockException,
    OrderNotFoundException,
    ProductVariantNotFoundException,
} from '../../../common/exceptions/domain.exception';
import { APP_ENVIRONMENT } from '../../../app/enums/app.enum';
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

import { PlaceGuestOrderDto } from '../dtos/place-guest-order.dto';

@Injectable()
export class OrdersService {
    constructor(
        private readonly ordersRepository: OrdersRepository,
        private readonly prisma: DatabaseService,
        private readonly config: ConfigService,
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

        await this.ordersRepository.createMessage({
            sender: MessageSender.CUSTOMER as PrismaMessageSender,
            senderName: dto.customerName || 'Customer',
            message: 'New order placed.',
            order: {
                connect: { id: order.id },
            },
        });

        return this.findById(order.id, storeId);
    }

    async getNotifications(storeId: string, limit = 10) {
        const notifications = await this.ordersRepository.findUnreadCustomerMessagesForStore(
            storeId,
            limit,
        );

        return notifications.map((n) => ({
            id: n.id,
            orderId: n.order.id,
            orderNumber: n.order.orderNumber,
            title: 'New order received',
            body: n.message,
            createdAt: n.createdAt,
        }));
    }

    async markNotificationsRead(storeId: string, ids: string[]) {
        if (ids.length === 0) return { count: 0 };

        // Ensure tenant safety: only mark messages belonging to this store.
        const allowed = await this.prisma.orderMessage.findMany({
            where: {
                id: { in: ids },
                order: { storeId },
            },
            select: { id: true },
        });

        const allowedIds = allowed.map((m) => m.id);
        return this.ordersRepository.markMessagesRead(allowedIds);
    }

    async createGuestOrder(dto: PlaceGuestOrderDto) {
        const variantIds = dto.items.map((item) => item.productVariantId);
        const quantityByVariant = new Map(
            dto.items.map((item) => [item.productVariantId, item.quantity]),
        );

        const variants = await this.prisma.productVariant.findMany({
            where: { id: { in: variantIds } },
            include: {
                product: {
                    include: {
                        store: {
                            select: {
                                id: true,
                                displayName: true,
                                status: true,
                                contactPhone: true,
                            },
                        },
                    },
                },
                inventory: true,
            },
        });

        if (variants.length !== variantIds.length) {
            const found = new Set(variants.map((variant) => variant.id));
            const missing = variantIds.find((id) => !found.has(id));
            throw new ProductVariantNotFoundException(missing);
        }

        const allowedStoreStatuses = this.guestCheckoutStoreStatuses();
        const grouped = new Map<
            string,
            {
                storeName: string;
                vendorContactPhone: string | null;
                lines: Array<{
                    productVariantId: string;
                    productName: string;
                    sku: string;
                    quantity: number;
                    unitPrice: number;
                    total: number;
                }>;
            }
        >();

        for (const variant of variants) {
            const store = variant.product.store;
            if (!allowedStoreStatuses.includes(store.status)) {
                throw new ProductVariantNotFoundException(variant.id);
            }
            if (variant.product.status !== ProductStatus.ACTIVE) {
                throw new ProductVariantNotFoundException(variant.id);
            }

            const quantity = quantityByVariant.get(variant.id) ?? 0;
            const available = variant.inventory?.available ?? 0;
            if (available < quantity) {
                throw new InsufficientStockException(available, quantity);
            }

            const unitPrice = Number(variant.price);
            const line = {
                productVariantId: variant.id,
                productName: `${variant.product.name} — ${variant.title}`,
                sku: variant.sku,
                quantity,
                unitPrice,
                total: unitPrice * quantity,
            };

            const bucket = grouped.get(store.id);
            if (bucket) {
                bucket.lines.push(line);
            } else {
                grouped.set(store.id, {
                    storeName: store.displayName,
                    vendorContactPhone: store.contactPhone,
                    lines: [line],
                });
            }
        }

        const customerName = dto.customerName?.trim() || 'Customer';
        const customerPhone = dto.customerPhone.trim();
        const createdOrders: Array<{
            id: string;
            orderNumber: string;
            storeId: string;
            storeName: string;
            total: number;
        }> = [];

        for (const [storeId, bucket] of grouped.entries()) {
            const subtotal = bucket.lines.reduce((sum, line) => sum + line.total, 0);
            const orderPayload = {
                customerName,
                customerPhone,
                customerEmail: '',
                shippingAddress: {
                    physicalAddress: 'Phone order — delivery details to confirm with customer',
                },
                subtotal,
                deliveryFee: 0,
                discount: 0,
                tax: 0,
                total: subtotal,
                customerNote: `Customer phone for vendor follow-up: ${customerPhone}`,
                paymentMethod: PaymentMethod.CASH_ON_DELIVERY,
                deliveryMethod: 'Phone order',
                items: bucket.lines,
            };

            const order = await this.create(storeId, 'guest', orderPayload);

            await this.ordersRepository.createMessage({
                sender: MessageSender.CUSTOMER as PrismaMessageSender,
                senderName: customerName,
                message: `New order placed. Contact customer at ${customerPhone}.`,
                order: {
                    connect: { id: order.id },
                },
            });

            createdOrders.push({
                id: order.id,
                orderNumber: order.orderNumber,
                storeId,
                storeName: bucket.storeName,
                total: subtotal,
            });
        }

        return { orders: createdOrders };
    }

    private guestCheckoutStoreStatuses(): StoreStatus[] {
        const env = this.config.get<string>('app.env');
        if (env === APP_ENVIRONMENT.LOCAL) {
            return [StoreStatus.APPROVED, StoreStatus.SUBMITTED];
        }

        return [StoreStatus.APPROVED];
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
        await this.findById(id, storeId);

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

    async sendMessage(id: string, storeId: string, _userId: string, dto: any) {
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

    async exportCsv(storeId: string): Promise<string> {
        const orders = await this.ordersRepository.findMany(storeId, {
            orderBy: { placedAt: 'desc' },
        });

        const headers = ['Order #', 'Customer', 'Email', 'Phone', 'Total', 'Payment Status', 'Fulfillment Status', 'Date'];
        const rows = (orders as any[]).map((o) => [
            o.orderNumber,
            o.customerName,
            o.customerEmail || '',
            o.customerPhone || '',
            Number(o.total),
            o.payment?.status || '',
            o.fulfillment?.status || '',
            o.placedAt.toISOString().split('T')[0],
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

    private async generateOrderNumber(storeId: string): Promise<string> {
        const storeCount = await this.ordersRepository.count(storeId);
        const candidate = 1000 + storeCount + 1;

        for (let attempt = 0; attempt < 50; attempt++) {
            const orderNumber = `#${candidate + attempt}`;
            const existing = await this.prisma.order.findUnique({
                where: { orderNumber },
                select: { id: true },
            });
            if (!existing) {
                return orderNumber;
            }
        }

        return `#${Date.now()}`;
    }
}
