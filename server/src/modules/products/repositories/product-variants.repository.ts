import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../common/database/services/database.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProductVariantsRepository {
    constructor(private readonly prisma: DatabaseService) {}

    async create(data: Prisma.ProductVariantCreateInput) {
        return this.prisma.productVariant.create({ data });
    }

    async createMany(data: Prisma.ProductVariantCreateManyInput[]) {
        return this.prisma.productVariant.createMany({
            data,
            skipDuplicates: true,
        });
    }

    async findById(id: string) {
        return this.prisma.productVariant.findUnique({
            where: { id },
            include: {
                product: true,
                inventory: true,
            },
        });
    }

    async findBySku(sku: string) {
        return this.prisma.productVariant.findUnique({
            where: { sku },
            include: {
                product: true,
                inventory: true,
            },
        });
    }

    async findByProductId(productId: string) {
        return this.prisma.productVariant.findMany({
            where: { productId },
            include: {
                inventory: true,
            },
        });
    }

    async update(id: string, data: Prisma.ProductVariantUpdateInput) {
        return this.prisma.productVariant.update({
            where: { id },
            data,
        });
    }

    async delete(id: string) {
        return this.prisma.productVariant.delete({
            where: { id },
        });
    }

    async deleteByProductId(productId: string) {
        return this.prisma.productVariant.deleteMany({
            where: { productId },
        });
    }
}
