import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../common/database/services/database.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProductsRepository {
    constructor(private readonly prisma: DatabaseService) {}

    async create(data: Prisma.ProductCreateInput) {
        return this.prisma.product.create({ data });
    }

    async findById(id: string, storeId: string) {
        return this.prisma.product.findFirst({
            where: { id, storeId },
            include: {
                variants: {
                    include: {
                        inventory: true,
                    },
                },
            },
        });
    }

    async findMany(storeId: string, params: {
        skip?: number;
        take?: number;
        where?: Prisma.ProductWhereInput;
        orderBy?: Prisma.ProductOrderByWithRelationInput;
    }) {
        const { skip, take, where, orderBy } = params;
        
        return this.prisma.product.findMany({
            skip,
            take,
            where: {
                ...where,
                storeId,
            },
            orderBy,
            include: {
                variants: {
                    include: {
                        inventory: true,
                    },
                },
            },
        });
    }

    async count(storeId: string, where?: Prisma.ProductWhereInput) {
        return this.prisma.product.count({
            where: {
                ...where,
                storeId,
            },
        });
    }

    async update(id: string, storeId: string, data: Prisma.ProductUpdateInput) {
        return this.prisma.product.updateMany({
            where: { id, storeId },
            data,
        });
    }

    async delete(id: string, storeId: string) {
        return this.prisma.product.deleteMany({
            where: { id, storeId },
        });
    }

    async findByCategory(storeId: string, category: string) {
        return this.prisma.product.findMany({
            where: {
                storeId,
                category,
                status: 'ACTIVE',
            },
        });
    }

    async findByVendor(storeId: string, vendor: string) {
        return this.prisma.product.findMany({
            where: {
                storeId,
                vendor,
                status: 'ACTIVE',
            },
        });
    }
}
