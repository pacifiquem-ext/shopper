import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../common/database/services/database.service';

@Injectable()
export class ReferencesService {
    constructor(private readonly prisma: DatabaseService) {}

    async getIndustries() {
        return this.prisma.industrySector.findMany({
            orderBy: { name: 'asc' },
            select: {
                id: true,
                code: true,
                name: true,
                description: true,
            },
        });
    }

    async getCategories(industrySectorId?: string) {
        const whereClause = industrySectorId ? { industrySectorId } : {};
        return this.prisma.businessCategory.findMany({
            where: whereClause,
            orderBy: { name: 'asc' },
            select: {
                id: true,
                code: true,
                name: true,
                industrySectorId: true,
            },
        });
    }
}
