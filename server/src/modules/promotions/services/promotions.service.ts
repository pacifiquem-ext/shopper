import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import {
    PromotionScope,
    PromotionStatus,
    PromotionType,
} from '@prisma/client';
import { DatabaseService } from '../../../common/database/services/database.service';
import { CreatePromotionDto, UpdatePromotionDto } from '../dtos/promotion.dto';

@Injectable()
export class PromotionsService {
    constructor(private readonly prisma: DatabaseService) {}

    async listForStore(storeId: string) {
        return this.prisma.promotion.findMany({
            where: { storeId, scope: PromotionScope.STORE },
            orderBy: { createdAt: 'desc' },
            include: {
                targets: true,
                _count: { select: { redemptions: true } },
            },
        });
    }

    async listPlatform() {
        return this.prisma.promotion.findMany({
            where: { scope: PromotionScope.PLATFORM },
            orderBy: { createdAt: 'desc' },
            include: {
                targets: true,
                _count: { select: { redemptions: true } },
            },
        });
    }

    async createStorePromotion(storeId: string, dto: CreatePromotionDto) {
        return this.createPromotion(PromotionScope.STORE, storeId, dto);
    }

    async createPlatformPromotion(dto: CreatePromotionDto) {
        return this.createPromotion(PromotionScope.PLATFORM, null, dto);
    }

    async updateStorePromotion(
        storeId: string,
        id: string,
        dto: UpdatePromotionDto,
    ) {
        const promo = await this.requirePromotion(id, {
            storeId,
            scope: PromotionScope.STORE,
        });
        return this.applyUpdate(promo.id, dto);
    }

    async updatePlatformPromotion(id: string, dto: UpdatePromotionDto) {
        const promo = await this.requirePromotion(id, {
            scope: PromotionScope.PLATFORM,
        });
        return this.applyUpdate(promo.id, dto);
    }

    async deleteStorePromotion(storeId: string, id: string) {
        await this.requirePromotion(id, {
            storeId,
            scope: PromotionScope.STORE,
        });
        await this.prisma.promotion.delete({ where: { id } });
        return { deleted: true };
    }

    async deletePlatformPromotion(id: string) {
        await this.requirePromotion(id, { scope: PromotionScope.PLATFORM });
        await this.prisma.promotion.delete({ where: { id } });
        return { deleted: true };
    }

    private async createPromotion(
        scope: PromotionScope,
        storeId: string | null,
        dto: CreatePromotionDto,
    ) {
        const code = dto.code.trim().toUpperCase();
        const existing = await this.prisma.promotion.findFirst({
            where: {
                code: { equals: code, mode: 'insensitive' },
                storeId: storeId,
            },
        });
        if (existing) {
            throw new BadRequestException('Promotion code already exists');
        }

        if (dto.type === PromotionType.PERCENT && Number(dto.value) > 100) {
            throw new BadRequestException('Percent value cannot exceed 100');
        }

        return this.prisma.promotion.create({
            data: {
                scope,
                storeId,
                code,
                name: dto.name,
                type: dto.type as PromotionType,
                value: dto.value,
                minOrderAmount: dto.minOrderAmount,
                maxRedemptions: dto.maxRedemptions,
                perUserLimit: dto.perUserLimit,
                startsAt: new Date(dto.startsAt),
                endsAt: dto.endsAt ? new Date(dto.endsAt) : null,
                status: (dto.status as PromotionStatus) ?? PromotionStatus.ACTIVE,
                targets: dto.targets?.length
                    ? {
                          create: dto.targets.map((t) => ({
                              productId: t.productId,
                              categoryId: t.categoryId,
                          })),
                      }
                    : undefined,
            },
            include: { targets: true },
        });
    }

    private async applyUpdate(id: string, dto: UpdatePromotionDto) {
        if (dto.type === PromotionType.PERCENT && dto.value != null && dto.value > 100) {
            throw new BadRequestException('Percent value cannot exceed 100');
        }

        return this.prisma.$transaction(async (tx) => {
            if (dto.targets) {
                await tx.promotionTarget.deleteMany({
                    where: { promotionId: id },
                });
                if (dto.targets.length > 0) {
                    await tx.promotionTarget.createMany({
                        data: dto.targets.map((t) => ({
                            promotionId: id,
                            productId: t.productId,
                            categoryId: t.categoryId,
                        })),
                    });
                }
            }

            return tx.promotion.update({
                where: { id },
                data: {
                    code: dto.code?.trim().toUpperCase(),
                    name: dto.name,
                    type: dto.type as PromotionType | undefined,
                    value: dto.value,
                    minOrderAmount: dto.minOrderAmount,
                    maxRedemptions: dto.maxRedemptions,
                    perUserLimit: dto.perUserLimit,
                    startsAt: dto.startsAt ? new Date(dto.startsAt) : undefined,
                    endsAt:
                        dto.endsAt === undefined
                            ? undefined
                            : dto.endsAt
                              ? new Date(dto.endsAt)
                              : null,
                    status: dto.status as PromotionStatus | undefined,
                },
                include: { targets: true },
            });
        });
    }

    private async requirePromotion(
        id: string,
        where: { storeId?: string; scope: PromotionScope },
    ) {
        const promo = await this.prisma.promotion.findFirst({
            where: { id, ...where },
        });
        if (!promo) {
            throw new NotFoundException('Promotion not found');
        }
        return promo;
    }
}
