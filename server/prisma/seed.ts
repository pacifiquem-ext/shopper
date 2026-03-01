import { PrismaClient } from '@prisma/client';

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

async function main() {
    console.log('Start seeding...');

    try {
        for (const industry of industries) {
            // Upsert industry sector
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

            // Process Categories for this Industry
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
        console.log('Seeding finished.');
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
