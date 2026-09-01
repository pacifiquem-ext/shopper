import { PrismaClient, type Prisma } from '@prisma/client'
import * as bcrypt from 'bcryptjs'
import {
    DRAFT_ONLY_OWNERS,
    EXTRA_APPROVED_STORES,
    EXTRA_CUSTOMERS,
    EXTRA_DELIVERY_ZONES,
    EXTRA_PIPELINE_STORES,
    EXTRA_PRODUCTS,
    EXTRA_PROMO_CODES,
    paymentProofUrl,
    productImages,
    storeLogoUrl,
    variantImage,
    type CatalogProduct,
    type CatalogStore,
} from './seed-catalog'

export const DEMO_PASSWORD = 'Shopper123!'

type CategoryIds = Record<string, string>

function daysAgo(days: number): Date {
    const d = new Date()
    d.setDate(d.getDate() - days)
    d.setHours(10, 15, 0, 0)
    return d
}

function stockStatus(onHand: number): 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' {
    if (onHand <= 0) return 'OUT_OF_STOCK'
    if (onHand < 10) return 'LOW_STOCK'
    return 'IN_STOCK'
}

async function upsertUser(
    prisma: PrismaClient,
    passwordHash: string,
    input: {
        phoneNumber: string
        fullName: string
        email: string
        role: 'PLATFORM_ADMIN' | 'STORE_OWNER' | 'CUSTOMER'
        status: 'ACTIVE' | 'PENDING_VERIFICATION' | 'SUSPENDED'
        createdAt: Date
    },
) {
    return prisma.user.upsert({
        where: { phoneNumber: input.phoneNumber },
        update: {
            fullName: input.fullName,
            email: input.email,
            role: input.role,
            status: input.status,
            passwordHash,
        },
        create: {
            fullName: input.fullName,
            phoneNumber: input.phoneNumber,
            email: input.email,
            role: input.role,
            status: input.status,
            passwordHash,
            createdAt: input.createdAt,
        },
    })
}

async function upsertStore(
    prisma: PrismaClient,
    input: {
        userId: string
        slug: string
        status: Prisma.StoreCreateInput['status']
        registeredName: string
        displayName: string
        description: string
        contactEmail: string
        contactPhone: string
        contactAddress: string
        ratingAvg: number
        ratingCount: number
        approvedAt?: Date | null
        rejectionReason?: string | null
        createdAt: Date
        logoUrl: string
        aboutUs?: string
        brandColors: { primary: string; secondary: string; template?: string }
    },
) {
    const existing = await prisma.store.findUnique({ where: { slug: input.slug } })
    const data = {
        userId: input.userId,
        slug: input.slug,
        status: input.status,
        registeredName: input.registeredName,
        displayName: input.displayName,
        description: input.description,
        currency: 'RWF',
        logoUrl: input.logoUrl,
        contactEmail: input.contactEmail,
        contactPhone: input.contactPhone,
        contactAddress: input.contactAddress,
        aboutUs: input.aboutUs ?? input.description,
        ratingAvg: input.ratingAvg,
        ratingCount: input.ratingCount,
        approvedAt: input.approvedAt ?? null,
        rejectionReason: input.rejectionReason ?? null,
        brandColors: input.brandColors,
        returnPolicy:
            'Unused items can be returned within 7 days with the original receipt and packaging. Perishable groceries are only exchanged if they arrived damaged.',
        privacyPolicy:
            'We use your name, phone, and delivery address only to fulfill orders, handle payment proofs, and answer support messages.',
        termsAndConditions:
            'Placing an order accepts the listed price, delivery fee, and the store’s fulfillment window. Cancelled paid orders are refunded to the original method.',
    }
    if (existing) {
        return prisma.store.update({ where: { id: existing.id }, data })
    }
    return prisma.store.create({
        data: { ...data, createdAt: input.createdAt },
    })
}

async function ensureKyc(
    prisma: PrismaClient,
    storeId: string,
    industryCode: string,
    categoryCode: string,
    owner: { fullName: string; email: string; phone: string },
    extras?: {
        country?: string
        ownerNationality?: string
        address?: {
            province: string
            district: string
            sector: string
            physicalAddress: string
            googleMapsUrl: string
        }
    },
) {
    const industry = await prisma.industrySector.findUnique({ where: { code: industryCode } })
    const category = await prisma.businessCategory.findUnique({ where: { code: categoryCode } })
    if (!industry || !category) return

    const existing = await prisma.storeKyc.findUnique({ where: { storeId } })
    const payload = {
        industrySectorId: industry.id,
        businessCategoryId: category.id,
        country: extras?.country ?? 'GH',
        ownerFullName: owner.fullName,
        ownerNationality: extras?.ownerNationality ?? 'Ghanaian',
        ownerEmail: owner.email,
        ownerPhoneNumber: owner.phone,
    }
    const kyc = existing
        ? await prisma.storeKyc.update({ where: { storeId }, data: payload })
        : await prisma.storeKyc.create({ data: { storeId, ...payload } })

    const addressPayload = extras?.address ?? {
        province: 'Greater Accra',
        district: 'Accra Metro',
        sector: 'Osu',
        physicalAddress: '12 Market Street',
        googleMapsUrl: 'https://maps.google.com/?q=Osu+Market+Accra',
    }
    const address = await prisma.address.findFirst({ where: { businessKycId: kyc.id } })
    if (!address) {
        await prisma.address.create({
            data: {
                ...addressPayload,
                businessKycId: kyc.id,
            },
        })
    } else {
        await prisma.address.update({
            where: { id: address.id },
            data: addressPayload,
        })
    }
}

async function ensureZones(prisma: PrismaClient, storeId: string) {
    const created = []
    for (const zone of EXTRA_DELIVERY_ZONES) {
        const existing = await prisma.deliveryZone.findFirst({
            where: { storeId, name: zone.name },
        })
        created.push(
            existing ??
                (await prisma.deliveryZone.create({
                    data: { storeId, ...zone },
                })),
        )
    }
    return created
}

async function ensureProduct(
    prisma: PrismaClient,
    input: {
        storeId: string
        ownerId: string
        name: string
        description: string
        vendor: string
        category: string
        categoryId?: string
        status: 'ACTIVE' | 'DRAFT' | 'ARCHIVED'
        tags: string[]
        images: string[]
        attributes: Prisma.InputJsonValue
        deliveryPrice: number
        deliveryLocation?: string
        createdAt: Date
        variants: Array<{
            sku: string
            title: string
            colorName?: string | null
            colorHex?: string | null
            size?: string | null
            model?: string | null
            price: number
            cost: number
            stock: number
            reserved?: number
            attributes?: Prisma.InputJsonValue
            images?: string[]
        }>
    },
) {
    let product = await prisma.product.findFirst({
        where: { storeId: input.storeId, name: input.name },
    })
    const productData = {
        description: input.description,
        vendor: input.vendor,
        category: input.category,
        categoryId: input.categoryId,
        status: input.status,
        tags: input.tags,
        images: input.images,
        primaryImage: input.images[0] ?? null,
        attributes: input.attributes,
        deliveryEnabled: true,
        deliveryLocation: input.deliveryLocation ?? 'City center',
        deliveryPrice: input.deliveryPrice,
        updatedBy: input.ownerId,
    }
    if (product) {
        product = await prisma.product.update({
            where: { id: product.id },
            data: productData,
        })
    } else {
        product = await prisma.product.create({
            data: {
                storeId: input.storeId,
                name: input.name,
                createdBy: input.ownerId,
                createdAt: input.createdAt,
                ...productData,
            },
        })
    }

    const variants = []
    for (const [index, variant] of input.variants.entries()) {
        const reserved = variant.reserved ?? 0
        const available = Math.max(0, variant.stock - reserved)
        const variantImages = variant.images?.length
            ? variant.images
            : [input.images[index % Math.max(input.images.length, 1)] ?? variantImage(variant.sku)]
        const row = await prisma.productVariant.upsert({
            where: { sku: variant.sku },
            update: {
                title: variant.title,
                colorName: variant.colorName ?? null,
                colorHex: variant.colorHex ?? null,
                size: variant.size ?? null,
                model: variant.model ?? variant.title,
                price: variant.price,
                compareAt: Math.round(variant.price * 1.15),
                cost: variant.cost,
                attributes: variant.attributes ?? {},
                images: variantImages,
                productId: product.id,
            },
            create: {
                productId: product.id,
                sku: variant.sku,
                title: variant.title,
                colorName: variant.colorName ?? null,
                colorHex: variant.colorHex ?? null,
                size: variant.size ?? null,
                model: variant.model ?? variant.title,
                price: variant.price,
                compareAt: Math.round(variant.price * 1.15),
                cost: variant.cost,
                attributes: variant.attributes ?? {},
                images: variantImages,
            },
        })

        const inventory = await prisma.inventoryRecord.findUnique({
            where: { productVariantId: row.id },
        })
        const lastRestockedAt = variant.stock > 0 ? daysAgo(6) : daysAgo(20)
        const lastSoldAt = variant.stock < 40 ? daysAgo(2) : null
        if (inventory) {
            await prisma.inventoryRecord.update({
                where: { id: inventory.id },
                data: {
                    onHand: variant.stock,
                    reserved,
                    available,
                    reorderPoint: 10,
                    status: stockStatus(available),
                    lastRestockedAt,
                    lastSoldAt,
                    updatedBy: input.ownerId,
                },
            })
        } else {
            const created = await prisma.inventoryRecord.create({
                data: {
                    productVariantId: row.id,
                    onHand: variant.stock,
                    reserved,
                    available,
                    reorderPoint: 10,
                    status: stockStatus(available),
                    lastRestockedAt,
                    lastSoldAt,
                    updatedBy: input.ownerId,
                },
            })
            await prisma.inventoryEvent.create({
                data: {
                    inventoryRecordId: created.id,
                    type: 'CREATED',
                    quantity: variant.stock,
                    reason: 'Opening stock',
                    performedBy: input.ownerId,
                    createdAt: input.createdAt,
                },
            })
            if (variant.stock > 20) {
                await prisma.inventoryEvent.create({
                    data: {
                        inventoryRecordId: created.id,
                        type: 'RESTOCKED',
                        quantity: 12,
                        reason: 'Weekly restock',
                        performedBy: input.ownerId,
                        createdAt: daysAgo(6),
                    },
                })
            }
        }
        variants.push(row)
    }

    return { product, variants }
}

async function ensureOrder(
    prisma: PrismaClient,
    input: {
        storeId: string
        createdBy: string
        orderNumber: string
        customerName: string
        customerPhone: string
        customerEmail: string
        placedAt: Date
        items: Array<{ variantId: string; productName: string; sku: string; quantity: number; unitPrice: number }>
        deliveryFee: number
        payment: 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED'
        method: 'MOBILE_MONEY' | 'CASH_ON_DELIVERY' | 'BANK_TRANSFER' | 'CARD'
        fulfillment: 'UNFULFILLED' | 'PACKED' | 'SHIPPED' | 'FULFILLED' | 'CANCELLED'
        zoneId?: string
        note?: string
        internalNote?: string
        promoCode?: string
        promoDiscount?: number
        shippingAddress?: string
        billingAddress?: string
        reviewedBy?: string
    },
) {
    const existing = await prisma.order.findUnique({ where: { orderNumber: input.orderNumber } })
    const subtotal = input.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
    const promoDiscount = input.promoDiscount ?? 0
    const total = Math.max(0, subtotal + input.deliveryFee - promoDiscount)
    const shippingAddress =
        input.shippingAddress ?? '12 Independence Avenue, City center, Accra'
    const billingAddress = input.billingAddress ?? shippingAddress
    const proofUrl =
        input.method === 'CASH_ON_DELIVERY' ? null : paymentProofUrl(input.orderNumber)

    if (existing) {
        await prisma.order.update({
            where: { id: existing.id },
            data: {
                customerName: input.customerName,
                customerPhone: input.customerPhone,
                customerEmail: input.customerEmail,
                shippingAddress,
                billingAddress,
                subtotal,
                deliveryFee: input.deliveryFee,
                discount: promoDiscount,
                tax: 0,
                total,
                promoCode: input.promoCode ?? null,
                promoDiscount,
                customerNote: input.note ?? null,
                internalNote: input.internalNote ?? 'Seeded order — confirm stock before packing.',
            },
        })
        await prisma.orderPayment.update({
            where: { orderId: existing.id },
            data: {
                status: input.payment,
                method: input.method,
                amount: total,
                reference: input.payment === 'PENDING' ? null : `PAY-${input.orderNumber}`,
                paymentProofUrl: proofUrl,
                rejectionReason:
                    input.payment === 'FAILED'
                        ? 'Payment reference did not match the uploaded proof.'
                        : null,
                reviewedBy:
                    input.payment === 'PENDING' ? null : (input.reviewedBy ?? input.createdBy),
                reviewedAt: input.payment === 'PENDING' ? null : input.placedAt,
                paidAt: ['SUCCESS', 'REFUNDED'].includes(input.payment) ? input.placedAt : null,
            },
        })
        await prisma.orderFulfillment.update({
            where: { orderId: existing.id },
            data: {
                status: input.fulfillment,
                deliveryMethod: 'Standard delivery',
                deliveryZoneId: input.zoneId ?? null,
                courierName: ['SHIPPED', 'FULFILLED'].includes(input.fulfillment)
                    ? 'CityLink Couriers'
                    : null,
                driverName: input.fulfillment === 'FULFILLED' ? 'Local rider' : null,
                trackingNumber: ['SHIPPED', 'FULFILLED'].includes(input.fulfillment)
                    ? `TRK-${input.orderNumber}`
                    : null,
                packedBy: ['PACKED', 'SHIPPED', 'FULFILLED'].includes(input.fulfillment)
                    ? input.createdBy
                    : null,
                deliveredBy: input.fulfillment === 'FULFILLED' ? 'Local rider' : null,
                assignedAt: input.fulfillment === 'UNFULFILLED' ? null : input.placedAt,
                deliveredAt:
                    input.fulfillment === 'FULFILLED'
                        ? new Date(input.placedAt.getTime() + 36 * 3600_000)
                        : null,
            },
        })
        return existing
    }

    const order = await prisma.order.create({
        data: {
            storeId: input.storeId,
            orderNumber: input.orderNumber,
            customerName: input.customerName,
            customerPhone: input.customerPhone,
            customerEmail: input.customerEmail,
            shippingAddress,
            billingAddress,
            subtotal,
            deliveryFee: input.deliveryFee,
            discount: promoDiscount,
            tax: 0,
            total,
            promoCode: input.promoCode ?? null,
            promoDiscount,
            customerNote: input.note ?? null,
            internalNote: input.internalNote ?? 'Seeded order — confirm stock before packing.',
            createdBy: input.createdBy,
            placedAt: input.placedAt,
        },
    })

    for (const item of input.items) {
        await prisma.orderLineItem.create({
            data: {
                orderId: order.id,
                productVariantId: item.variantId,
                productName: item.productName,
                sku: item.sku,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                total: item.unitPrice * item.quantity,
            },
        })
    }

    await prisma.orderPayment.create({
        data: {
            orderId: order.id,
            status: input.payment,
            method: input.method,
            amount: total,
            reference: input.payment === 'PENDING' ? null : `PAY-${input.orderNumber}`,
            paymentProofUrl: proofUrl,
            rejectionReason:
                input.payment === 'FAILED'
                    ? 'Payment reference did not match the uploaded proof.'
                    : null,
            reviewedBy: input.payment === 'PENDING' ? null : (input.reviewedBy ?? input.createdBy),
            reviewedAt: input.payment === 'PENDING' ? null : input.placedAt,
            paidAt: ['SUCCESS', 'REFUNDED'].includes(input.payment) ? input.placedAt : null,
        },
    })

    await prisma.orderFulfillment.create({
        data: {
            orderId: order.id,
            status: input.fulfillment,
            deliveryMethod: 'Standard delivery',
            deliveryZoneId: input.zoneId ?? null,
            courierName: ['SHIPPED', 'FULFILLED'].includes(input.fulfillment)
                ? 'CityLink Couriers'
                : null,
            driverName: input.fulfillment === 'FULFILLED' ? 'Local rider' : null,
            trackingNumber: ['SHIPPED', 'FULFILLED'].includes(input.fulfillment)
                ? `TRK-${input.orderNumber}`
                : null,
            packedBy: ['PACKED', 'SHIPPED', 'FULFILLED'].includes(input.fulfillment)
                ? input.createdBy
                : null,
            deliveredBy: input.fulfillment === 'FULFILLED' ? 'Local rider' : null,
            assignedAt: input.fulfillment === 'UNFULFILLED' ? null : input.placedAt,
            deliveredAt:
                input.fulfillment === 'FULFILLED'
                    ? new Date(input.placedAt.getTime() + 36 * 3600_000)
                    : null,
        },
    })

    await prisma.orderEvent.create({
        data: {
            orderId: order.id,
            type: 'CREATED',
            title: 'Order placed',
            description: 'Customer placed an order from the marketplace.',
            performedBy: input.createdBy,
            createdAt: input.placedAt,
        },
    })
    if (input.payment === 'SUCCESS') {
        await prisma.orderEvent.create({
            data: {
                orderId: order.id,
                type: 'PAID',
                title: 'Payment confirmed',
                description: 'Payment proof accepted.',
                performedBy: input.createdBy,
                createdAt: new Date(input.placedAt.getTime() + 2 * 3600_000),
            },
        })
    }
    if (['PACKED', 'SHIPPED', 'FULFILLED'].includes(input.fulfillment)) {
        await prisma.orderEvent.create({
            data: {
                orderId: order.id,
                type: 'PACKED',
                title: 'Order packed',
                description: 'Items were packed and labeled.',
                performedBy: input.createdBy,
                createdAt: new Date(input.placedAt.getTime() + 6 * 3600_000),
            },
        })
    }
    if (['SHIPPED', 'FULFILLED'].includes(input.fulfillment)) {
        await prisma.orderEvent.create({
            data: {
                orderId: order.id,
                type: 'SHIPPED',
                title: 'Order shipped',
                description: 'Handed to CityLink Couriers.',
                performedBy: input.createdBy,
                createdAt: new Date(input.placedAt.getTime() + 12 * 3600_000),
            },
        })
    }
    if (input.fulfillment === 'FULFILLED') {
        await prisma.orderEvent.create({
            data: {
                orderId: order.id,
                type: 'DELIVERED',
                title: 'Order delivered',
                description: 'Customer received the order.',
                performedBy: input.createdBy,
                createdAt: new Date(input.placedAt.getTime() + 36 * 3600_000),
            },
        })
    }
    if (input.fulfillment === 'CANCELLED') {
        await prisma.orderEvent.create({
            data: {
                orderId: order.id,
                type: 'CANCELLED',
                title: 'Order cancelled',
                description: 'Order cancelled after a stock issue.',
                performedBy: input.createdBy,
                createdAt: new Date(input.placedAt.getTime() + 8 * 3600_000),
            },
        })
    }
    if (input.payment === 'REFUNDED') {
        await prisma.orderEvent.create({
            data: {
                orderId: order.id,
                type: 'REFUNDED',
                title: 'Payment refunded',
                description: 'Paid amount was returned to the original method.',
                performedBy: input.reviewedBy ?? input.createdBy,
                createdAt: new Date(input.placedAt.getTime() + 10 * 3600_000),
            },
        })
    }

    await prisma.orderMessage.create({
        data: {
            orderId: order.id,
            sender: 'ADMIN',
            senderName: 'Store desk',
            message: 'Thanks for your order. We will confirm payment shortly.',
            isRead: true,
            createdAt: input.placedAt,
        },
    })
    await prisma.orderMessage.create({
        data: {
            orderId: order.id,
            sender: 'CUSTOMER',
            senderName: input.customerName,
            message:
                input.note ??
                'Please call on arrival. I can meet the rider at the gate.',
            isRead: input.fulfillment === 'FULFILLED',
            createdAt: new Date(input.placedAt.getTime() + 30 * 60_000),
        },
    })

    return order
}

export async function seedDemoMarketplace(
    prisma: PrismaClient,
    categoryIds: CategoryIds,
): Promise<void> {
    console.log('Seeding demo marketplace...')
    const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10)

    const admin = await upsertUser(prisma, passwordHash, {
        phoneNumber: '+233200000001',
        fullName: 'Amina Boateng',
        email: 'admin@onlineshop.rw',
        role: 'PLATFORM_ADMIN',
        status: 'ACTIVE',
        createdAt: daysAgo(120),
    })

    const harvestOwner = await upsertUser(prisma, passwordHash, {
        phoneNumber: '+233200000010',
        fullName: 'Kwame Mensah',
        email: 'kwame@onlineshop.rw',
        role: 'STORE_OWNER',
        status: 'ACTIVE',
        createdAt: daysAgo(90),
    })
    const northlineOwner = await upsertUser(prisma, passwordHash, {
        phoneNumber: '+233200000011',
        fullName: 'Fatou Ndiaye',
        email: 'fatou@onlineshop.rw',
        role: 'STORE_OWNER',
        status: 'ACTIVE',
        createdAt: daysAgo(80),
    })
    const atelierOwner = await upsertUser(prisma, passwordHash, {
        phoneNumber: '+233200000012',
        fullName: 'Imani Okello',
        email: 'imani@onlineshop.rw',
        role: 'STORE_OWNER',
        status: 'ACTIVE',
        createdAt: daysAgo(70),
    })
    const pendingOwner = await upsertUser(prisma, passwordHash, {
        phoneNumber: '+233200000013',
        fullName: 'Samuel Adeyemi',
        email: 'samuel@onlineshop.rw',
        role: 'STORE_OWNER',
        status: 'ACTIVE',
        createdAt: daysAgo(12),
    })
    const reviewOwner = await upsertUser(prisma, passwordHash, {
        phoneNumber: '+233200000014',
        fullName: 'Chidinma Eze',
        email: 'chidinma@onlineshop.rw',
        role: 'STORE_OWNER',
        status: 'ACTIVE',
        createdAt: daysAgo(9),
    })
    const rejectedOwner = await upsertUser(prisma, passwordHash, {
        phoneNumber: '+233200000015',
        fullName: 'Joseph Kamau',
        email: 'joseph@onlineshop.rw',
        role: 'STORE_OWNER',
        status: 'ACTIVE',
        createdAt: daysAgo(20),
    })
    const suspendedOwner = await upsertUser(prisma, passwordHash, {
        phoneNumber: '+233200000016',
        fullName: 'Aisha Bello',
        email: 'aisha@onlineshop.rw',
        role: 'STORE_OWNER',
        status: 'SUSPENDED',
        createdAt: daysAgo(40),
    })

    const customerAma = await upsertUser(prisma, passwordHash, {
        phoneNumber: '+233200000101',
        fullName: 'Ama Diallo',
        email: 'ama.diallo@onlineshop.rw',
        role: 'CUSTOMER',
        status: 'ACTIVE',
        createdAt: daysAgo(60),
    })
    const customerYusuf = await upsertUser(prisma, passwordHash, {
        phoneNumber: '+233200000102',
        fullName: 'Yusuf Ibrahim',
        email: 'yusuf.ibrahim@onlineshop.rw',
        role: 'CUSTOMER',
        status: 'ACTIVE',
        createdAt: daysAgo(45),
    })
    const customerLina = await upsertUser(prisma, passwordHash, {
        phoneNumber: '+233200000103',
        fullName: 'Lina Mwangi',
        email: 'lina.mwangi@onlineshop.rw',
        role: 'CUSTOMER',
        status: 'ACTIVE',
        createdAt: daysAgo(30),
    })
    await upsertUser(prisma, passwordHash, {
        phoneNumber: '+233200000104',
        fullName: 'Peter Okonkwo',
        email: 'peter.okonkwo@onlineshop.rw',
        role: 'CUSTOMER',
        status: 'PENDING_VERIFICATION',
        createdAt: daysAgo(2),
    })
    await upsertUser(prisma, passwordHash, {
        phoneNumber: '+233200000105',
        fullName: 'Mariam Sow',
        email: 'mariam.sow@onlineshop.rw',
        role: 'CUSTOMER',
        status: 'SUSPENDED',
        createdAt: daysAgo(25),
    })

    const harvest = await upsertStore(prisma, {
        userId: harvestOwner.id,
        slug: 'harvest-market',
        status: 'APPROVED',
        registeredName: 'Harvest Market Ltd',
        displayName: 'Harvest Market',
        description: 'Fresh groceries and pantry staples from local growers.',
        contactEmail: 'harvest@onlineshop.rw',
        contactPhone: harvestOwner.phoneNumber,
        contactAddress: 'Osu Market Road, Accra',
        ratingAvg: 4.6,
        ratingCount: 3,
        approvedAt: daysAgo(85),
        createdAt: daysAgo(88),
        logoUrl: storeLogoUrl('harvest-market', '#1daf61'),
        aboutUs:
            'Harvest Market buys from growers within a day’s drive and packs groceries the same morning they are listed.',
        brandColors: { primary: '#1daf61', secondary: '#14532d', template: 'VIBRANT_MARKET' },
    })
    const northline = await upsertStore(prisma, {
        userId: northlineOwner.id,
        slug: 'northline-electronics',
        status: 'APPROVED',
        registeredName: 'Northline Electronics Ltd',
        displayName: 'Northline Electronics',
        description: 'Phones, audio, and everyday gadgets with local warranty.',
        contactEmail: 'northline@onlineshop.rw',
        contactPhone: northlineOwner.phoneNumber,
        contactAddress: 'Ring Road East, Accra',
        ratingAvg: 4.4,
        ratingCount: 2,
        approvedAt: daysAgo(74),
        createdAt: daysAgo(78),
        logoUrl: storeLogoUrl('northline-electronics', '#2563eb'),
        aboutUs:
            'Northline benches every gadget before it leaves the shop and writes the warranty date on the receipt.',
        brandColors: { primary: '#2563eb', secondary: '#0f172a', template: 'DEFAULT' },
    })
    const atelier = await upsertStore(prisma, {
        userId: atelierOwner.id,
        slug: 'atelier-threads',
        status: 'APPROVED',
        registeredName: 'Atelier Threads Ltd',
        displayName: 'Atelier Threads',
        description: 'Everyday clothing and accessories made for warm weather.',
        contactEmail: 'atelier@onlineshop.rw',
        contactPhone: atelierOwner.phoneNumber,
        contactAddress: 'Oxford Street, Accra',
        ratingAvg: 4.8,
        ratingCount: 2,
        approvedAt: daysAgo(62),
        createdAt: daysAgo(68),
        logoUrl: storeLogoUrl('atelier-threads', '#db2777'),
        aboutUs:
            'Atelier cuts light cotton and leather goods for warm weather and keeps alterations in the same room as the shop floor.',
        brandColors: { primary: '#db2777', secondary: '#3f1d2e', template: 'ISHUSHO_CRAFTS' },
    })
    await upsertStore(prisma, {
        userId: pendingOwner.id,
        slug: 'pending-goods',
        status: 'SUBMITTED',
        registeredName: 'Pending Goods Ltd',
        displayName: 'Pending Goods',
        description: 'New shop waiting for review.',
        contactEmail: 'pending@onlineshop.rw',
        contactPhone: pendingOwner.phoneNumber,
        contactAddress: 'Tema Community 1',
        ratingAvg: 0,
        ratingCount: 0,
        createdAt: daysAgo(11),
        logoUrl: storeLogoUrl('pending-goods', '#1daf61'),
        aboutUs: 'A new shop that has submitted documents and is waiting for review.',
        brandColors: { primary: '#1daf61', secondary: '#171717', template: 'DEFAULT' },
    })
    await upsertStore(prisma, {
        userId: reviewOwner.id,
        slug: 'review-house',
        status: 'UNDER_REVIEW',
        registeredName: 'Review House Ltd',
        displayName: 'Review House',
        description: 'Documents are with the platform team.',
        contactEmail: 'review@onlineshop.rw',
        contactPhone: reviewOwner.phoneNumber,
        contactAddress: 'Kumasi Central',
        ratingAvg: 0,
        ratingCount: 0,
        createdAt: daysAgo(8),
        logoUrl: storeLogoUrl('review-house', '#1daf61'),
        aboutUs: 'Application files are with the platform review desk.',
        brandColors: { primary: '#1daf61', secondary: '#171717', template: 'DEFAULT' },
    })
    await upsertStore(prisma, {
        userId: rejectedOwner.id,
        slug: 'closed-corner',
        status: 'REJECTED',
        registeredName: 'Closed Corner Ltd',
        displayName: 'Closed Corner',
        description: 'Application did not pass review.',
        contactEmail: 'closed@onlineshop.rw',
        contactPhone: rejectedOwner.phoneNumber,
        contactAddress: 'Takoradi Harbour',
        ratingAvg: 0,
        ratingCount: 0,
        rejectionReason: 'Incomplete business documents.',
        createdAt: daysAgo(18),
        logoUrl: storeLogoUrl('closed-corner', '#1daf61'),
        aboutUs: 'This application did not pass review and is kept for admin testing.',
        brandColors: { primary: '#1daf61', secondary: '#171717', template: 'DEFAULT' },
    })
    await upsertStore(prisma, {
        userId: suspendedOwner.id,
        slug: 'paused-mart',
        status: 'SUSPENDED',
        registeredName: 'Paused Mart Ltd',
        displayName: 'Paused Mart',
        description: 'Temporarily paused by the platform.',
        contactEmail: 'paused@onlineshop.rw',
        contactPhone: suspendedOwner.phoneNumber,
        contactAddress: 'Cape Coast',
        ratingAvg: 3.2,
        ratingCount: 4,
        approvedAt: daysAgo(35),
        createdAt: daysAgo(38),
        logoUrl: storeLogoUrl('paused-mart', '#1daf61'),
        aboutUs: 'Temporarily paused by the platform after fulfillment complaints.',
        brandColors: { primary: '#1daf61', secondary: '#171717', template: 'DEFAULT' },
    })

    for (const [store, owner, industry, category] of [
        [harvest, harvestOwner, 'RETAIL', 'SUPERMARKET'],
        [northline, northlineOwner, 'ELECTRONICS_TECH', 'PHONE_SHOP'],
        [atelier, atelierOwner, 'FASHION_APPAREL', 'CLOTHING_STORE'],
    ] as const) {
        await prisma.user.update({ where: { id: owner.id }, data: { storeId: store.id } })
        await ensureKyc(prisma, store.id, industry, category, {
            fullName: owner.fullName,
            email: owner.email ?? '',
            phone: owner.phoneNumber,
        })
    }

    const pendingStore = await prisma.store.findUnique({ where: { slug: 'pending-goods' } })
    const reviewStore = await prisma.store.findUnique({ where: { slug: 'review-house' } })
    const rejectedStore = await prisma.store.findUnique({ where: { slug: 'closed-corner' } })
    const suspendedStore = await prisma.store.findUnique({ where: { slug: 'paused-mart' } })
    if (pendingStore) {
        await prisma.user.update({ where: { id: pendingOwner.id }, data: { storeId: pendingStore.id } })
        await ensureKyc(prisma, pendingStore.id, 'RETAIL', 'MINI_MARKET', {
            fullName: pendingOwner.fullName,
            email: pendingOwner.email ?? '',
            phone: pendingOwner.phoneNumber,
        })
    }
    if (reviewStore) {
        await prisma.user.update({ where: { id: reviewOwner.id }, data: { storeId: reviewStore.id } })
        await ensureKyc(prisma, reviewStore.id, 'SERVICES', 'CONSULTING', {
            fullName: reviewOwner.fullName,
            email: reviewOwner.email ?? '',
            phone: reviewOwner.phoneNumber,
        })
    }
    if (rejectedStore) {
        await prisma.user.update({ where: { id: rejectedOwner.id }, data: { storeId: rejectedStore.id } })
        await ensureKyc(prisma, rejectedStore.id, 'RETAIL', 'GENERAL_STORE', {
            fullName: rejectedOwner.fullName,
            email: rejectedOwner.email ?? '',
            phone: rejectedOwner.phoneNumber,
        })
    }
    if (suspendedStore) {
        await prisma.user.update({ where: { id: suspendedOwner.id }, data: { storeId: suspendedStore.id } })
        await ensureKyc(prisma, suspendedStore.id, 'RETAIL', 'SUPERMARKET', {
            fullName: suspendedOwner.fullName,
            email: suspendedOwner.email ?? '',
            phone: suspendedOwner.phoneNumber,
        })
    }

    const harvestZones = await ensureZones(prisma, harvest.id)
    const northlineZones = await ensureZones(prisma, northline.id)
    const atelierZones = await ensureZones(prisma, atelier.id)

    const coffee = await ensureProduct(prisma, {
        storeId: harvest.id,
        ownerId: harvestOwner.id,
        name: 'Sunrise Coffee Beans',
        description: 'Medium roast beans for daily brewing.',
        vendor: 'Harvest Market',
        category: 'Groceries',
        categoryId: categoryIds.groceries,
        status: 'ACTIVE',
        tags: ['coffee', 'pantry'],
        images: productImages('Sunrise Coffee Beans'),
        attributes: { organic: true, origin: 'Western Highlands' },
        deliveryPrice: 1500,
        createdAt: daysAgo(70),
        variants: [
            { sku: 'HV-COFFEE-250', title: '250g', size: '250g', model: 'Bag', price: 8000, cost: 4000, stock: 80, attributes: { weight: '250g' } },
            { sku: 'HV-COFFEE-500', title: '500g', size: '500g', model: 'Bag', price: 14500, cost: 7200, stock: 46, attributes: { weight: '500g' } },
            { sku: 'HV-COFFEE-1KG', title: '1kg', size: '1kg', model: 'Family bag', price: 27000, cost: 13000, stock: 8, reserved: 2, attributes: { weight: '1kg' } },
        ],
    })
    const rice = await ensureProduct(prisma, {
        storeId: harvest.id,
        ownerId: harvestOwner.id,
        name: 'River Valley Rice',
        description: 'Long-grain rice sold in family packs.',
        vendor: 'Harvest Market',
        category: 'Groceries',
        categoryId: categoryIds.groceries,
        status: 'ACTIVE',
        tags: ['rice', 'staple'],
        images: productImages('River Valley Rice'),
        attributes: { organic: false, origin: 'Volta' },
        deliveryPrice: 2000,
        createdAt: daysAgo(55),
        variants: [
            { sku: 'HV-RICE-5KG', title: '5kg', size: '5kg', model: 'Family pack', price: 18000, cost: 11000, stock: 34, attributes: { weight: '5kg' } },
            { sku: 'HV-RICE-10KG', title: '10kg', size: '10kg', model: 'Bulk pack', price: 34000, cost: 21000, stock: 0, attributes: { weight: '10kg' } },
        ],
    })
    await ensureProduct(prisma, {
        storeId: harvest.id,
        ownerId: harvestOwner.id,
        name: 'Seasonal Spice Mix',
        description: 'Draft listing for next week’s promotion.',
        vendor: 'Harvest Market',
        category: 'Groceries',
        categoryId: categoryIds.groceries,
        status: 'DRAFT',
        tags: ['spices'],
        images: productImages('Seasonal Spice Mix'),
        attributes: { organic: true, origin: 'Northern Region' },
        deliveryPrice: 1500,
        createdAt: daysAgo(3),
        variants: [{ sku: 'HV-SPICE-DRAFT', title: 'Default', size: '80g', model: 'Tin', price: 6000, cost: 2500, stock: 20, attributes: { weight: '80g' } }],
    })

    const headphones = await ensureProduct(prisma, {
        storeId: northline.id,
        ownerId: northlineOwner.id,
        name: 'Harbor Wireless Headphones',
        description: 'Everyday Bluetooth headphones with a one-year warranty.',
        vendor: 'Northline',
        category: 'Electronics',
        categoryId: categoryIds.electronics,
        status: 'ACTIVE',
        tags: ['audio', 'wireless'],
        images: productImages('Harbor Wireless Headphones'),
        attributes: { brand: 'Harbor', warranty_months: 12 },
        deliveryPrice: 2500,
        createdAt: daysAgo(60),
        variants: [
            { sku: 'NL-HP-BLK', title: 'Black', colorName: 'Black', colorHex: '#111111', model: 'Daily', price: 45000, cost: 24000, stock: 22, attributes: { storage_gb: 0 } },
            { sku: 'NL-HP-SLV', title: 'Silver', colorName: 'Silver', colorHex: '#c0c0c0', model: 'Daily', price: 45000, cost: 24000, stock: 6, reserved: 1, attributes: { storage_gb: 0 } },
        ],
    })
    const charger = await ensureProduct(prisma, {
        storeId: northline.id,
        ownerId: northlineOwner.id,
        name: 'Compact Wall Charger',
        description: 'Fast USB-C charger for phones and small tablets.',
        vendor: 'Northline',
        category: 'Electronics',
        categoryId: categoryIds.electronics,
        status: 'ACTIVE',
        tags: ['charger', 'usb-c'],
        images: productImages('Compact Wall Charger'),
        attributes: { brand: 'Northline', warranty_months: 6 },
        deliveryPrice: 1500,
        createdAt: daysAgo(40),
        variants: [{ sku: 'NL-CHG-20W', title: '20W', model: '20W USB-C', price: 12000, cost: 5500, stock: 58 }],
    })
    await ensureProduct(prisma, {
        storeId: northline.id,
        ownerId: northlineOwner.id,
        name: 'Legacy Feature Phone',
        description: 'Retired listing kept for order history.',
        vendor: 'Northline',
        category: 'Electronics',
        categoryId: categoryIds.electronics,
        status: 'ARCHIVED',
        tags: ['phone'],
        images: productImages('Legacy Feature Phone'),
        attributes: { brand: 'Northline', warranty_months: 3 },
        deliveryPrice: 2000,
        createdAt: daysAgo(50),
        variants: [{ sku: 'NL-PHONE-OLD', title: 'Default', model: 'Legacy', price: 30000, cost: 18000, stock: 0 }],
    })

    const tee = await ensureProduct(prisma, {
        storeId: atelier.id,
        ownerId: atelierOwner.id,
        name: 'Coastal Cotton Tee',
        description: 'Light cotton tee for everyday wear.',
        vendor: 'Atelier Threads',
        category: 'Fashion',
        categoryId: categoryIds.fashion,
        status: 'ACTIVE',
        tags: ['cotton', 'tee'],
        images: productImages('Coastal Cotton Tee'),
        attributes: { material: 'Cotton' },
        deliveryPrice: 1500,
        createdAt: daysAgo(50),
        variants: [
            { sku: 'AT-TEE-BLK-M', title: 'Black / M', colorName: 'Black', colorHex: '#111111', size: 'M', model: 'Crew', price: 15000, cost: 7000, stock: 40, attributes: { size: 'M', color: 'Black' } },
            { sku: 'AT-TEE-BLK-L', title: 'Black / L', colorName: 'Black', colorHex: '#111111', size: 'L', model: 'Crew', price: 15000, cost: 7000, stock: 18, attributes: { size: 'L', color: 'Black' } },
            { sku: 'AT-TEE-WHT-M', title: 'White / M', colorName: 'White', colorHex: '#f8f8f8', size: 'M', model: 'Crew', price: 15000, cost: 7000, stock: 4, attributes: { size: 'M', color: 'White' } },
        ],
    })
    const wallet = await ensureProduct(prisma, {
        storeId: atelier.id,
        ownerId: atelierOwner.id,
        name: 'Fold Leather Wallet',
        description: 'Compact wallet with card slots.',
        vendor: 'Atelier Threads',
        category: 'Fashion',
        categoryId: categoryIds.fashion,
        status: 'ACTIVE',
        tags: ['leather', 'wallet'],
        images: productImages('Fold Leather Wallet'),
        attributes: { material: 'Leather' },
        deliveryPrice: 1500,
        createdAt: daysAgo(36),
        variants: [
            { sku: 'AT-WAL-BRN', title: 'Brown', colorName: 'Brown', colorHex: '#8B4513', model: 'Bifold', price: 25000, cost: 11000, stock: 9, attributes: { color: 'Brown' } },
            { sku: 'AT-WAL-BLK', title: 'Black', colorName: 'Black', colorHex: '#111111', model: 'Bifold', price: 25000, cost: 11000, stock: 14, attributes: { color: 'Black' } },
        ],
    })

    await ensureOrder(prisma, {
        storeId: harvest.id,
        createdBy: harvestOwner.id,
        orderNumber: 'HV-1042',
        customerName: customerAma.fullName,
        customerPhone: customerAma.phoneNumber,
        customerEmail: customerAma.email ?? '',
        placedAt: daysAgo(21),
        items: [
            { variantId: coffee.variants[0].id, productName: coffee.product.name, sku: coffee.variants[0].sku, quantity: 2, unitPrice: 8000 },
            { variantId: rice.variants[0].id, productName: rice.product.name, sku: rice.variants[0].sku, quantity: 1, unitPrice: 18000 },
        ],
        deliveryFee: 1500,
        payment: 'SUCCESS',
        method: 'MOBILE_MONEY',
        fulfillment: 'FULFILLED',
        zoneId: harvestZones[0]?.id,
        note: 'Leave with the security desk if I am out.',
        internalNote: 'Repeat customer. Packed the 250g coffee with a tasting note.',
        promoCode: 'WELCOME10',
        promoDiscount: 3400,
        shippingAddress: '14 Independence Avenue, City center, Accra',
    })
    await ensureOrder(prisma, {
        storeId: harvest.id,
        createdBy: harvestOwner.id,
        orderNumber: 'HV-1088',
        customerName: customerYusuf.fullName,
        customerPhone: customerYusuf.phoneNumber,
        customerEmail: customerYusuf.email ?? '',
        placedAt: daysAgo(4),
        items: [{ variantId: coffee.variants[1].id, productName: coffee.product.name, sku: coffee.variants[1].sku, quantity: 1, unitPrice: 14500 }],
        deliveryFee: 2500,
        payment: 'PENDING',
        method: 'BANK_TRANSFER',
        fulfillment: 'UNFULFILLED',
        zoneId: harvestZones[1]?.id,
        internalNote: 'Waiting on bank transfer proof before packing.',
        shippingAddress: '8 Ring Road East, Outer districts, Accra',
    })
    await ensureOrder(prisma, {
        storeId: northline.id,
        createdBy: northlineOwner.id,
        orderNumber: 'NL-2201',
        customerName: customerLina.fullName,
        customerPhone: customerLina.phoneNumber,
        customerEmail: customerLina.email ?? '',
        placedAt: daysAgo(14),
        items: [
            { variantId: headphones.variants[0].id, productName: headphones.product.name, sku: headphones.variants[0].sku, quantity: 1, unitPrice: 45000 },
            { variantId: charger.variants[0].id, productName: charger.product.name, sku: charger.variants[0].sku, quantity: 1, unitPrice: 12000 },
        ],
        deliveryFee: 2500,
        payment: 'SUCCESS',
        method: 'MOBILE_MONEY',
        fulfillment: 'SHIPPED',
        zoneId: northlineZones[0]?.id,
        internalNote: 'Headset boxed with a spare ear cushion.',
        shippingAddress: '22 Oxford Street, City center, Accra',
    })
    await ensureOrder(prisma, {
        storeId: northline.id,
        createdBy: northlineOwner.id,
        orderNumber: 'NL-2210',
        customerName: customerAma.fullName,
        customerPhone: customerAma.phoneNumber,
        customerEmail: customerAma.email ?? '',
        placedAt: daysAgo(2),
        items: [{ variantId: charger.variants[0].id, productName: charger.product.name, sku: charger.variants[0].sku, quantity: 2, unitPrice: 12000 }],
        deliveryFee: 1500,
        payment: 'FAILED',
        method: 'CARD',
        fulfillment: 'UNFULFILLED',
        internalNote: 'Card proof rejected. Customer was asked to retry mobile money.',
        shippingAddress: '14 Independence Avenue, City center, Accra',
    })
    await ensureOrder(prisma, {
        storeId: atelier.id,
        createdBy: atelierOwner.id,
        orderNumber: 'AT-3304',
        customerName: customerYusuf.fullName,
        customerPhone: customerYusuf.phoneNumber,
        customerEmail: customerYusuf.email ?? '',
        placedAt: daysAgo(9),
        items: [
            { variantId: tee.variants[0].id, productName: tee.product.name, sku: tee.variants[0].sku, quantity: 2, unitPrice: 15000 },
            { variantId: wallet.variants[0].id, productName: wallet.product.name, sku: wallet.variants[0].sku, quantity: 1, unitPrice: 25000 },
        ],
        deliveryFee: 1500,
        payment: 'SUCCESS',
        method: 'CASH_ON_DELIVERY',
        fulfillment: 'PACKED',
        zoneId: atelierZones[0]?.id,
        promoCode: 'MARKET5',
        promoDiscount: 2750,
        internalNote: 'Tee folded with tissue. Wallet in a cloth pouch.',
        shippingAddress: '8 Ring Road East, Outer districts, Accra',
    })
    await ensureOrder(prisma, {
        storeId: atelier.id,
        createdBy: atelierOwner.id,
        orderNumber: 'AT-3319',
        customerName: customerLina.fullName,
        customerPhone: customerLina.phoneNumber,
        customerEmail: customerLina.email ?? '',
        placedAt: daysAgo(1),
        items: [{ variantId: tee.variants[2].id, productName: tee.product.name, sku: tee.variants[2].sku, quantity: 1, unitPrice: 15000 }],
        deliveryFee: 1500,
        payment: 'REFUNDED',
        method: 'MOBILE_MONEY',
        fulfillment: 'CANCELLED',
        internalNote: 'White tee was low stock after a parallel order. Refunded in full.',
        shippingAddress: '22 Oxford Street, City center, Accra',
    })

    const reviews = [
        {
            productId: coffee.product.id,
            storeId: harvest.id,
            userId: customerAma.id,
            rating: 5,
            title: 'Fresh and well packed',
            body: 'Used the 250g bag for two weeks. Brews cleanly and arrived on time.',
            status: 'APPROVED' as const,
        },
        {
            productId: headphones.product.id,
            storeId: northline.id,
            userId: customerLina.id,
            rating: 4,
            title: 'Good daily pair',
            body: 'Comfortable for calls. Case could be sturdier.',
            status: 'APPROVED' as const,
        },
        {
            productId: tee.product.id,
            storeId: atelier.id,
            userId: customerYusuf.id,
            rating: 5,
            title: 'Soft fabric',
            body: 'True to size and light enough for the afternoon heat.',
            status: 'APPROVED' as const,
        },
        {
            productId: wallet.product.id,
            storeId: atelier.id,
            userId: customerAma.id,
            rating: 3,
            title: 'Need a week with it',
            body: 'Looks fine so far. Waiting to see how the leather ages.',
            status: 'PENDING' as const,
        },
    ]
    for (const review of reviews) {
        const existing = await prisma.productReview.findFirst({
            where: { productId: review.productId, userId: review.userId, title: review.title },
        })
        if (existing) continue
        await prisma.productReview.create({
            data: {
                ...review,
                moderatedAt: review.status === 'APPROVED' ? daysAgo(3) : null,
                moderatedBy: review.status === 'APPROVED' ? admin.id : null,
            },
        })
    }

    await prisma.product.update({
        where: { id: coffee.product.id },
        data: { ratingAvg: 5, ratingCount: 1 },
    })
    await prisma.product.update({
        where: { id: headphones.product.id },
        data: { ratingAvg: 4, ratingCount: 1 },
    })
    await prisma.product.update({
        where: { id: tee.product.id },
        data: { ratingAvg: 5, ratingCount: 1 },
    })

    const welcome = await prisma.promotion.findFirst({
        where: { code: 'WELCOME10', storeId: harvest.id },
    })
    if (!welcome) {
        await prisma.promotion.create({
            data: {
                scope: 'STORE',
                storeId: harvest.id,
                code: 'WELCOME10',
                name: 'Welcome 10% off',
                type: 'PERCENT',
                value: 10,
                minOrderAmount: 5000,
                maxRedemptions: 200,
                perUserLimit: 1,
                startsAt: daysAgo(20),
                endsAt: daysAgo(-40),
                status: 'ACTIVE',
                targets: { create: [{ productId: coffee.product.id }] },
            },
        })
    }
    const market = await prisma.promotion.findFirst({
        where: { code: 'MARKET5', storeId: null, scope: 'PLATFORM' },
    })
    if (!market) {
        await prisma.promotion.create({
            data: {
                scope: 'PLATFORM',
                storeId: null,
                code: 'MARKET5',
                name: 'Marketplace 5% off',
                type: 'PERCENT',
                value: 5,
                minOrderAmount: 10000,
                maxRedemptions: 500,
                perUserLimit: 3,
                startsAt: daysAgo(10),
                endsAt: daysAgo(-80),
                status: 'ACTIVE',
                targets: categoryIds.fashion
                    ? { create: [{ categoryId: categoryIds.fashion }] }
                    : undefined,
            },
        })
    }

    await seedExpandedMarketplace(prisma, passwordHash, categoryIds, admin.id)
    await seedDailyAndPerformanceSnapshots(prisma)

    console.log('Demo marketplace ready.')
    console.log(`  Password for all seeded users: ${DEMO_PASSWORD}`)
    console.log('  Admin     admin@onlineshop.rw / +233200000001')
    console.log('  Merchant  /stores/harvest-market  /stores/northline-electronics  /stores/atelier-threads')
    console.log('  Customer  ama.diallo@onlineshop.rw / +233200000101')
}

async function upsertCatalogStore(
    prisma: PrismaClient,
    passwordHash: string,
    spec: CatalogStore,
) {
    const owner = await upsertUser(prisma, passwordHash, {
        phoneNumber: spec.owner.phoneNumber,
        fullName: spec.owner.fullName,
        email: spec.owner.email,
        role: 'STORE_OWNER',
        status: spec.owner.status ?? 'ACTIVE',
        createdAt: daysAgo(spec.owner.createdDaysAgo),
    })
    const store = await upsertStore(prisma, {
        userId: owner.id,
        slug: spec.slug,
        status: spec.status,
        registeredName: spec.registeredName,
        displayName: spec.displayName,
        description: spec.description,
        contactEmail: spec.owner.email,
        contactPhone: spec.owner.phoneNumber,
        contactAddress: spec.contactAddress,
        ratingAvg: spec.ratingAvg,
        ratingCount: spec.ratingCount,
        approvedAt: spec.approvedDaysAgo != null ? daysAgo(spec.approvedDaysAgo) : null,
        rejectionReason: spec.rejectionReason ?? null,
        createdAt: daysAgo(spec.createdDaysAgo),
        logoUrl: storeLogoUrl(spec.slug, spec.brandColors.primary),
        aboutUs: spec.aboutUs,
        brandColors: spec.brandColors,
    })
    await prisma.user.update({ where: { id: owner.id }, data: { storeId: store.id } })
    await ensureKyc(
        prisma,
        store.id,
        spec.industryCode,
        spec.categoryCode,
        {
            fullName: owner.fullName,
            email: owner.email ?? spec.owner.email,
            phone: owner.phoneNumber,
        },
        {
            country: spec.country,
            ownerNationality: spec.ownerNationality,
            address: spec.address,
        },
    )
    const zones = spec.status === 'APPROVED' || spec.status === 'SUSPENDED'
        ? await ensureZones(prisma, store.id)
        : []
    return { owner, store, zones }
}

async function upsertCatalogProduct(
    prisma: PrismaClient,
    spec: CatalogProduct,
    storeId: string,
    ownerId: string,
    categoryIds: Record<string, string>,
) {
    return ensureProduct(prisma, {
        storeId,
        ownerId,
        name: spec.name,
        description: spec.description,
        vendor: spec.vendor,
        category: spec.category,
        categoryId: categoryIds[spec.categorySlug],
        status: spec.status,
        tags: spec.tags,
        images: productImages(spec.name, spec.imageViews),
        attributes: spec.attributes,
        deliveryPrice: spec.deliveryPrice,
        deliveryLocation: spec.deliveryLocation,
        createdAt: daysAgo(spec.createdDaysAgo),
        variants: spec.variants,
    })
}

async function ensureStoreDraft(
    prisma: PrismaClient,
    userId: string,
    displayName: string,
    owner: { fullName: string; email: string; phoneNumber: string },
    currentStep: number,
    completionPercentage: number,
) {
    const existing = await prisma.storeDraft.findUnique({ where: { userId } })
    const draftData = {
        businessType: 'retail',
        industrySectorId: '',
        businessCategoryId: '',
        country: 'RW',
        ownerFullName: owner.fullName,
        ownerNationality: 'Rwandan',
        ownerEmail: owner.email,
        ownerPhoneNumber: owner.phoneNumber,
        businessAddress: {
            province: 'Kigali',
            district: 'Gasabo',
            sector: 'Remera',
            physicalAddress: 'KG 5 Ave, stall draft',
            googleMapsUrl: 'https://maps.google.com/?q=Remera+Kigali',
        },
        registeredName: `${displayName} Ltd`,
        displayName,
        description: `${displayName} is mid-onboarding in the seeded marketplace.`,
        slug: displayName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        brandPrimaryColor: '#1daf61',
        brandSecondaryColor: '#171717',
        contactEmail: owner.email,
        contactPhone: owner.phoneNumber,
        contactAddress: 'Remera, Kigali',
        aboutUs: 'Draft store used to test onboarding resume.',
        logoDataUrl: null,
        deliveryZones: [...EXTRA_DELIVERY_ZONES],
    }
    if (existing) {
        await prisma.storeDraft.update({
            where: { userId },
            data: { draftData, currentStep, completionPercentage },
        })
        return
    }
    await prisma.storeDraft.create({
        data: { userId, draftData, currentStep, completionPercentage },
    })
}

async function seedExpandedMarketplace(
    prisma: PrismaClient,
    passwordHash: string,
    categoryIds: Record<string, string>,
    adminId: string,
) {
    console.log('Seeding expanded marketplace catalog (5x)...')

    const extraCustomers = []
    for (const person of EXTRA_CUSTOMERS) {
        extraCustomers.push(
            await upsertUser(prisma, passwordHash, {
                phoneNumber: person.phoneNumber,
                fullName: person.fullName,
                email: person.email,
                role: 'CUSTOMER',
                status: person.status ?? 'ACTIVE',
                createdAt: daysAgo(person.createdDaysAgo),
            }),
        )
    }

    for (const [index, person] of DRAFT_ONLY_OWNERS.entries()) {
        const owner = await upsertUser(prisma, passwordHash, {
            phoneNumber: person.phoneNumber,
            fullName: person.fullName,
            email: person.email,
            role: 'STORE_OWNER',
            status: 'ACTIVE',
            createdAt: daysAgo(person.createdDaysAgo),
        })
        await ensureStoreDraft(
            prisma,
            owner.id,
            index === 0 ? 'Hilltop Provisions' : 'Night Market Studio',
            { fullName: owner.fullName, email: owner.email ?? person.email, phoneNumber: owner.phoneNumber },
            index === 0 ? 3 : 2,
            index === 0 ? 55 : 30,
        )
    }

    const storeBySlug = new Map<string, { ownerId: string; storeId: string; zoneIds: string[] }>()
    for (const spec of [...EXTRA_APPROVED_STORES, ...EXTRA_PIPELINE_STORES]) {
        const created = await upsertCatalogStore(prisma, passwordHash, spec)
        storeBySlug.set(spec.slug, {
            ownerId: created.owner.id,
            storeId: created.store.id,
            zoneIds: created.zones.map((zone) => zone.id),
        })
        console.log(`  Store: ${spec.slug} (${spec.status})`)
    }

    for (const slug of ['harvest-market', 'northline-electronics', 'atelier-threads']) {
        const store = await prisma.store.findUnique({ where: { slug } })
        if (!store) continue
        const zones = await ensureZones(prisma, store.id)
        storeBySlug.set(slug, {
            ownerId: store.userId,
            storeId: store.id,
            zoneIds: zones.map((zone) => zone.id),
        })
    }

    const productsByStore = new Map<string, Array<{ product: { id: string; name: string }; variants: Array<{ id: string; sku: string; price: unknown }> }>>()
    for (const spec of EXTRA_PRODUCTS) {
        const host = storeBySlug.get(spec.storeSlug)
        if (!host) continue
        const created = await upsertCatalogProduct(prisma, spec, host.storeId, host.ownerId, categoryIds)
        const list = productsByStore.get(spec.storeSlug) ?? []
        list.push(created)
        productsByStore.set(spec.storeSlug, list)
        console.log(`  Product: ${spec.name}`)
    }

    const paymentCycle = ['SUCCESS', 'PENDING', 'FAILED', 'REFUNDED', 'SUCCESS'] as const
    const fulfillmentCycle = ['FULFILLED', 'UNFULFILLED', 'SHIPPED', 'PACKED', 'CANCELLED'] as const
    const methodCycle = ['MOBILE_MONEY', 'BANK_TRANSFER', 'CARD', 'CASH_ON_DELIVERY'] as const
    const reviewBodies = [
        'Arrived sealed and matched the listing photos.',
        'Used it for a week. Build is honest for the price.',
        'Packaging was careful. Would order the larger size next.',
        'Color is true. Delivery took a day longer than the estimate.',
        'Stock note on the site was accurate. Rider called at the gate.',
    ]

    let extraOrderIndex = 0
    const activeCustomers = extraCustomers.filter((customer) => customer.status === 'ACTIVE')
    for (const spec of EXTRA_APPROVED_STORES) {
        const host = storeBySlug.get(spec.slug)
        const products = (productsByStore.get(spec.slug) ?? []).filter((item) => item.variants.length > 0)
        if (!host || products.length === 0) continue

        for (let copy = 0; copy < 2; copy++) {
            const product = products[copy % products.length]
            const variant = product.variants[copy % product.variants.length]
            const customer = activeCustomers[extraOrderIndex % activeCustomers.length]
            const payment = paymentCycle[extraOrderIndex % paymentCycle.length]
            const fulfillment =
                payment === 'FAILED'
                    ? 'UNFULFILLED'
                    : payment === 'REFUNDED'
                      ? 'CANCELLED'
                      : fulfillmentCycle[extraOrderIndex % fulfillmentCycle.length]
            const method = methodCycle[extraOrderIndex % methodCycle.length]
            const quantity = 1 + (extraOrderIndex % 2)
            const unitPrice = Number(variant.price)
            const orderNumber = `EX-${4100 + extraOrderIndex}`
            extraOrderIndex += 1

            const order = await ensureOrder(prisma, {
                storeId: host.storeId,
                createdBy: host.ownerId,
                orderNumber,
                customerName: customer.fullName,
                customerPhone: customer.phoneNumber,
                customerEmail: customer.email ?? '',
                placedAt: daysAgo(2 + extraOrderIndex * 2),
                items: [
                    {
                        variantId: variant.id,
                        productName: product.product.name,
                        sku: variant.sku,
                        quantity,
                        unitPrice,
                    },
                ],
                deliveryFee: EXTRA_DELIVERY_ZONES[copy % EXTRA_DELIVERY_ZONES.length].feeRwf,
                payment,
                method,
                fulfillment,
                zoneId: host.zoneIds[copy % Math.max(host.zoneIds.length, 1)],
                note: copy === 0 ? 'Please call when you reach the compound.' : undefined,
                internalNote: `Expanded seed order ${orderNumber}.`,
                reviewedBy: adminId,
                shippingAddress: `${12 + extraOrderIndex} Market Street, ${spec.contactAddress}`,
            })

            if (copy === 0 && product.product.name) {
                const existingReview = await prisma.productReview.findFirst({
                    where: { productId: product.product.id, userId: customer.id },
                })
                if (!existingReview) {
                    const rating = 3 + (extraOrderIndex % 3)
                    const status = extraOrderIndex % 5 === 0 ? 'PENDING' : extraOrderIndex % 7 === 0 ? 'REJECTED' : 'APPROVED'
                    await prisma.productReview.create({
                        data: {
                            productId: product.product.id,
                            storeId: host.storeId,
                            userId: customer.id,
                            orderId: order.id,
                            rating,
                            title: status === 'REJECTED' ? 'Needs a second look' : 'As listed',
                            body: reviewBodies[extraOrderIndex % reviewBodies.length],
                            status,
                            moderatedAt: status === 'PENDING' ? null : daysAgo(1),
                            moderatedBy: status === 'PENDING' ? null : adminId,
                        },
                    })
                    if (status === 'APPROVED') {
                        const approved = await prisma.productReview.aggregate({
                            where: { productId: product.product.id, status: 'APPROVED' },
                            _avg: { rating: true },
                            _count: { _all: true },
                        })
                        await prisma.product.update({
                            where: { id: product.product.id },
                            data: {
                                ratingAvg: approved._avg.rating ?? rating,
                                ratingCount: approved._count._all,
                            },
                        })
                    }
                }
            }
        }
    }

    for (const promo of EXTRA_PROMO_CODES) {
        const storeId = promo.storeSlug ? storeBySlug.get(promo.storeSlug)?.storeId ?? null : null
        if (promo.storeSlug && !storeId) continue
        const existing = await prisma.promotion.findFirst({
            where: { code: promo.code, storeId },
        })
        if (existing) continue

        const productId = promo.productName
            ? (await prisma.product.findFirst({
                  where: { storeId: storeId ?? undefined, name: promo.productName },
              }))?.id
            : undefined
        const categoryId = promo.categorySlug ? categoryIds[promo.categorySlug] : undefined

        const created = await prisma.promotion.create({
            data: {
                scope: storeId ? 'STORE' : 'PLATFORM',
                storeId,
                code: promo.code,
                name: promo.name,
                type: promo.type,
                value: promo.value,
                minOrderAmount: promo.minOrderAmount ?? 0,
                maxRedemptions: promo.maxRedemptions ?? 50,
                perUserLimit: promo.perUserLimit ?? 1,
                startsAt: daysAgo(15),
                endsAt: daysAgo(-60),
                status: 'ACTIVE',
                targets:
                    productId || categoryId
                        ? {
                              create: [
                                  {
                                      productId: productId ?? null,
                                      categoryId: categoryId ?? null,
                                  },
                              ],
                          }
                        : undefined,
            },
        })

        if (storeId) {
            const order = await prisma.order.findFirst({
                where: { storeId, payment: { status: 'SUCCESS' } },
                orderBy: { placedAt: 'desc' },
            })
            if (order) {
                const already = await prisma.promotionRedemption.findFirst({
                    where: { promotionId: created.id, orderId: order.id },
                })
                if (!already) {
                    await prisma.promotionRedemption.create({
                        data: {
                            promotionId: created.id,
                            orderId: order.id,
                            amount: Number(created.value),
                            customerPhone: order.customerPhone,
                        },
                    })
                }
            }
        }
        console.log(`  Promo: ${promo.code}`)
    }

    const extraOriginalReviews = [
        { productName: 'Highland Honey', storeSlug: 'harvest-market' },
        { productName: 'Harbor Bluetooth Speaker', storeSlug: 'northline-electronics' },
        { productName: 'Linen Shirt Dress', storeSlug: 'atelier-threads' },
        { productName: 'Wax Print Scarf', storeSlug: 'atelier-threads' },
    ]
    for (const [index, spec] of extraOriginalReviews.entries()) {
        const host = storeBySlug.get(spec.storeSlug)
        const product = await prisma.product.findFirst({
            where: { name: spec.productName, storeId: host?.storeId },
        })
        const customer = extraCustomers[index]
        if (!host || !product || !customer) continue
        const existingReview = await prisma.productReview.findFirst({
            where: { productId: product.id, userId: customer.id },
        })
        if (existingReview) continue
        const rating = 4 + (index % 2)
        await prisma.productReview.create({
            data: {
                productId: product.id,
                storeId: host.storeId,
                userId: customer.id,
                rating,
                title: 'Would buy again',
                body: reviewBodies[index % reviewBodies.length],
                status: 'APPROVED',
                moderatedAt: daysAgo(2),
                moderatedBy: adminId,
            },
        })
        const approved = await prisma.productReview.aggregate({
            where: { productId: product.id, status: 'APPROVED' },
            _avg: { rating: true },
            _count: { _all: true },
        })
        await prisma.product.update({
            where: { id: product.id },
            data: {
                ratingAvg: approved._avg.rating ?? rating,
                ratingCount: approved._count._all,
            },
        })
    }

    const welcome = await prisma.promotion.findFirst({
        where: { code: 'WELCOME10' },
    })
    const welcomeOrder = await prisma.order.findUnique({ where: { orderNumber: 'HV-1042' } })
    if (welcome && welcomeOrder) {
        const already = await prisma.promotionRedemption.findFirst({
            where: { promotionId: welcome.id, orderId: welcomeOrder.id },
        })
        if (!already) {
            await prisma.promotionRedemption.create({
                data: {
                    promotionId: welcome.id,
                    orderId: welcomeOrder.id,
                    amount: 3400,
                    customerPhone: welcomeOrder.customerPhone,
                },
            })
        }
    }

    console.log('Expanded marketplace catalog seeded.')
}

async function seedDailyAndPerformanceSnapshots(prisma: PrismaClient) {
    const stores = await prisma.store.findMany({
        where: { status: { in: ['APPROVED', 'SUSPENDED'] } },
        include: {
            products: {
                include: { variants: true },
            },
        },
    })

    for (const store of stores) {
        const activeProducts = store.products.filter((product) => product.status === 'ACTIVE').length
        const variants = store.products.flatMap((product) => product.variants)
        for (let i = 0; i < 50; i++) {
            const snapshotDate = daysAgo(i)
            snapshotDate.setHours(0, 0, 0, 0)
            const existing = await prisma.dailyMetricsSnapshot.findFirst({
                where: { storeId: store.id, snapshotDate },
            })
            const wave = (i % 7) + 1
            const payload = {
                totalSales: 4 + wave + Math.floor(activeProducts / 2),
                totalRevenue: 120000 + i * 8500 + activeProducts * 4000,
                totalCost: 60000 + i * 3800,
                totalProfit: 60000 + i * 4700,
                totalOrders: 4 + wave,
                pendingOrders: i % 5 === 0 ? 2 : 1,
                completedOrders: 3 + wave,
                cancelledOrders: i % 6 === 0 ? 1 : 0,
                activeProducts,
                lowStockCount: Math.max(1, Math.floor(variants.length / 8)),
                outOfStockCount: Math.max(0, Math.floor(variants.length / 12)),
                totalCustomers: 18 + i + store.ratingCount,
                newCustomers: 1 + (i % 3),
                activeCustomers: 7 + wave,
                totalStockValue: 400000 + variants.length * 12000,
                totalStockQuantity: 80 + variants.length * 4,
            }
            if (existing) {
                await prisma.dailyMetricsSnapshot.update({
                    where: { id: existing.id },
                    data: payload,
                })
            } else {
                await prisma.dailyMetricsSnapshot.create({
                    data: { storeId: store.id, snapshotDate, ...payload },
                })
            }
        }

        for (const variant of variants) {
            for (let i = 0; i < 14; i++) {
                const snapshotDate = daysAgo(i)
                snapshotDate.setHours(0, 0, 0, 0)
                const unitsSold = Math.max(0, 6 - (i % 5) + (variant.sku.length % 3))
                const revenue = unitsSold * Number(variant.price)
                const existing = await prisma.productPerformanceSnapshot.findFirst({
                    where: {
                        storeId: store.id,
                        productVariantId: variant.id,
                        snapshotDate,
                    },
                })
                const payload = {
                    unitsSold,
                    revenue,
                    trendPercent: i === 13 ? 0 : (unitsSold - 3) * 4.5,
                }
                if (existing) {
                    await prisma.productPerformanceSnapshot.update({
                        where: { id: existing.id },
                        data: payload,
                    })
                } else {
                    await prisma.productPerformanceSnapshot.create({
                        data: {
                            storeId: store.id,
                            productVariantId: variant.id,
                            snapshotDate,
                            ...payload,
                        },
                    })
                }
            }
        }
    }
}
