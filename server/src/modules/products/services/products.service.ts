import { Injectable } from '@nestjs/common';
import { ProductsRepository } from '../repositories/products.repository';
import { ProductVariantsRepository } from '../repositories/product-variants.repository';
import { DatabaseService } from '../../../common/database/services/database.service';
import { CreateProductDto } from '../dtos/create-product.dto';
import { UpdateProductDto } from '../dtos/update-product.dto';
import { ProductFilterDto } from '../dtos/product-filter.dto';
import {
    ProductNotFoundException,
    UnauthorizedStoreAccessException,
} from '../../../common/exceptions/domain.exception';
import { ProductStatus, StockStatus } from '../../../common/constants/status.constants';
import { ProductStatus as PrismaProductStatus, StockStatus as PrismaStockStatus } from '@prisma/client';

@Injectable()
export class ProductsService {
    constructor(
        private readonly productsRepository: ProductsRepository,
        private readonly productVariantsRepository: ProductVariantsRepository,
        private readonly prisma: DatabaseService,
    ) {}

    async create(storeId: string, userId: string, dto: CreateProductDto) {
        const product = await this.productsRepository.create({
            name: dto.name,
            description: dto.description,
            vendor: dto.vendor,
            category: dto.category,
            status: (dto.status || ProductStatus.DRAFT) as PrismaProductStatus,
            tags: dto.tags || [],
            images: dto.images || [],
            primaryImage: dto.primaryImage,
            deliveryEnabled: dto.deliveryEnabled ?? true,
            deliveryLocation: dto.deliveryLocation,
            deliveryPrice: dto.deliveryPrice,
            createdBy: userId,
            updatedBy: userId,
            store: {
                connect: { id: storeId },
            },
        });

        for (let i = 0; i < dto.variants.length; i++) {
            const variantData = dto.variants[i];
            const sku = this.generateSku(dto.name, i);
            const title = this.generateVariantTitle(variantData);

            const variant = await this.productVariantsRepository.create({
                sku,
                title,
                colorName: variantData.colorName,
                colorHex: variantData.colorHex,
                size: variantData.size,
                model: variantData.model,
                price: variantData.price,
                compareAt: variantData.compareAt,
                cost: variantData.cost,
                product: {
                    connect: { id: product.id },
                },
            });

            const stockStatus = this.calculateStockStatus(variantData.stock, 10);

            await this.prisma.inventoryRecord.create({
                data: {
                    productVariantId: variant.id,
                    onHand: variantData.stock,
                    reserved: 0,
                    available: variantData.stock,
                    reorderPoint: 10,
                    status: stockStatus as PrismaStockStatus,
                    updatedBy: userId,
                },
            });

            await this.prisma.inventoryEvent.create({
                data: {
                    inventoryRecordId: variant.id,
                    type: 'CREATED',
                    quantity: variantData.stock,
                    reason: 'Initial stock',
                    performedBy: userId,
                },
            });
        }

        return this.findById(product.id, storeId);
    }

    async findAll(storeId: string, filters: ProductFilterDto) {
        const { page = 1, limit = 10, status, category, vendor, search } = filters;
        const skip = (page - 1) * limit;

        const where: any = {};

        if (status) {
            where.status = status;
        }

        if (category) {
            where.category = category;
        }

        if (vendor) {
            where.vendor = vendor;
        }

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
                { vendor: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [products, total] = await Promise.all([
            this.productsRepository.findMany(storeId, {
                skip,
                take: limit,
                where,
                orderBy: { createdAt: 'desc' },
            }),
            this.productsRepository.count(storeId, where),
        ]);

        return {
            data: products,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    async findById(id: string, storeId: string) {
        const product = await this.productsRepository.findById(id, storeId);

        if (!product) {
            throw new ProductNotFoundException(id);
        }

        return product;
    }

    async update(id: string, storeId: string, userId: string, dto: UpdateProductDto) {
        const product = await this.findById(id, storeId);

        if (!product) {
            throw new ProductNotFoundException(id);
        }

        const updateData: any = { ...dto, updatedBy: userId };
        if (dto.status) {
            updateData.status = dto.status as PrismaProductStatus;
        }

        await this.productsRepository.update(id, storeId, updateData);

        return this.findById(id, storeId);
    }

    async delete(id: string, storeId: string) {
        const product = await this.findById(id, storeId);

        if (!product) {
            throw new ProductNotFoundException(id);
        }

        await this.productsRepository.delete(id, storeId);

        return { message: 'Product deleted successfully' };
    }

    async getAnalytics(id: string, storeId: string) {
        const product = await this.findById(id, storeId);

        if (!product) {
            throw new ProductNotFoundException(id);
        }

        const variantIds = product.variants.map((v) => v.id);

        const orderLineItems = await this.prisma.orderLineItem.findMany({
            where: {
                productVariantId: { in: variantIds },
            },
            include: {
                order: true,
            },
        });

        const totalRevenue = orderLineItems.reduce(
            (sum, item) => sum + Number(item.total),
            0,
        );

        const totalUnitsSold = orderLineItems.reduce(
            (sum, item) => sum + item.quantity,
            0,
        );

        const totalOrders = new Set(orderLineItems.map((item) => item.orderId)).size;

        return {
            productId: id,
            totalRevenue,
            totalUnitsSold,
            totalOrders,
            averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
        };
    }

    private generateSku(productName: string, index: number): string {
        const prefix = productName
            .substring(0, 3)
            .toUpperCase()
            .replace(/[^A-Z]/g, '');
        const timestamp = Date.now().toString().slice(-6);
        return `${prefix}-${timestamp}-${index + 1}`;
    }

    private generateVariantTitle(variant: any): string {
        const parts = [variant.colorName, variant.size, variant.model].filter(Boolean);
        return parts.length > 0 ? parts.join(' / ') : 'Default';
    }

    private calculateStockStatus(stock: number, reorderPoint: number): string {
        if (stock === 0) return StockStatus.OUT_OF_STOCK;
        if (stock < reorderPoint) return StockStatus.LOW_STOCK;
        return StockStatus.IN_STOCK;
    }
}
