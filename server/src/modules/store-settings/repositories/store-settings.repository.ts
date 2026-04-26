import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../common/database/services/database.service';

@Injectable()
export class StoreSettingsRepository {
    constructor(private readonly prisma: DatabaseService) {}

    async findByStoreId(storeId: string) {
        return this.prisma.store.findUnique({
            where: { id: storeId },
            include: {
                kyc: {
                    include: {
                        businessAddress: true,
                        industrySector: true,
                        businessCategory: true,
                    },
                },
            },
        });
    }

    async updateStore(storeId: string, data: Record<string, any>) {
        return this.prisma.store.update({
            where: { id: storeId },
            data,
            include: {
                kyc: {
                    include: {
                        businessAddress: true,
                    },
                },
            },
        });
    }

    async updateKyc(storeId: string, data: Record<string, any>) {
        return this.prisma.storeKyc.update({
            where: { storeId },
            data,
        });
    }
}
