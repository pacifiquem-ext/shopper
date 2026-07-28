import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { seedDemoMarketplace } from './seed-demo';

const prisma = new PrismaClient();

const industries = [
    {
        code: 'RETAIL',
        name: 'Retail & E-Commerce',
        description: 'Physical and online product sales',
    },
    {
        code: 'FOOD_BEVERAGE',
        name: 'Food & Beverage',
        description: 'Restaurants, cafes, food production',
    },
    {
        code: 'AGRICULTURE',
        name: 'Agriculture & Agribusiness',
        description: 'Farming, livestock, agro processing',
    },
    {
        code: 'MANUFACTURING',
        name: 'Manufacturing',
        description: 'Production of goods',
    },
    {
        code: 'WHOLESALE',
        name: 'Wholesale & Distribution',
        description: 'Bulk selling and supply',
    },
    {
        code: 'HEALTHCARE',
        name: 'Healthcare & Medical',
        description: 'Clinics, pharmacies, health services',
    },
    {
        code: 'BEAUTY_PERSONAL_CARE',
        name: 'Beauty & Personal Care',
        description: 'Salons, cosmetics, wellness',
    },
    {
        code: 'FASHION_APPAREL',
        name: 'Fashion & Apparel',
        description: 'Clothing, footwear, accessories',
    },
    {
        code: 'ELECTRONICS_TECH',
        name: 'Electronics & Technology',
        description: 'Gadgets, devices, IT products',
    },
    {
        code: 'HOME_LIVING',
        name: 'Home & Living',
        description: 'Furniture, home improvement',
    },
    {
        code: 'AUTOMOTIVE',
        name: 'Automotive',
        description: 'Car parts, dealerships, repair',
    },
    {
        code: 'EDUCATION_TRAINING',
        name: 'Education & Training',
        description: 'Training centers, online courses',
    },
    {
        code: 'SERVICES',
        name: 'Professional Services',
        description: 'Agencies, consulting firms',
    },
    {
        code: 'ENTERTAINMENT_MEDIA',
        name: 'Entertainment & Media',
        description: 'Media houses, creative studios',
    },
    {
        code: 'SPORTS_FITNESS',
        name: 'Sports & Fitness',
        description: 'Gyms, sports equipment',
    },
    {
        code: 'CONSTRUCTION',
        name: 'Construction & Hardware',
        description: 'Building materials',
    },
    {
        code: 'LOGISTICS',
        name: 'Logistics & Transport',
        description: 'Delivery, courier services',
    },
    {
        code: 'DIGITAL_PRODUCTS',
        name: 'Digital Products',
        description: 'SaaS, digital downloads',
    },
    { code: 'OTHER', name: 'Other', description: 'Not listed above' },
];

const categories = {
    RETAIL: [
        { code: 'GENERAL_STORE', name: 'General Store' },
        { code: 'SUPERMARKET', name: 'Supermarket' },
        { code: 'MINI_MARKET', name: 'Mini Market' },
        { code: 'SPECIALTY_STORE', name: 'Specialty Store' },
        { code: 'ONLINE_RETAILER', name: 'Online Only Retailer' },
    ],
    FOOD_BEVERAGE: [
        { code: 'RESTAURANT', name: 'Restaurant' },
        { code: 'FAST_FOOD', name: 'Fast Food' },
        { code: 'CAFE', name: 'Cafe' },
        { code: 'BAKERY', name: 'Bakery' },
        { code: 'CATERING', name: 'Catering Service' },
        { code: 'FOOD_PROCESSING', name: 'Food Processing' },
    ],
    AGRICULTURE: [
        { code: 'CROP_FARMING', name: 'Crop Farming' },
        { code: 'LIVESTOCK', name: 'Livestock' },
        { code: 'AGRO_PROCESSING', name: 'Agro Processing' },
        { code: 'AGRI_SUPPLIES', name: 'Agricultural Supplies' },
    ],
    MANUFACTURING: [
        { code: 'TEXTILE_MANUFACTURING', name: 'Textile Manufacturing' },
        { code: 'FOOD_MANUFACTURING', name: 'Food Manufacturing' },
        { code: 'FURNITURE_MANUFACTURING', name: 'Furniture Manufacturing' },
        { code: 'METAL_WORKS', name: 'Metal Works' },
    ],
    WHOLESALE: [
        { code: 'BULK_DISTRIBUTOR', name: 'Bulk Distributor' },
        { code: 'IMPORT_EXPORT', name: 'Import & Export' },
        { code: 'SUPPLY_CHAIN', name: 'Supply Chain Provider' },
    ],
    HEALTHCARE: [
        { code: 'PHARMACY', name: 'Pharmacy' },
        { code: 'CLINIC', name: 'Clinic' },
        { code: 'MEDICAL_SUPPLIES', name: 'Medical Supplies' },
    ],
    BEAUTY_PERSONAL_CARE: [
        { code: 'SALON', name: 'Salon' },
        { code: 'COSMETICS_STORE', name: 'Cosmetics Store' },
        { code: 'SPA', name: 'Spa' },
        { code: 'BARBER_SHOP', name: 'Barber Shop' },
    ],
    FASHION_APPAREL: [
        { code: 'CLOTHING_STORE', name: 'Clothing Store' },
        { code: 'FOOTWEAR', name: 'Footwear' },
        { code: 'ACCESSORIES', name: 'Accessories' },
        { code: 'TAILORING', name: 'Tailoring' },
    ],
    ELECTRONICS_TECH: [
        { code: 'PHONE_SHOP', name: 'Phone Shop' },
        { code: 'COMPUTER_STORE', name: 'Computer Store' },
        { code: 'ACCESSORY_SHOP', name: 'Gadget Accessories' },
        { code: 'REPAIR_CENTER', name: 'Repair Center' },
    ],
    HOME_LIVING: [
        { code: 'FURNITURE_STORE', name: 'Furniture Store' },
        { code: 'HOME_DECOR', name: 'Home Decor' },
        { code: 'HARDWARE_STORE', name: 'Hardware Store' },
        { code: 'APPLIANCES', name: 'Appliances' },
    ],
    AUTOMOTIVE: [
        { code: 'CAR_DEALERSHIP', name: 'Car Dealership' },
        { code: 'AUTO_PARTS', name: 'Auto Parts' },
        { code: 'GARAGE', name: 'Garage / Repair' },
    ],
    EDUCATION_TRAINING: [
        { code: 'TRAINING_CENTER', name: 'Training Center' },
        { code: 'ONLINE_COURSES', name: 'Online Courses' },
        { code: 'BOOKSTORE', name: 'Bookstore' },
    ],
    SERVICES: [
        { code: 'MARKETING_AGENCY', name: 'Marketing Agency' },
        { code: 'SOFTWARE_AGENCY', name: 'Software Agency' },
        { code: 'CONSULTING', name: 'Consulting Firm' },
        { code: 'EVENT_PLANNING', name: 'Event Planning' },
    ],
    ENTERTAINMENT_MEDIA: [
        { code: 'MEDIA_HOUSE', name: 'Media House' },
        { code: 'PRODUCTION_STUDIO', name: 'Production Studio' },
        { code: 'STREAMING', name: 'Streaming Platform' },
    ],
    SPORTS_FITNESS: [
        { code: 'GYM', name: 'Gym' },
        { code: 'SPORTS_EQUIPMENT', name: 'Sports Equipment' },
        { code: 'FITNESS_COACH', name: 'Fitness Coaching' },
    ],
    CONSTRUCTION: [
        { code: 'BUILDING_MATERIALS', name: 'Building Materials' },
        { code: 'CONTRACTOR', name: 'Contractor' },
        { code: 'ARCHITECTURE', name: 'Architecture Firm' },
    ],
    LOGISTICS: [
        { code: 'COURIER_SERVICE', name: 'Courier Service' },
        { code: 'DELIVERY_SERVICE', name: 'Delivery Service' },
        { code: 'FREIGHT', name: 'Freight Service' },
    ],
    DIGITAL_PRODUCTS: [
        { code: 'SAAS', name: 'Software as a Service' },
        { code: 'DIGITAL_MARKETPLACE', name: 'Digital Marketplace' },
        { code: 'DOWNLOADABLE_PRODUCTS', name: 'Downloadable Products' },
    ],
    OTHER: [{ code: 'MISCELLANEOUS', name: 'Miscellaneous' }],
};


async function seedMarketplaceTaxonomy() {
    console.log('Seeding product categories & attribute defs...');

    const taxonomy = [
        {
            slug: 'fashion',
            nameEn: 'Fashion',
            nameRw: 'Imyenda',
            sortOrder: 1,
            attributes: [
                { key: 'material', labelEn: 'Material', labelRw: 'Ibikoresho', type: 'STRING' as const, appliesTo: 'PRODUCT' as const },
                { key: 'size', labelEn: 'Size', labelRw: 'Ingano', type: 'SELECT' as const, appliesTo: 'VARIANT' as const, options: ['XS', 'S', 'M', 'L', 'XL'] },
                { key: 'color', labelEn: 'Color', labelRw: 'Ibara', type: 'STRING' as const, appliesTo: 'VARIANT' as const },
            ],
        },
        {
            slug: 'electronics',
            nameEn: 'Electronics',
            nameRw: 'Ibikoresho by\'ikoranabuhanga',
            sortOrder: 2,
            attributes: [
                { key: 'brand', labelEn: 'Brand', labelRw: 'Ikirango', type: 'STRING' as const, appliesTo: 'PRODUCT' as const },
                { key: 'storage_gb', labelEn: 'Storage (GB)', labelRw: 'Ububiko (GB)', type: 'NUMBER' as const, appliesTo: 'VARIANT' as const },
                { key: 'warranty_months', labelEn: 'Warranty (months)', labelRw: 'Garanti (amezi)', type: 'NUMBER' as const, appliesTo: 'PRODUCT' as const },
            ],
        },
        {
            slug: 'groceries',
            nameEn: 'Groceries',
            nameRw: 'Ibiribwa',
            sortOrder: 3,
            attributes: [
                { key: 'weight', labelEn: 'Weight', labelRw: 'Uburemere', type: 'STRING' as const, appliesTo: 'VARIANT' as const },
                { key: 'organic', labelEn: 'Organic', labelRw: 'Kamere', type: 'BOOLEAN' as const, appliesTo: 'PRODUCT' as const },
            ],
        },
        {
            slug: 'general',
            nameEn: 'General',
            nameRw: 'Ibindi',
            sortOrder: 4,
            attributes: [
                { key: 'condition', labelEn: 'Condition', labelRw: 'Imiterere', type: 'SELECT' as const, appliesTo: 'PRODUCT' as const, options: ['New', 'Used'] },
            ],
        },
    ];

    const bySlug: Record<string, string> = {};

    for (const cat of taxonomy) {
        const row = await prisma.productCategory.upsert({
            where: { slug: cat.slug },
            update: {
                nameEn: cat.nameEn,
                nameRw: cat.nameRw,
                sortOrder: cat.sortOrder,
                isActive: true,
            },
            create: {
                slug: cat.slug,
                nameEn: cat.nameEn,
                nameRw: cat.nameRw,
                sortOrder: cat.sortOrder,
                isActive: true,
            },
        });
        bySlug[cat.slug] = row.id;

        await prisma.categoryAttributeDef.deleteMany({ where: { categoryId: row.id } });
        for (let i = 0; i < cat.attributes.length; i++) {
            const a = cat.attributes[i];
            await prisma.categoryAttributeDef.create({
                data: {
                    categoryId: row.id,
                    key: a.key,
                    labelEn: a.labelEn,
                    labelRw: a.labelRw,
                    type: a.type,
                    required: false,
                    options: 'options' in a ? a.options : undefined,
                    appliesTo: a.appliesTo,
                    sortOrder: i,
                },
            });
        }
        console.log(`  Category: ${cat.slug}`);
    }

    return bySlug;
}

async function seedDashboardData(categoryIds: Record<string, string> = {}) {
    console.log('Seeding dashboard data...');

    const existingStore = await prisma.store.findFirst({
        where: { status: 'APPROVED' },
    });

    if (!existingStore) {
        console.log('No approved store found. Skipping dashboard seed.');
        return;
    }

    console.log(`Using store: ${existingStore.displayName}`);

    const products = [
        {
            name: 'Premium Cotton T-Shirt',
            description: 'High-quality cotton t-shirt with modern fit',
            vendor: 'Fashion Co.',
            category: 'Clothing',
            categorySlug: 'fashion',
            attributes: { material: 'Cotton' },
            tags: ['fashion', 'casual', 'cotton'],
            images: ['/products/tshirt-1.jpg', '/products/tshirt-2.jpg'],
            primaryImage: '/products/tshirt-1.jpg',
            variants: [
                { color: 'Black', hex: '#000000', size: 'S', price: 15000, cost: 8000, stock: 50 },
                { color: 'Black', hex: '#000000', size: 'M', price: 15000, cost: 8000, stock: 75 },
                { color: 'Black', hex: '#000000', size: 'L', price: 15000, cost: 8000, stock: 60 },
                { color: 'White', hex: '#FFFFFF', size: 'S', price: 15000, cost: 8000, stock: 40 },
                { color: 'White', hex: '#FFFFFF', size: 'M', price: 15000, cost: 8000, stock: 80 },
                { color: 'White', hex: '#FFFFFF', size: 'L', price: 15000, cost: 8000, stock: 55 },
            ],
        },
        {
            name: 'Wireless Bluetooth Headphones',
            description: 'Premium sound quality with noise cancellation',
            vendor: 'Tech Supplies Ltd',
            category: 'Electronics',
            categorySlug: 'electronics',
            attributes: { brand: 'AudioMax', warranty_months: 12 },
            tags: ['audio', 'wireless', 'bluetooth'],
            images: ['/products/headphones-1.jpg'],
            primaryImage: '/products/headphones-1.jpg',
            variants: [
                { color: 'Black', hex: '#000000', size: null, price: 45000, cost: 25000, stock: 30 },
                { color: 'Silver', hex: '#C0C0C0', size: null, price: 45000, cost: 25000, stock: 25 },
            ],
        },
        {
            name: 'Organic Coffee Beans',
            description: 'Premium arabica coffee beans, freshly roasted',
            vendor: 'Rwanda Coffee Co.',
            category: 'Food & Beverage',
            categorySlug: 'groceries',
            attributes: { organic: true },
            tags: ['coffee', 'organic', 'premium'],
            images: ['/products/coffee-1.jpg'],
            primaryImage: '/products/coffee-1.jpg',
            variants: [
                { color: null, hex: null, size: '250g', price: 8000, cost: 4000, stock: 100 },
                { color: null, hex: null, size: '500g', price: 15000, cost: 7500, stock: 75 },
                { color: null, hex: null, size: '1kg', price: 28000, cost: 14000, stock: 50 },
            ],
        },
        {
            name: 'Leather Wallet',
            description: 'Genuine leather wallet with RFID protection',
            vendor: 'Leather Goods Inc',
            category: 'Accessories',
            categorySlug: 'fashion',
            attributes: { material: 'Leather' },
            tags: ['leather', 'wallet', 'accessories'],
            images: ['/products/wallet-1.jpg', '/products/wallet-2.jpg'],
            primaryImage: '/products/wallet-1.jpg',
            variants: [
                { color: 'Brown', hex: '#8B4513', size: null, price: 25000, cost: 12000, stock: 5 },
                { color: 'Black', hex: '#000000', size: null, price: 25000, cost: 12000, stock: 8 },
            ],
        },
        {
            name: 'Yoga Mat Pro',
            description: 'Non-slip premium yoga mat with carrying strap',
            vendor: 'Fitness World',
            category: 'Sports & Fitness',
            categorySlug: 'general',
            attributes: { condition: 'New' },
            tags: ['yoga', 'fitness', 'exercise'],
            images: ['/products/yoga-mat-1.jpg'],
            primaryImage: '/products/yoga-mat-1.jpg',
            variants: [
                { color: 'Purple', hex: '#800080', size: null, price: 18000, cost: 9000, stock: 0 },
                { color: 'Blue', hex: '#0000FF', size: null, price: 18000, cost: 9000, stock: 20 },
                { color: 'Pink', hex: '#FFC0CB', size: null, price: 18000, cost: 9000, stock: 15 },
            ],
        },
    ];

    const createdProducts = [];
    for (const productData of products) {
        const product = await prisma.product.create({
            data: {
                storeId: existingStore.id,
                name: productData.name,
                description: productData.description,
                vendor: productData.vendor,
                category: productData.category,
                categoryId: productData.categorySlug
                    ? categoryIds[productData.categorySlug]
                    : undefined,
                attributes: (productData as any).attributes ?? {},
                status: 'ACTIVE',
                tags: productData.tags,
                images: productData.images,
                primaryImage: productData.primaryImage,
                deliveryEnabled: true,
                deliveryLocation: 'Kigali',
                deliveryPrice: 2000,
                createdBy: existingStore.userId,
                updatedBy: existingStore.userId,
            },
        });

        console.log(`Created product: ${product.name}`);

        for (let i = 0; i < productData.variants.length; i++) {
            const variantData = productData.variants[i];
            const sku = `${product.name.substring(0, 3).toUpperCase()}-${i + 1}`;
            const title = [variantData.color, variantData.size].filter(Boolean).join(' / ');

            const variant = await prisma.productVariant.create({
                data: {
                    productId: product.id,
                    sku,
                    title: title || 'Default',
                    colorName: variantData.color,
                    colorHex: variantData.hex,
                    size: variantData.size,
                    price: variantData.price,
                    compareAt: variantData.price * 1.2,
                    cost: variantData.cost,
                },
            });

            const stockStatus =
                variantData.stock === 0
                    ? 'OUT_OF_STOCK'
                    : variantData.stock < 10
                      ? 'LOW_STOCK'
                      : 'IN_STOCK';

            await prisma.inventoryRecord.create({
                data: {
                    productVariantId: variant.id,
                    onHand: variantData.stock,
                    reserved: 0,
                    available: variantData.stock,
                    reorderPoint: 10,
                    status: stockStatus,
                    updatedBy: existingStore.userId,
                },
            });

            createdProducts.push({ product, variant, stock: variantData.stock });
        }
    }

    console.log('Creating sample orders...');

    const orderStatuses = [
        { payment: 'SUCCESS', fulfillment: 'FULFILLED' },
        { payment: 'SUCCESS', fulfillment: 'SHIPPED' },
        { payment: 'SUCCESS', fulfillment: 'PACKED' },
        { payment: 'PENDING', fulfillment: 'UNFULFILLED' },
        { payment: 'SUCCESS', fulfillment: 'FULFILLED' },
        { payment: 'SUCCESS', fulfillment: 'FULFILLED' },
        { payment: 'PENDING', fulfillment: 'UNFULFILLED' },
        { payment: 'SUCCESS', fulfillment: 'CANCELLED' },
        { payment: 'SUCCESS', fulfillment: 'FULFILLED' },
        { payment: 'SUCCESS', fulfillment: 'PACKED' },
    ];

    for (let i = 0; i < orderStatuses.length; i++) {
        const orderNumber = `#${1000 + i}`;
        const status = orderStatuses[i];
        const selectedVariants = createdProducts
            .filter((p) => p.stock > 0)
            .sort(() => 0.5 - Math.random())
            .slice(0, Math.floor(Math.random() * 3) + 1);

        const subtotal = selectedVariants.reduce(
            (sum, item) => sum + Number(item.variant.price) * 2,
            0,
        );
        const deliveryFee = 2000;
        const total = subtotal + deliveryFee;

        const order = await prisma.order.create({
            data: {
                storeId: existingStore.id,
                orderNumber,
                customerName: `Customer ${i + 1}`,
                customerPhone: `078${String(i).padStart(7, '0')}`,
                customerEmail: `customer${i + 1}@onlineshop.rw`,
                shippingAddress: JSON.stringify({
                    street: `KG ${i + 1} Ave`,
                    city: 'Kigali',
                    district: 'Gasabo',
                }),
                billingAddress: JSON.stringify({
                    street: `KG ${i + 1} Ave`,
                    city: 'Kigali',
                    district: 'Gasabo',
                }),
                subtotal,
                deliveryFee,
                discount: 0,
                tax: 0,
                total,
                customerNote: i % 3 === 0 ? 'Please deliver before 5 PM' : null,
                createdBy: existingStore.userId,
                placedAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
            },
        });

        for (const item of selectedVariants) {
            await prisma.orderLineItem.create({
                data: {
                    orderId: order.id,
                    productVariantId: item.variant.id,
                    productName: item.product.name,
                    sku: item.variant.sku,
                    quantity: 2,
                    unitPrice: item.variant.price,
                    total: Number(item.variant.price) * 2,
                },
            });
        }

        await prisma.orderPayment.create({
            data: {
                orderId: order.id,
                status: status.payment as any,
                method: i % 2 === 0 ? 'MOBILE_MONEY' : 'CASH_ON_DELIVERY',
                amount: total,
                reference: status.payment === 'SUCCESS' ? `PAY-${orderNumber}` : null,
                paidAt: status.payment === 'SUCCESS' ? new Date() : null,
            },
        });

        await prisma.orderFulfillment.create({
            data: {
                orderId: order.id,
                status: status.fulfillment as any,
                deliveryMethod: 'Standard Delivery',
                deliveryZoneId: null,
                packedBy: ['PACKED', 'SHIPPED', 'FULFILLED'].includes(status.fulfillment)
                    ? existingStore.userId
                    : null,
                deliveredBy: status.fulfillment === 'FULFILLED' ? 'Driver 1' : null,
                deliveredAt:
                    status.fulfillment === 'FULFILLED'
                        ? new Date(Date.now() - i * 12 * 60 * 60 * 1000)
                        : null,
            },
        });

        await prisma.orderEvent.create({
            data: {
                orderId: order.id,
                type: 'CREATED',
                title: 'Order Created',
                description: 'Order was successfully created',
                performedBy: existingStore.userId,
            },
        });

        if (status.payment === 'SUCCESS') {
            await prisma.orderEvent.create({
                data: {
                    orderId: order.id,
                    type: 'PAID',
                    title: 'Payment Confirmed',
                    description: 'Payment has been verified',
                    performedBy: existingStore.userId,
                },
            });
        }

        console.log(`Created order: ${orderNumber}`);
    }

    console.log('Creating analytics snapshots...');

    for (let i = 0; i < 7; i++) {
        const snapshotDate = new Date();
        snapshotDate.setDate(snapshotDate.getDate() - i);

        await prisma.dailyMetricsSnapshot.create({
            data: {
                storeId: existingStore.id,
                snapshotDate,
                totalSales: 10 + i * 2,
                totalRevenue: 500000 + i * 50000,
                totalCost: 250000 + i * 25000,
                totalProfit: 250000 + i * 25000,
                totalOrders: 10 + i * 2,
                pendingOrders: 2,
                completedOrders: 7 + i * 2,
                cancelledOrders: 1,
                activeProducts: 5,
                lowStockCount: 1,
                outOfStockCount: 1,
                totalCustomers: 50 + i * 5,
                newCustomers: 3 + i,
                activeCustomers: 20 + i * 2,
                totalStockValue: 2000000,
                totalStockQuantity: 500,
            },
        });
    }

    console.log('Dashboard data seeded successfully!');
}

async function seedDevMerchant() {
    if (process.env.NODE_ENV === 'production') {
        return;
    }

    const phoneNumber = process.env.SEED_DEV_MERCHANT_PHONE?.trim();
    const password = process.env.SEED_DEV_MERCHANT_PASSWORD;

    if (!phoneNumber || !password) {
        console.log(
            'Skipping dev merchant seed (set SEED_DEV_MERCHANT_PHONE and SEED_DEV_MERCHANT_PASSWORD to enable).'
        );
        return;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.upsert({
        where: { phoneNumber },
        update: {
            passwordHash,
            status: 'ACTIVE',
            role: 'STORE_OWNER',
        },
        create: {
            fullName: 'Dev Merchant',
            phoneNumber,
            passwordHash,
            role: 'STORE_OWNER',
            status: 'ACTIVE',
        },
    });

    const existingStore = await prisma.store.findFirst({
        where: { userId: user.id },
    });

    if (!existingStore) {
        const store = await prisma.store.create({
            data: {
                userId: user.id,
                slug: 'demo-kigali',
                status: 'APPROVED',
                approvedAt: new Date(),
                registeredName: 'Demo Kigali Retail Ltd',
                displayName: 'Demo Kigali Market',
                description: 'Seeded demo store for local marketplace development.',
                currency: 'RWF',
                contactEmail: 'demo@onlineshop.rw',
                contactPhone: phoneNumber,
                contactAddress: 'Kigali, Rwanda',
            },
        });
        await prisma.user.update({
            where: { id: user.id },
            data: { storeId: store.id },
        });
        console.log(
            `Dev merchant + APPROVED store seeded — phone: ${phoneNumber}, store: ${store.slug}`,
        );
    } else if (existingStore.status !== 'APPROVED') {
        await prisma.store.update({
            where: { id: existingStore.id },
            data: { status: 'APPROVED', approvedAt: new Date() },
        });
        console.log(
            `Dev merchant store approved — phone: ${phoneNumber}, store: ${existingStore.slug}`,
        );
    } else {
        console.log(`Dev merchant already exists (${phoneNumber})`);
    }
}


async function seedMarketplaceExtras(categoryIds: Record<string, string>) {
    console.log('Seeding sample reviews & promotions...');

    const store = await prisma.store.findFirst({
        where: { status: 'APPROVED' },
        include: {
            products: {
                where: { status: 'ACTIVE' },
                take: 5,
                orderBy: { createdAt: 'asc' },
            },
        },
    });

    if (!store || store.products.length === 0) {
        console.log('No store/products for marketplace extras.');
        return;
    }

    // approvedAt backfill
    if (!store.approvedAt) {
        await prisma.store.update({
            where: { id: store.id },
            data: { approvedAt: store.createdAt },
        });
    }

    let ratingSum = 0;
    let ratingCount = 0;

    for (let i = 0; i < Math.min(3, store.products.length); i++) {
        const product = store.products[i];
        const rating = 4 + (i % 2);
        const existing = await prisma.productReview.findFirst({
            where: { productId: product.id, title: 'Seeded review' },
        });
        if (existing) continue;

        await prisma.productReview.create({
            data: {
                productId: product.id,
                storeId: store.id,
                rating,
                title: 'Seeded review',
                body: 'Great product from marketplace seed.',
                status: 'APPROVED',
                moderatedAt: new Date(),
                moderatedBy: 'seed',
            },
        });

        await prisma.product.update({
            where: { id: product.id },
            data: {
                ratingAvg: rating,
                ratingCount: 1,
            },
        });
        ratingSum += rating;
        ratingCount += 1;
    }

    if (ratingCount > 0) {
        await prisma.store.update({
            where: { id: store.id },
            data: {
                ratingAvg: ratingSum / ratingCount,
                ratingCount,
            },
        });
    }

    const promoCode = 'WELCOME10';
    const existingPromo = await prisma.promotion.findFirst({
        where: { code: promoCode, storeId: store.id },
    });
    if (!existingPromo) {
        await prisma.promotion.create({
            data: {
                scope: 'STORE',
                storeId: store.id,
                code: promoCode,
                name: 'Welcome 10% off',
                type: 'PERCENT',
                value: 10,
                minOrderAmount: 5000,
                startsAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
                endsAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
                status: 'ACTIVE',
                targets: store.products[0]
                    ? {
                          create: [{ productId: store.products[0].id }],
                      }
                    : undefined,
            },
        });
        console.log(`  Store promo: ${promoCode}`);
    }

    const platformCode = 'MARKET5';
    const existingPlatform = await prisma.promotion.findFirst({
        where: { code: platformCode, storeId: null, scope: 'PLATFORM' },
    });
    if (!existingPlatform) {
        await prisma.promotion.create({
            data: {
                scope: 'PLATFORM',
                storeId: null,
                code: platformCode,
                name: 'Marketplace 5% off',
                type: 'PERCENT',
                value: 5,
                startsAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
                endsAt: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
                status: 'ACTIVE',
                targets: categoryIds.fashion
                    ? { create: [{ categoryId: categoryIds.fashion }] }
                    : undefined,
            },
        });
        console.log(`  Platform promo: ${platformCode}`);
    }

    console.log('Marketplace extras seeded.');
}

async function main() {
    console.log('Start seeding...');

    try {
        for (const industry of industries) {
            const sector = await prisma.industrySector.upsert({
                where: { code: industry.code },
                update: {
                    name: industry.name,
                    description: industry.description,
                },
                create: {
                    code: industry.code,
                    name: industry.name,
                    description: industry.description,
                },
            });

            console.log(`Upserted Industry Sector: ${sector.code}`);

            const industryCategories =
                categories[industry.code as keyof typeof categories];
            if (industryCategories) {
                for (const cat of industryCategories) {
                    await prisma.businessCategory.upsert({
                        where: { code: cat.code },
                        update: {
                            name: cat.name,
                            industrySectorId: sector.id,
                        },
                        create: {
                            code: cat.code,
                            name: cat.name,
                            industrySectorId: sector.id,
                        },
                    });
                    console.log(`  Upserted Category: ${cat.code}`);
                }
            }
        }

        const categoryIds = await seedMarketplaceTaxonomy();
        await seedDemoMarketplace(prisma, categoryIds);
        await seedDevMerchant();

        console.log('Seeding finished.');
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
