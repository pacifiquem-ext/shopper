import { PrismaClient, type Prisma } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

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
        brandColors: { primary: string; secondary: string }
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
        currency: 'USD',
        contactEmail: input.contactEmail,
        contactPhone: input.contactPhone,
        contactAddress: input.contactAddress,
        aboutUs: input.description,
        ratingAvg: input.ratingAvg,
        ratingCount: input.ratingCount,
        approvedAt: input.approvedAt ?? null,
        rejectionReason: input.rejectionReason ?? null,
        brandColors: input.brandColors,
        returnPolicy: 'Unused items can be returned within 7 days with the receipt.',
        privacyPolicy: 'We only use order details to fulfill and support purchases.',
        termsAndConditions: 'Standard marketplace terms apply to every order.',
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
) {
    const industry = await prisma.industrySector.findUnique({ where: { code: industryCode } })
    const category = await prisma.businessCategory.findUnique({ where: { code: categoryCode } })
    if (!industry || !category) return

    const existing = await prisma.storeKyc.findUnique({ where: { storeId } })
    const payload = {
        industrySectorId: industry.id,
        businessCategoryId: category.id,
        country: 'GH',
        ownerFullName: owner.fullName,
        ownerNationality: 'Ghanaian',
        ownerEmail: owner.email,
        ownerPhoneNumber: owner.phone,
    }
    const kyc = existing
        ? await prisma.storeKyc.update({ where: { storeId }, data: payload })
        : await prisma.storeKyc.create({ data: { storeId, ...payload } })

    const address = await prisma.address.findFirst({ where: { businessKycId: kyc.id } })
    if (!address) {
        await prisma.address.create({
            data: {
                province: 'Greater Accra',
                district: 'Accra Metro',
                sector: 'Osu',
                physicalAddress: '12 Market Street',
                businessKycId: kyc.id,
            },
        })
    }
}

async function ensureZones(prisma: PrismaClient, storeId: string) {
    const zones = [
        { name: 'City center', feeRwf: 1500, etaMinutes: 45 },
        { name: 'Outer districts', feeRwf: 2500, etaMinutes: 90 },
    ]
    const created = []
    for (const zone of zones) {
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
        createdAt: Date
        variants: Array<{
            sku: string
            title: string
            colorName?: string | null
            colorHex?: string | null
            size?: string | null
            price: number
            cost: number
            stock: number
            reserved?: number
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
        deliveryLocation: 'City center',
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
    for (const variant of input.variants) {
        const reserved = variant.reserved ?? 0
        const available = Math.max(0, variant.stock - reserved)
        const row = await prisma.productVariant.upsert({
            where: { sku: variant.sku },
            update: {
                title: variant.title,
                colorName: variant.colorName ?? null,
                colorHex: variant.colorHex ?? null,
                size: variant.size ?? null,
                price: variant.price,
                compareAt: Math.round(variant.price * 1.15),
                cost: variant.cost,
                productId: product.id,
            },
            create: {
                productId: product.id,
                sku: variant.sku,
                title: variant.title,
                colorName: variant.colorName ?? null,
                colorHex: variant.colorHex ?? null,
                size: variant.size ?? null,
                price: variant.price,
                compareAt: Math.round(variant.price * 1.15),
                cost: variant.cost,
            },
        })

        const inventory = await prisma.inventoryRecord.findUnique({
            where: { productVariantId: row.id },
        })
        if (inventory) {
            await prisma.inventoryRecord.update({
                where: { id: inventory.id },
                data: {
                    onHand: variant.stock,
                    reserved,
                    available,
                    reorderPoint: 10,
                    status: stockStatus(available),
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
    },
) {
    const existing = await prisma.order.findUnique({ where: { orderNumber: input.orderNumber } })
    if (existing) return existing

    const subtotal = input.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
    const total = subtotal + input.deliveryFee
    const order = await prisma.order.create({
        data: {
            storeId: input.storeId,
            orderNumber: input.orderNumber,
            customerName: input.customerName,
            customerPhone: input.customerPhone,
            customerEmail: input.customerEmail,
            shippingAddress: '12 Independence Avenue, City center',
            billingAddress: '12 Independence Avenue, City center',
            subtotal,
            deliveryFee: input.deliveryFee,
            discount: 0,
            tax: 0,
            total,
            customerNote: input.note ?? null,
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
            reference: input.payment === 'SUCCESS' ? `PAY-${input.orderNumber}` : null,
            paidAt: input.payment === 'SUCCESS' ? input.placedAt : null,
        },
    })

    await prisma.orderFulfillment.create({
        data: {
            orderId: order.id,
            status: input.fulfillment,
            deliveryMethod: 'Standard delivery',
            deliveryZoneId: input.zoneId ?? null,
            packedBy: ['PACKED', 'SHIPPED', 'FULFILLED'].includes(input.fulfillment)
                ? input.createdBy
                : null,
            deliveredBy: input.fulfillment === 'FULFILLED' ? 'Local rider' : null,
            trackingNumber: input.fulfillment === 'SHIPPED' ? `TRK-${input.orderNumber}` : null,
            deliveredAt: input.fulfillment === 'FULFILLED' ? new Date(input.placedAt.getTime() + 36 * 3600_000) : null,
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
            },
        })
    }

    await prisma.orderMessage.create({
        data: {
            orderId: order.id,
            sender: 'ADMIN',
            senderName: 'Store desk',
            message: 'Thanks for your order. We will confirm payment shortly.',
            createdAt: input.placedAt,
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
        email: 'admin@shopper.app',
        role: 'PLATFORM_ADMIN',
        status: 'ACTIVE',
        createdAt: daysAgo(120),
    })

    const harvestOwner = await upsertUser(prisma, passwordHash, {
        phoneNumber: '+233200000010',
        fullName: 'Kwame Mensah',
        email: 'kwame@harvest-market.test',
        role: 'STORE_OWNER',
        status: 'ACTIVE',
        createdAt: daysAgo(90),
    })
    const northlineOwner = await upsertUser(prisma, passwordHash, {
        phoneNumber: '+233200000011',
        fullName: 'Fatou Ndiaye',
        email: 'fatou@northline.test',
        role: 'STORE_OWNER',
        status: 'ACTIVE',
        createdAt: daysAgo(80),
    })
    const atelierOwner = await upsertUser(prisma, passwordHash, {
        phoneNumber: '+233200000012',
        fullName: 'Imani Okello',
        email: 'imani@atelier-threads.test',
        role: 'STORE_OWNER',
        status: 'ACTIVE',
        createdAt: daysAgo(70),
    })
    const pendingOwner = await upsertUser(prisma, passwordHash, {
        phoneNumber: '+233200000013',
        fullName: 'Samuel Adeyemi',
        email: 'samuel@pending-goods.test',
        role: 'STORE_OWNER',
        status: 'ACTIVE',
        createdAt: daysAgo(12),
    })
    const reviewOwner = await upsertUser(prisma, passwordHash, {
        phoneNumber: '+233200000014',
        fullName: 'Chidinma Eze',
        email: 'chidinma@review-house.test',
        role: 'STORE_OWNER',
        status: 'ACTIVE',
        createdAt: daysAgo(9),
    })
    const rejectedOwner = await upsertUser(prisma, passwordHash, {
        phoneNumber: '+233200000015',
        fullName: 'Joseph Kamau',
        email: 'joseph@closed-corner.test',
        role: 'STORE_OWNER',
        status: 'ACTIVE',
        createdAt: daysAgo(20),
    })
    const suspendedOwner = await upsertUser(prisma, passwordHash, {
        phoneNumber: '+233200000016',
        fullName: 'Aisha Bello',
        email: 'aisha@paused-mart.test',
        role: 'STORE_OWNER',
        status: 'SUSPENDED',
        createdAt: daysAgo(40),
    })

    const customerAma = await upsertUser(prisma, passwordHash, {
        phoneNumber: '+233200000101',
        fullName: 'Ama Diallo',
        email: 'ama.diallo@example.com',
        role: 'CUSTOMER',
        status: 'ACTIVE',
        createdAt: daysAgo(60),
    })
    const customerYusuf = await upsertUser(prisma, passwordHash, {
        phoneNumber: '+233200000102',
        fullName: 'Yusuf Ibrahim',
        email: 'yusuf.ibrahim@example.com',
        role: 'CUSTOMER',
        status: 'ACTIVE',
        createdAt: daysAgo(45),
    })
    const customerLina = await upsertUser(prisma, passwordHash, {
        phoneNumber: '+233200000103',
        fullName: 'Lina Mwangi',
        email: 'lina.mwangi@example.com',
        role: 'CUSTOMER',
        status: 'ACTIVE',
        createdAt: daysAgo(30),
    })
    await upsertUser(prisma, passwordHash, {
        phoneNumber: '+233200000104',
        fullName: 'Peter Okonkwo',
        email: 'peter.okonkwo@example.com',
        role: 'CUSTOMER',
        status: 'PENDING_VERIFICATION',
        createdAt: daysAgo(2),
    })
    await upsertUser(prisma, passwordHash, {
        phoneNumber: '+233200000105',
        fullName: 'Mariam Sow',
        email: 'mariam.sow@example.com',
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
        contactEmail: 'hello@harvest-market.test',
        contactPhone: harvestOwner.phoneNumber,
        contactAddress: 'Osu Market Road, Accra',
        ratingAvg: 4.6,
        ratingCount: 3,
        approvedAt: daysAgo(85),
        createdAt: daysAgo(88),
        brandColors: { primary: '#1daf61', secondary: '#14532d' },
    })
    const northline = await upsertStore(prisma, {
        userId: northlineOwner.id,
        slug: 'northline-electronics',
        status: 'APPROVED',
        registeredName: 'Northline Electronics Ltd',
        displayName: 'Northline Electronics',
        description: 'Phones, audio, and everyday gadgets with local warranty.',
        contactEmail: 'hello@northline.test',
        contactPhone: northlineOwner.phoneNumber,
        contactAddress: 'Ring Road East, Accra',
        ratingAvg: 4.4,
        ratingCount: 2,
        approvedAt: daysAgo(74),
        createdAt: daysAgo(78),
        brandColors: { primary: '#2563eb', secondary: '#0f172a' },
    })
    const atelier = await upsertStore(prisma, {
        userId: atelierOwner.id,
        slug: 'atelier-threads',
        status: 'APPROVED',
        registeredName: 'Atelier Threads Ltd',
        displayName: 'Atelier Threads',
        description: 'Everyday clothing and accessories made for warm weather.',
        contactEmail: 'hello@atelier-threads.test',
        contactPhone: atelierOwner.phoneNumber,
        contactAddress: 'Oxford Street, Accra',
        ratingAvg: 4.8,
        ratingCount: 2,
        approvedAt: daysAgo(62),
        createdAt: daysAgo(68),
        brandColors: { primary: '#db2777', secondary: '#3f1d2e' },
    })
    await upsertStore(prisma, {
        userId: pendingOwner.id,
        slug: 'pending-goods',
        status: 'SUBMITTED',
        registeredName: 'Pending Goods Ltd',
        displayName: 'Pending Goods',
        description: 'New shop waiting for review.',
        contactEmail: 'hello@pending-goods.test',
        contactPhone: pendingOwner.phoneNumber,
        contactAddress: 'Tema Community 1',
        ratingAvg: 0,
        ratingCount: 0,
        createdAt: daysAgo(11),
        brandColors: { primary: '#1daf61', secondary: '#171717' },
    })
    await upsertStore(prisma, {
        userId: reviewOwner.id,
        slug: 'review-house',
        status: 'UNDER_REVIEW',
        registeredName: 'Review House Ltd',
        displayName: 'Review House',
        description: 'Documents are with the platform team.',
        contactEmail: 'hello@review-house.test',
        contactPhone: reviewOwner.phoneNumber,
        contactAddress: 'Kumasi Central',
        ratingAvg: 0,
        ratingCount: 0,
        createdAt: daysAgo(8),
        brandColors: { primary: '#1daf61', secondary: '#171717' },
    })
    await upsertStore(prisma, {
        userId: rejectedOwner.id,
        slug: 'closed-corner',
        status: 'REJECTED',
        registeredName: 'Closed Corner Ltd',
        displayName: 'Closed Corner',
        description: 'Application did not pass review.',
        contactEmail: 'hello@closed-corner.test',
        contactPhone: rejectedOwner.phoneNumber,
        contactAddress: 'Takoradi Harbour',
        ratingAvg: 0,
        ratingCount: 0,
        rejectionReason: 'Incomplete business documents.',
        createdAt: daysAgo(18),
        brandColors: { primary: '#1daf61', secondary: '#171717' },
    })
    await upsertStore(prisma, {
        userId: suspendedOwner.id,
        slug: 'paused-mart',
        status: 'SUSPENDED',
        registeredName: 'Paused Mart Ltd',
        displayName: 'Paused Mart',
        description: 'Temporarily paused by the platform.',
        contactEmail: 'hello@paused-mart.test',
        contactPhone: suspendedOwner.phoneNumber,
        contactAddress: 'Cape Coast',
        ratingAvg: 3.2,
        ratingCount: 4,
        approvedAt: daysAgo(35),
        createdAt: daysAgo(38),
        brandColors: { primary: '#1daf61', secondary: '#171717' },
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
        images: ['/products/coffee-1.jpg'],
        attributes: { organic: true },
        deliveryPrice: 1500,
        createdAt: daysAgo(70),
        variants: [
            { sku: 'HV-COFFEE-250', title: '250g', size: '250g', price: 8000, cost: 4000, stock: 80 },
            { sku: 'HV-COFFEE-500', title: '500g', size: '500g', price: 14500, cost: 7200, stock: 46 },
            { sku: 'HV-COFFEE-1KG', title: '1kg', size: '1kg', price: 27000, cost: 13000, stock: 8, reserved: 2 },
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
        images: ['/products/coffee-1.jpg'],
        attributes: { organic: false },
        deliveryPrice: 2000,
        createdAt: daysAgo(55),
        variants: [
            { sku: 'HV-RICE-5KG', title: '5kg', size: '5kg', price: 18000, cost: 11000, stock: 34 },
            { sku: 'HV-RICE-10KG', title: '10kg', size: '10kg', price: 34000, cost: 21000, stock: 0 },
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
        images: ['/products/coffee-1.jpg'],
        attributes: {},
        deliveryPrice: 1500,
        createdAt: daysAgo(3),
        variants: [{ sku: 'HV-SPICE-DRAFT', title: 'Default', price: 6000, cost: 2500, stock: 20 }],
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
        images: ['/products/headphones-1.jpg'],
        attributes: { brand: 'Harbor', warranty_months: 12 },
        deliveryPrice: 2500,
        createdAt: daysAgo(60),
        variants: [
            { sku: 'NL-HP-BLK', title: 'Black', colorName: 'Black', colorHex: '#111111', price: 45000, cost: 24000, stock: 22 },
            { sku: 'NL-HP-SLV', title: 'Silver', colorName: 'Silver', colorHex: '#c0c0c0', price: 45000, cost: 24000, stock: 6, reserved: 1 },
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
        images: ['/products/headphones-1.jpg'],
        attributes: { brand: 'Northline', warranty_months: 6 },
        deliveryPrice: 1500,
        createdAt: daysAgo(40),
        variants: [{ sku: 'NL-CHG-20W', title: '20W', price: 12000, cost: 5500, stock: 58 }],
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
        images: ['/products/headphones-1.jpg'],
        attributes: { brand: 'Northline' },
        deliveryPrice: 2000,
        createdAt: daysAgo(50),
        variants: [{ sku: 'NL-PHONE-OLD', title: 'Default', price: 30000, cost: 18000, stock: 0 }],
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
        images: ['/products/tshirt-1.jpg', '/products/tshirt-2.jpg'],
        attributes: { material: 'Cotton' },
        deliveryPrice: 1500,
        createdAt: daysAgo(50),
        variants: [
            { sku: 'AT-TEE-BLK-M', title: 'Black / M', colorName: 'Black', colorHex: '#111111', size: 'M', price: 15000, cost: 7000, stock: 40 },
            { sku: 'AT-TEE-BLK-L', title: 'Black / L', colorName: 'Black', colorHex: '#111111', size: 'L', price: 15000, cost: 7000, stock: 18 },
            { sku: 'AT-TEE-WHT-M', title: 'White / M', colorName: 'White', colorHex: '#f8f8f8', size: 'M', price: 15000, cost: 7000, stock: 4 },
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
        images: ['/products/wallet-1.jpg'],
        attributes: { material: 'Leather' },
        deliveryPrice: 1500,
        createdAt: daysAgo(36),
        variants: [
            { sku: 'AT-WAL-BRN', title: 'Brown', colorName: 'Brown', colorHex: '#8B4513', price: 25000, cost: 11000, stock: 9 },
            { sku: 'AT-WAL-BLK', title: 'Black', colorName: 'Black', colorHex: '#111111', price: 25000, cost: 11000, stock: 14 },
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
                startsAt: daysAgo(10),
                endsAt: daysAgo(-80),
                status: 'ACTIVE',
                targets: categoryIds.fashion
                    ? { create: [{ categoryId: categoryIds.fashion }] }
                    : undefined,
            },
        })
    }

    for (const store of [harvest, northline, atelier]) {
        for (let i = 0; i < 10; i++) {
            const snapshotDate = daysAgo(i)
            snapshotDate.setHours(0, 0, 0, 0)
            const existing = await prisma.dailyMetricsSnapshot.findFirst({
                where: { storeId: store.id, snapshotDate },
            })
            if (existing) continue
            await prisma.dailyMetricsSnapshot.create({
                data: {
                    storeId: store.id,
                    snapshotDate,
                    totalSales: 6 + i,
                    totalRevenue: 180000 + i * 12000,
                    totalCost: 90000 + i * 5000,
                    totalProfit: 90000 + i * 7000,
                    totalOrders: 6 + i,
                    pendingOrders: 1,
                    completedOrders: 4 + i,
                    cancelledOrders: i % 4 === 0 ? 1 : 0,
                    activeProducts: 4,
                    lowStockCount: 1,
                    outOfStockCount: 1,
                    totalCustomers: 20 + i,
                    newCustomers: 1,
                    activeCustomers: 8 + i,
                    totalStockValue: 900000,
                    totalStockQuantity: 200,
                },
            })
        }
    }

    console.log('Demo marketplace ready.')
    console.log(`  Password for all seeded users: ${DEMO_PASSWORD}`)
    console.log('  Admin     admin@shopper.app / +233200000001')
    console.log('  Merchant  /stores/harvest-market  /stores/northline-electronics  /stores/atelier-threads')
    console.log('  Customer  ama.diallo@example.com / +233200000101')
}
