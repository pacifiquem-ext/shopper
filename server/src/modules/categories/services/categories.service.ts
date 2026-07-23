import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import {
    AttributeAppliesTo,
    AttributeFieldType,
    ProductStatus,
} from '@prisma/client';
import { DatabaseService } from '../../../common/database/services/database.service';
import {
    CreateCategoryAttributeDefDto,
    CreateProductCategoryDto,
    UpdateProductCategoryDto,
} from '../dtos/category.dto';

@Injectable()
export class CategoriesService {
    constructor(private readonly prisma: DatabaseService) {}

    async listPublic() {
        return this.prisma.productCategory.findMany({
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' },
            include: {
                attributeDefs: { orderBy: { sortOrder: 'asc' } },
                _count: {
                    select: {
                        products: {
                            where: { status: ProductStatus.ACTIVE },
                        },
                    },
                },
            },
        });
    }

    async listAdmin() {
        return this.prisma.productCategory.findMany({
            orderBy: { sortOrder: 'asc' },
            include: {
                attributeDefs: { orderBy: { sortOrder: 'asc' } },
                _count: { select: { products: true } },
            },
        });
    }

    async create(dto: CreateProductCategoryDto) {
        const existing = await this.prisma.productCategory.findUnique({
            where: { slug: dto.slug },
        });
        if (existing) {
            throw new BadRequestException('Category slug already exists');
        }

        return this.prisma.productCategory.create({
            data: {
                slug: dto.slug,
                nameEn: dto.nameEn,
                nameRw: dto.nameRw,
                sortOrder: dto.sortOrder ?? 0,
                isActive: dto.isActive ?? true,
                attributeDefs: dto.attributeDefs?.length
                    ? {
                          create: dto.attributeDefs.map((a, i) =>
                              this.mapAttr(a, i),
                          ),
                      }
                    : undefined,
            },
            include: { attributeDefs: true },
        });
    }

    async update(id: string, dto: UpdateProductCategoryDto) {
        const category = await this.prisma.productCategory.findUnique({
            where: { id },
        });
        if (!category) {
            throw new NotFoundException('Category not found');
        }

        if (dto.slug && dto.slug !== category.slug) {
            const clash = await this.prisma.productCategory.findUnique({
                where: { slug: dto.slug },
            });
            if (clash) {
                throw new BadRequestException('Category slug already exists');
            }
        }

        return this.prisma.$transaction(async (tx) => {
            if (dto.attributeDefs) {
                await tx.categoryAttributeDef.deleteMany({
                    where: { categoryId: id },
                });
                if (dto.attributeDefs.length > 0) {
                    await tx.categoryAttributeDef.createMany({
                        data: dto.attributeDefs.map((a, i) => ({
                            categoryId: id,
                            ...this.mapAttr(a, i),
                        })),
                    });
                }
            }

            return tx.productCategory.update({
                where: { id },
                data: {
                    slug: dto.slug,
                    nameEn: dto.nameEn,
                    nameRw: dto.nameRw,
                    sortOrder: dto.sortOrder,
                    isActive: dto.isActive,
                },
                include: {
                    attributeDefs: { orderBy: { sortOrder: 'asc' } },
                },
            });
        });
    }

    async remove(id: string) {
        const category = await this.prisma.productCategory.findUnique({
            where: { id },
        });
        if (!category) {
            throw new NotFoundException('Category not found');
        }
        await this.prisma.productCategory.delete({ where: { id } });
        return { deleted: true };
    }

    private mapAttr(a: CreateCategoryAttributeDefDto, index: number) {
        return {
            key: a.key,
            labelEn: a.labelEn,
            labelRw: a.labelRw,
            type: a.type as AttributeFieldType,
            required: a.required ?? false,
            options: a.options as object | undefined,
            appliesTo: (a.appliesTo as AttributeAppliesTo) ?? AttributeAppliesTo.PRODUCT,
            sortOrder: a.sortOrder ?? index,
        };
    }
}
