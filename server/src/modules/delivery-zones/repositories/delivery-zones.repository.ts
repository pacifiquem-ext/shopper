import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../common/database/services/database.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class DeliveryZonesRepository {
    constructor(private readonly prisma: DatabaseService) {}

    async findAll(storeId: string) {
        return this.prisma.deliveryZone.findMany({
            where: { storeId },
            orderBy: { createdAt: 'asc' },
        });
    }

    async findById(id: string, storeId: string) {
        return this.prisma.deliveryZone.findFirst({ where: { id, storeId } });
    }

    async create(data: Prisma.DeliveryZoneCreateInput) {
        return this.prisma.deliveryZone.create({ data });
    }

    async update(id: string, storeId: string, data: Prisma.DeliveryZoneUpdateInput) {
        return this.prisma.deliveryZone.updateMany({ where: { id, storeId }, data });
    }

    async delete(id: string, storeId: string) {
        return this.prisma.deliveryZone.deleteMany({ where: { id, storeId } });
    }
}
