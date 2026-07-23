import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
    ProductStatus,
    StoreStatus,
    Prisma,
    PaymentStatus as PrismaPaymentStatus,
    PaymentMethod as PrismaPaymentMethod,
    FulfillmentStatus as PrismaFulfillmentStatus,
    OrderEventType as PrismaOrderEventType,
    MessageSender as PrismaMessageSender,
} from '@prisma/client';
import { randomBytes } from 'crypto';
import { OrdersRepository } from '../repositories/orders.repository';
import { DatabaseService } from '../../../common/database/services/database.service';
import {
    InsufficientStockException,
    InvalidFulfillmentStatusException,
    InvalidOrderStateException,
    InvalidPaymentStatusException,
    OrderNotFoundException,
    ProductVariantNotFoundException,
    UnauthorizedStoreAccessException,
} from '../../../common/exceptions/domain.exception';
import { APP_ENVIRONMENT } from '../../../app/enums/app.enum';
import {
    PaymentStatus,
    PaymentMethod,
    FulfillmentStatus,
    OrderEventType,
    MessageSender,
} from '../../../common/constants/status.constants';
import { PlaceGuestOrderDto } from '../dtos/place-guest-order.dto';

type Tx = Prisma.TransactionClient;

type ResolvedLine = {
    productVariantId: string;
    productName: string;
    sku: string;
    quantity: number;
    unitPrice: number;
    total: number;
};

const FULFILLMENT_TRANSITIONS: Record<string, string[]> = {
    [FulfillmentStatus.UNFULFILLED]: [
        FulfillmentStatus.PACKED,
        FulfillmentStatus.SHIPPED,
        FulfillmentStatus.FULFILLED,
        FulfillmentStatus.CANCELLED,
    ],
    [FulfillmentStatus.PACKED]: [
        FulfillmentStatus.SHIPPED,
        FulfillmentStatus.FULFILLED,
        FulfillmentStatus.CANCELLED,
    ],
    [FulfillmentStatus.SHIPPED]: [
        FulfillmentStatus.FULFILLED,
        FulfillmentStatus.CANCELLED,
    ],
    [FulfillmentStatus.FULFILLED]: [FulfillmentStatus.FULFILLED],
    [FulfillmentStatus.CANCELLED]: [FulfillmentStatus.CANCELLED],
};

const PAYMENT_TRANSITIONS: Record<string, string[]> = {
    [PaymentStatus.PENDING]: [
        PaymentStatus.SUCCESS,
        PaymentStatus.FAILED,
        PaymentStatus.REFUNDED,
    ],
    [PaymentStatus.SUCCESS]: [PaymentStatus.SUCCESS, PaymentStatus.REFUNDED],
    [PaymentStatus.FAILED]: [PaymentStatus.FAILED, PaymentStatus.PENDING],
    [PaymentStatus.REFUNDED]: [PaymentStatus.REFUNDED],
};

@Injectable()
export class OrdersService {
    constructor(
        private readonly ordersRepository: OrdersRepository,
        private readonly prisma: DatabaseService,
        private readonly config: ConfigService,
    ) {}

    async create(storeId: string, userId: string, dto: any) {
        const orderId = await this.prisma.$transaction(
            async (tx) => {
                const lines = await this.resolveAndReserveLines(
                    tx,
                    storeId,
                    dto.items,
                    { trustClientPrices: false },
                );

                const subtotal = lines.reduce((sum, l) => sum + l.total, 0);
                const deliveryFee = Number(dto.deliveryFee || 0);
                const discount = Number(dto.discount || 0);
                const tax = Number(dto.tax || 0);
                const total = Math.max(0, subtotal + deliveryFee + tax - discount);

                return this.persistOrder(tx, {
                    storeId,
                    userId,
                    customerName: dto.customerName,
                    customerPhone: dto.customerPhone,
                    customerEmail: dto.customerEmail || '',
                    shippingAddress: dto.shippingAddress,
                    billingAddress: dto.billingAddress || dto.shippingAddress,
                    subtotal,
                    deliveryFee,
                    discount,
                    tax,
                    total,
                    customerNote: dto.customerNote,
                    paymentMethod:
                        (dto.paymentMethod as string) || PaymentMethod.CASH_ON_DELIVERY,
                    deliveryMethod: dto.deliveryMethod || 'Standard Delivery',
                    lines,
                    initialMessage: 'New order placed.',
                });
            },
            {
                maxWait: 15_000,
                timeout: 30_000,
                isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
            },
        );

        return this.findById(orderId, storeId);
    }

    async getNotifications(storeId: string, limit = 10) {
        const notifications =
            await this.ordersRepository.findUnreadCustomerMessagesForStore(
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

        if (new Set(variantIds).size !== variantIds.length) {
            throw new BadRequestException(
                'Duplicate product variants in the same order are not allowed',
            );
        }

        const customerName = dto.customerName?.trim() || 'Customer';
        const customerPhone = dto.customerPhone.trim();

        const createdOrders = await this.prisma.$transaction(
            async (tx) => {
                const variants = await tx.productVariant.findMany({
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
                    const found = new Set(variants.map((v) => v.id));
                    const missing = variantIds.find((id) => !found.has(id));
                    throw new ProductVariantNotFoundException(missing);
                }

                const allowedStoreStatuses = this.guestCheckoutStoreStatuses();
                const grouped = new Map<
                    string,
                    {
                        storeName: string;
                        lines: ResolvedLine[];
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
                    const line: ResolvedLine = {
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
                            lines: [line],
                        });
                    }
                }

                const results: Array<{
                    id: string;
                    orderNumber: string;
                    storeId: string;
                    storeName: string;
                    total: number;
                }> = [];

                for (const [storeId, bucket] of grouped.entries()) {
                    await this.reserveLines(tx, storeId, bucket.lines);

                    const subtotal = bucket.lines.reduce(
                        (sum, line) => sum + line.total,
                        0,
                    );

                    const orderId = await this.persistOrder(tx, {
                        storeId,
                        userId: 'guest',
                        customerName,
                        customerPhone,
                        customerEmail: '',
                        shippingAddress: {
                            physicalAddress:
                                'Phone order — delivery details to confirm with customer',
                        },
                        billingAddress: {
                            physicalAddress:
                                'Phone order — delivery details to confirm with customer',
                        },
                        subtotal,
                        deliveryFee: 0,
                        discount: 0,
                        tax: 0,
                        total: subtotal,
                        customerNote: `Customer phone for vendor follow-up: ${customerPhone}`,
                        paymentMethod:
                            (dto as { paymentMethod?: string }).paymentMethod ||
                            PaymentMethod.MOBILE_MONEY,
                        deliveryMethod: 'Phone order',
                        lines: bucket.lines,
                        initialMessage: `New order placed. Contact customer at ${customerPhone}.`,
                    });

                    const order = await tx.order.findUniqueOrThrow({
                        where: { id: orderId },
                        select: { id: true, orderNumber: true },
                    });

                    results.push({
                        id: order.id,
                        orderNumber: order.orderNumber,
                        storeId,
                        storeName: bucket.storeName,
                        total: subtotal,
                    });
                }

                return results;
            },
            {
                maxWait: 15_000,
                timeout: 30_000,
                isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
            },
        );

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
        const {
            page = 1,
            limit = 10,
            paymentStatus,
            fulfillmentStatus,
            search,
            dateFrom,
            dateTo,
        } = filters;
        const safeLimit = Math.min(Math.max(1, Number(limit) || 10), 100);
        const safePage = Math.max(1, Number(page) || 1);
        const skip = (safePage - 1) * safeLimit;

        const where: Prisma.OrderWhereInput = {};

        if (paymentStatus) {
            where.payment = { status: paymentStatus };
        }

        if (fulfillmentStatus) {
            where.fulfillment = { status: fulfillmentStatus };
        }

        if (dateFrom || dateTo) {
            where.placedAt = {};
            if (dateFrom) {
                const from = new Date(dateFrom);
                if (!Number.isNaN(from.getTime())) {
                    from.setUTCHours(0, 0, 0, 0);
                    where.placedAt.gte = from;
                }
            }
            if (dateTo) {
                const to = new Date(dateTo);
                if (!Number.isNaN(to.getTime())) {
                    to.setUTCHours(23, 59, 59, 999);
                    where.placedAt.lte = to;
                }
            }
            if (Object.keys(where.placedAt).length === 0) {
                delete where.placedAt;
            }
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
                take: safeLimit,
                where,
                orderBy: { placedAt: 'desc' },
            }),
            this.ordersRepository.count(storeId, where),
        ]);

        return {
            data: orders,
            total,
            page: safePage,
            limit: safeLimit,
            totalPages: Math.ceil(total / safeLimit),
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
        return this.prisma.$transaction(async (tx) => {
            const order = await tx.order.findFirst({
                where: { id, storeId },
                include: { payment: true },
            });

            if (!order || !order.payment) {
                throw new OrderNotFoundException(id);
            }

            const current = order.payment.status as string;
            const next = dto.status as string;

            if (current === next) {
                return this.findById(id, storeId);
            }

            const allowed = PAYMENT_TRANSITIONS[current] ?? [];
            if (!allowed.includes(next)) {
                throw new InvalidPaymentStatusException(
                    `Cannot change payment from ${current} to ${next}`,
                );
            }

            await tx.orderPayment.update({
                where: { orderId: id },
                data: {
                    status: next as PrismaPaymentStatus,
                    reference: dto.reference,
                    paymentProofUrl: dto.paymentProofUrl,
                    rejectionReason: dto.rejectionReason,
                    reviewedBy: userId,
                    reviewedAt: new Date(),
                    paidAt:
                        next === PaymentStatus.SUCCESS
                            ? new Date()
                            : next === PaymentStatus.PENDING
                              ? null
                              : order.payment.paidAt,
                },
            });

            if (next === PaymentStatus.SUCCESS) {
                await tx.orderEvent.create({
                    data: {
                        type: OrderEventType.PAID as PrismaOrderEventType,
                        title: 'Payment Confirmed',
                        description: 'Payment has been verified',
                        performedBy: userId,
                        order: { connect: { id } },
                    },
                });
            }

            return this.findById(id, storeId);
        });
    }

    async updateFulfillment(
        id: string,
        storeId: string,
        userId: string,
        dto: any,
    ) {
        return this.prisma.$transaction(
            async (tx) => {
                const order = await tx.order.findFirst({
                    where: { id, storeId },
                    include: {
                        lineItems: true,
                        fulfillment: true,
                    },
                });

                if (!order || !order.fulfillment) {
                    throw new OrderNotFoundException(id);
                }

                const current = order.fulfillment.status as string;
                const next = dto.status as string;

                if (current === next) {
                    return this.findById(id, storeId);
                }

                const allowed = FULFILLMENT_TRANSITIONS[current] ?? [];
                if (!allowed.includes(next)) {
                    throw new InvalidFulfillmentStatusException(
                        `Cannot change fulfillment from ${current} to ${next}`,
                    );
                }

                if (
                    current === FulfillmentStatus.FULFILLED &&
                    next !== FulfillmentStatus.FULFILLED
                ) {
                    throw new InvalidOrderStateException(
                        current,
                        `transition to ${next}`,
                    );
                }

                await tx.orderFulfillment.update({
                    where: { orderId: id },
                    data: {
                        status: next as PrismaFulfillmentStatus,
                        trackingNumber: dto.trackingNumber,
                        courierName: dto.courierName,
                        driverName: dto.driverName,
                        packedBy:
                            next === FulfillmentStatus.PACKED
                                ? userId
                                : order.fulfillment.packedBy,
                        deliveredBy:
                            next === FulfillmentStatus.FULFILLED
                                ? dto.deliveredBy
                                : order.fulfillment.deliveredBy,
                        deliveredAt:
                            next === FulfillmentStatus.FULFILLED
                                ? new Date()
                                : order.fulfillment.deliveredAt,
                    },
                });

                const eventTypeMap: Record<string, string> = {
                    [FulfillmentStatus.PACKED]: OrderEventType.PACKED,
                    [FulfillmentStatus.SHIPPED]: OrderEventType.SHIPPED,
                    [FulfillmentStatus.FULFILLED]: OrderEventType.DELIVERED,
                    [FulfillmentStatus.CANCELLED]: OrderEventType.CANCELLED,
                };

                if (eventTypeMap[next]) {
                    await tx.orderEvent.create({
                        data: {
                            type: eventTypeMap[next] as PrismaOrderEventType,
                            title: `Order ${next}`,
                            description: `Order status updated to ${next}`,
                            performedBy: userId,
                            order: { connect: { id } },
                        },
                    });
                }

                if (
                    next === FulfillmentStatus.FULFILLED &&
                    current !== FulfillmentStatus.FULFILLED
                ) {
                    for (const item of order.lineItems) {
                        const updated = await tx.inventoryRecord.updateMany({
                            where: {
                                productVariantId: item.productVariantId,
                                reserved: { gte: item.quantity },
                                onHand: { gte: item.quantity },
                            },
                            data: {
                                onHand: { decrement: item.quantity },
                                reserved: { decrement: item.quantity },
                                lastSoldAt: new Date(),
                            },
                        });
                        if (updated.count === 0) {
                            throw new InsufficientStockException(0, item.quantity);
                        }
                    }
                }

                if (
                    next === FulfillmentStatus.CANCELLED &&
                    current !== FulfillmentStatus.CANCELLED &&
                    current !== FulfillmentStatus.FULFILLED
                ) {
                    for (const item of order.lineItems) {
                        const updated = await tx.inventoryRecord.updateMany({
                            where: {
                                productVariantId: item.productVariantId,
                                reserved: { gte: item.quantity },
                            },
                            data: {
                                reserved: { decrement: item.quantity },
                                available: { increment: item.quantity },
                            },
                        });
                        if (updated.count === 0) {
                            throw new InvalidOrderStateException(
                                current,
                                'release reserved stock on cancel',
                            );
                        }
                    }
                }

                return this.findById(id, storeId);
            },
            {
                maxWait: 15_000,
                timeout: 30_000,
                isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
            },
        );
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
        // Cap rows for sync HTTP export; full/async export should use a background job later.
        const orders = await this.ordersRepository.findMany(storeId, {
            orderBy: { placedAt: 'desc' },
            take: 5000,
        });

        const headers = [
            'Order #',
            'Customer',
            'Email',
            'Phone',
            'Total',
            'Payment Status',
            'Fulfillment Status',
            'Date',
        ];
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
            return s.includes(',') || s.includes('"') || s.includes('\n')
                ? `"${s.replace(/"/g, '""')}"`
                : s;
        };
        return [headers.join(','), ...rows.map((r) => r.map(esc).join(','))].join(
            '\n',
        );
    }

    private async resolveAndReserveLines(
        tx: Tx,
        storeId: string,
        items: Array<{
            productVariantId: string;
            quantity: number;
            productName?: string;
            sku?: string;
            unitPrice?: number;
            total?: number;
        }>,
        options: { trustClientPrices: boolean },
    ): Promise<ResolvedLine[]> {
        if (!items?.length) {
            throw new BadRequestException('Order must include at least one item');
        }

        const variantIds = items.map((i) => i.productVariantId);
        if (new Set(variantIds).size !== variantIds.length) {
            throw new BadRequestException(
                'Duplicate product variants in the same order are not allowed',
            );
        }

        const variants = await tx.productVariant.findMany({
            where: { id: { in: variantIds } },
            include: {
                product: { select: { id: true, name: true, storeId: true, status: true } },
                inventory: true,
            },
        });

        if (variants.length !== variantIds.length) {
            const found = new Set(variants.map((v) => v.id));
            const missing = variantIds.find((id) => !found.has(id));
            throw new ProductVariantNotFoundException(missing);
        }

        const lines: ResolvedLine[] = [];

        for (const item of items) {
            const variant = variants.find((v) => v.id === item.productVariantId)!;
            if (variant.product.storeId !== storeId) {
                throw new UnauthorizedStoreAccessException();
            }
            if (variant.product.status !== ProductStatus.ACTIVE) {
                throw new ProductVariantNotFoundException(variant.id);
            }

            const quantity = Number(item.quantity);
            if (!Number.isFinite(quantity) || quantity < 1) {
                throw new BadRequestException('Invalid line quantity');
            }

            const unitPrice = options.trustClientPrices
                ? Number(item.unitPrice)
                : Number(variant.price);

            lines.push({
                productVariantId: variant.id,
                productName:
                    options.trustClientPrices && item.productName
                        ? item.productName
                        : `${variant.product.name} — ${variant.title}`,
                sku:
                    options.trustClientPrices && item.sku
                        ? item.sku
                        : variant.sku,
                quantity,
                unitPrice,
                total: unitPrice * quantity,
            });
        }

        await this.reserveLines(tx, storeId, lines);
        return lines;
    }

    private async reserveLines(
        tx: Tx,
        storeId: string,
        lines: ResolvedLine[],
    ): Promise<void> {
        for (const line of lines) {
            const ownership = await tx.productVariant.findFirst({
                where: {
                    id: line.productVariantId,
                    product: { storeId },
                },
                select: { id: true },
            });
            if (!ownership) {
                throw new UnauthorizedStoreAccessException();
            }

            const updated = await tx.inventoryRecord.updateMany({
                where: {
                    productVariantId: line.productVariantId,
                    available: { gte: line.quantity },
                },
                data: {
                    available: { decrement: line.quantity },
                    reserved: { increment: line.quantity },
                },
            });

            if (updated.count === 0) {
                const inv = await tx.inventoryRecord.findUnique({
                    where: { productVariantId: line.productVariantId },
                });
                throw new InsufficientStockException(
                    inv?.available ?? 0,
                    line.quantity,
                );
            }
        }
    }

    private async persistOrder(
        tx: Tx,
        input: {
            storeId: string;
            userId: string;
            customerName: string;
            customerPhone: string;
            customerEmail: string;
            shippingAddress: unknown;
            billingAddress: unknown;
            subtotal: number;
            deliveryFee: number;
            discount: number;
            tax: number;
            total: number;
            customerNote?: string;
            paymentMethod: string;
            deliveryMethod: string;
            lines: ResolvedLine[];
            initialMessage: string;
            promoCode?: string | null;
            promoDiscount?: number;
        },
    ): Promise<string> {
        const orderNumber = await this.generateOrderNumber(tx, input.storeId);

        const order = await tx.order.create({
            data: {
                orderNumber,
                customerName: input.customerName,
                customerPhone: input.customerPhone,
                customerEmail: input.customerEmail,
                shippingAddress: JSON.stringify(input.shippingAddress),
                billingAddress: JSON.stringify(input.billingAddress),
                subtotal: input.subtotal,
                deliveryFee: input.deliveryFee,
                discount: input.discount,
                tax: input.tax,
                total: input.total,
                promoCode: input.promoCode ?? null,
                promoDiscount: input.promoDiscount ?? 0,
                customerNote: input.customerNote,
                createdBy: input.userId,
                store: { connect: { id: input.storeId } },
            },
        });

        for (const line of input.lines) {
            await tx.orderLineItem.create({
                data: {
                    productName: line.productName,
                    sku: line.sku,
                    quantity: line.quantity,
                    unitPrice: line.unitPrice,
                    total: line.total,
                    order: { connect: { id: order.id } },
                    productVariant: { connect: { id: line.productVariantId } },
                },
            });
        }

        await tx.orderPayment.create({
            data: {
                status: PaymentStatus.PENDING as PrismaPaymentStatus,
                method: input.paymentMethod as PrismaPaymentMethod,
                amount: input.total,
                order: { connect: { id: order.id } },
            },
        });

        await tx.orderFulfillment.create({
            data: {
                status: FulfillmentStatus.UNFULFILLED as PrismaFulfillmentStatus,
                deliveryMethod: input.deliveryMethod,
                order: { connect: { id: order.id } },
            },
        });

        await tx.orderEvent.create({
            data: {
                type: OrderEventType.CREATED as PrismaOrderEventType,
                title: 'Order Created',
                description: 'Order was successfully created',
                performedBy: input.userId,
                order: { connect: { id: order.id } },
            },
        });

        await tx.orderMessage.create({
            data: {
                sender: MessageSender.CUSTOMER as PrismaMessageSender,
                senderName: input.customerName || 'Customer',
                message: input.initialMessage,
                order: { connect: { id: order.id } },
            },
        });

        if (input.paymentMethod !== PaymentMethod.CASH_ON_DELIVERY) {
            const store = await tx.store.findUnique({
                where: { id: input.storeId },
                select: {
                    displayName: true,
                    contactPhone: true,
                    contactEmail: true,
                },
            });
            const payHint =
                input.paymentMethod === PaymentMethod.MOBILE_MONEY
                    ? 'Mobile Money'
                    : input.paymentMethod === PaymentMethod.BANK_TRANSFER
                      ? 'Bank Transfer'
                      : input.paymentMethod;
            const contact =
                store?.contactPhone ||
                store?.contactEmail ||
                'the seller';
            await tx.orderMessage.create({
                data: {
                    sender: MessageSender.ADMIN as PrismaMessageSender,
                    senderName: store?.displayName || 'Store',
                    message: `Payment instructions: Please pay ${input.total} RWF via ${payHint} and upload your payment proof on the order page. Contact ${contact} if you need account details.`,
                    order: { connect: { id: order.id } },
                },
            });
        }

        return order.id;
    }


    async getPublicOrderByPhone(orderId: string, customerPhone: string) {
        if (!customerPhone?.trim()) {
            throw new OrderNotFoundException(orderId);
        }
        const order = await this.prisma.order.findFirst({
            where: {
                id: orderId,
                customerPhone: customerPhone.trim(),
            },
            include: {
                payment: true,
                fulfillment: true,
                lineItems: true,
                messages: { orderBy: { createdAt: 'asc' } },
                store: {
                    select: {
                        id: true,
                        displayName: true,
                        slug: true,
                        contactPhone: true,
                        contactEmail: true,
                        logoUrl: true,
                    },
                },
            },
        });
        if (!order) {
            throw new OrderNotFoundException(orderId);
        }
        return order;
    }

    async uploadPaymentProof(
        orderId: string,
        customerPhone: string,
        dto: { paymentProofUrl: string; reference?: string },
    ) {
        const phone = customerPhone?.trim();
        if (!phone) {
            throw new BadRequestException(
                'Phone is required to upload payment proof',
            );
        }

        const order = await this.prisma.order.findFirst({
            where: {
                id: orderId,
                customerPhone: phone,
            },
            include: { payment: true, store: { select: { displayName: true } } },
        });

        if (!order || !order.payment) {
            throw new OrderNotFoundException(orderId);
        }

        if (order.payment.status === PaymentStatus.SUCCESS) {
            throw new InvalidPaymentStatusException(
                'Payment already confirmed',
            );
        }

        if (order.payment.method === PaymentMethod.CASH_ON_DELIVERY) {
            throw new BadRequestException(
                'Payment proof is not required for cash on delivery',
            );
        }

        await this.prisma.orderPayment.update({
            where: { orderId },
            data: {
                paymentProofUrl: dto.paymentProofUrl,
                reference: dto.reference ?? order.payment.reference,
                status: PaymentStatus.PENDING as PrismaPaymentStatus,
                rejectionReason: null,
                reviewedAt: null,
                reviewedBy: null,
            },
        });

        await this.prisma.orderMessage.create({
            data: {
                orderId,
                sender: MessageSender.CUSTOMER as PrismaMessageSender,
                senderName: order.customerName || 'Customer',
                message: 'Payment proof uploaded. Awaiting merchant review.',
            },
        });

        return this.prisma.order.findUnique({
            where: { id: orderId },
            include: { payment: true },
        });
    }

    async reviewPaymentProof(
        orderId: string,
        storeId: string,
        userId: string,
        dto: {
            action: 'APPROVE' | 'REJECT';
            rejectionReason?: string;
            reference?: string;
        },
    ) {
        return this.prisma.$transaction(async (tx) => {
            const order = await tx.order.findFirst({
                where: { id: orderId, storeId },
                include: { payment: true },
            });

            if (!order || !order.payment) {
                throw new OrderNotFoundException(orderId);
            }

            if (!order.payment.paymentProofUrl && dto.action === 'APPROVE') {
                throw new BadRequestException(
                    'Cannot approve payment without a payment proof',
                );
            }

            if (dto.action === 'APPROVE') {
                const current = order.payment.status as string;
                const allowed = PAYMENT_TRANSITIONS[current] ?? [];
                if (
                    current !== PaymentStatus.SUCCESS &&
                    !allowed.includes(PaymentStatus.SUCCESS)
                ) {
                    throw new InvalidPaymentStatusException(
                        `Cannot approve payment in status ${current}`,
                    );
                }

                await tx.orderPayment.update({
                    where: { orderId },
                    data: {
                        status: PaymentStatus.SUCCESS as PrismaPaymentStatus,
                        paidAt: new Date(),
                        reviewedBy: userId,
                        reviewedAt: new Date(),
                        rejectionReason: null,
                        reference: dto.reference ?? order.payment.reference,
                    },
                });

                if (current !== PaymentStatus.SUCCESS) {
                    await tx.orderEvent.create({
                        data: {
                            type: OrderEventType.PAID as PrismaOrderEventType,
                            title: 'Payment Confirmed',
                            description: 'Payment proof approved by merchant',
                            performedBy: userId,
                            order: { connect: { id: orderId } },
                        },
                    });
                }

                await tx.orderMessage.create({
                    data: {
                        orderId,
                        sender: MessageSender.ADMIN as PrismaMessageSender,
                        senderName: 'Store',
                        message: 'Your payment proof was approved. Thank you!',
                    },
                });
            } else {
                if (!dto.rejectionReason?.trim()) {
                    throw new BadRequestException(
                        'Rejection reason is required',
                    );
                }

                await tx.orderPayment.update({
                    where: { orderId },
                    data: {
                        status: PaymentStatus.PENDING as PrismaPaymentStatus,
                        rejectionReason: dto.rejectionReason.trim(),
                        reviewedBy: userId,
                        reviewedAt: new Date(),
                        paidAt: null,
                    },
                });

                await tx.orderMessage.create({
                    data: {
                        orderId,
                        sender: MessageSender.ADMIN as PrismaMessageSender,
                        senderName: 'Store',
                        message: `Payment proof rejected: ${dto.rejectionReason.trim()}. Please upload a new proof.`,
                    },
                });
            }

            return this.findById(orderId, storeId);
        });
    }

    private async generateOrderNumber(tx: Tx, storeId: string): Promise<string> {
        for (let attempt = 0; attempt < 20; attempt++) {
            const orderNumber = `#${Date.now().toString(36).toUpperCase()}-${randomBytes(3).toString('hex').toUpperCase()}`;
            const existing = await tx.order.findUnique({
                where: { orderNumber },
                select: { id: true },
            });
            if (!existing) {
                return orderNumber;
            }
        }

        return `#${storeId.slice(0, 8)}-${randomBytes(6).toString('hex').toUpperCase()}`;
    }
}
