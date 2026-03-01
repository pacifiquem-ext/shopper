import { BadRequestException, Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../common/database/services/database.service';
import { UpdateDraftDto } from '../dtos/draft.dto';
import { SubmitStoreDto } from '../dtos/submit-store.dto';
import { StoreStatus } from '@prisma/client';

@Injectable()
export class OnboardingService {
    constructor(private readonly prisma: DatabaseService) {}

    async getDraft(userId: string) {
        let draft = await this.prisma.storeDraft.findUnique({
            where: { userId },
        });

        if (!draft) {
            draft = await this.prisma.storeDraft.create({
                data: {
                    userId,
                    draftData: {},
                    currentStep: 1,
                    completionPercentage: 0,
                },
            });
        }

        return draft;
    }

    async updateDraft(userId: string, updateDraftDto: UpdateDraftDto) {
        return this.prisma.storeDraft.upsert({
            where: { userId },
            update: {
                draftData: updateDraftDto.draftData,
                currentStep: updateDraftDto.currentStep,
                completionPercentage: updateDraftDto.completionPercentage,
            },
            create: {
                userId,
                draftData: updateDraftDto.draftData,
                currentStep: updateDraftDto.currentStep,
                completionPercentage: updateDraftDto.completionPercentage,
            },
        });
    }

    async checkSubdomainAvailability(subdomain: string) {
        const subdomainRegex = /^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$/;
        if (!subdomainRegex.test(subdomain)) {
            throw new BadRequestException('Invalid subdomain format');
        }

        const reservedKeywords = [
            'www',
            'api',
            'admin',
            'auth',
            'mail',
            'ftp',
            'shop',
            'store',
            'checkout',
            'dashboard',
            'support',
            'help',
            'blog',
            'app',
            'docs',
            'dev',
            'staging',
            'test',
            'static',
            'cdn',
            'media',
            'login',
            'register',
            'signup',
            'secure',
            'billing',
            'pay',
        ];

        if (reservedKeywords.includes(subdomain.toLowerCase())) {
            return { available: false, message: 'Subdomain is reserved' };
        }

        const existingStore = await this.prisma.store.findUnique({
            where: { subdomain },
        });

        if (existingStore) {
            return { available: false, message: 'Subdomain is already taken' };
        }

        return { available: true, message: 'Subdomain is available' };
    }

    async submitStore(userId: string, dto: SubmitStoreDto) {
        const subdomainCheck = await this.checkSubdomainAvailability(
            dto.subdomain
        );
        if (!subdomainCheck.available) {
            throw new BadRequestException(subdomainCheck.message);
        }

        const category = await this.prisma.businessCategory.findUnique({
            where: { id: dto.businessCategoryId },
        });

        if (!category || category.industrySectorId !== dto.industrySectorId) {
            throw new BadRequestException(
                'Invalid business category or mismatched industry sector'
            );
        }

        return this.prisma.$transaction(async tx => {
            const store = await tx.store.create({
                data: {
                    userId,
                    subdomain: dto.subdomain,
                    registeredName: dto.registeredName,
                    displayName: dto.displayName,
                    description: dto.description,
                    status: StoreStatus.SUBMITTED,
                },
            });

            const businessAddress = await tx.address.create({
                data: {
                    province: dto.businessAddress.province,
                    district: dto.businessAddress.district,
                    sector: dto.businessAddress.sector,
                    physicalAddress: dto.businessAddress.physicalAddress,
                    googleMapsUrl: dto.businessAddress.googleMapsUrl,
                },
            });

            let warehouseAddressId = null;
            if (dto.warehouseAddress) {
                const whAddress = await tx.address.create({
                    data: {
                        province: dto.warehouseAddress.province,
                        district: dto.warehouseAddress.district,
                        sector: dto.warehouseAddress.sector,
                        physicalAddress: dto.warehouseAddress.physicalAddress,
                        googleMapsUrl: dto.warehouseAddress.googleMapsUrl,
                    },
                });
                warehouseAddressId = whAddress.id;
            }

            const storeKyc = await tx.storeKyc.create({
                data: {
                    storeId: store.id,
                    industrySectorId: dto.industrySectorId,
                    businessCategoryId: dto.businessCategoryId,
                    country: dto.country,
                    ownerFullName: dto.ownerFullName,
                    ownerDob: dto.ownerDob,
                    ownerNationality: dto.ownerNationality,
                    ownerEmail: dto.ownerEmail,
                    ownerPhoneNumber: dto.ownerPhoneNumber,
                },
            });

            await tx.address.update({
                where: { id: businessAddress.id },
                data: { businessKycId: storeKyc.id },
            });

            if (warehouseAddressId) {
                await tx.address.update({
                    where: { id: warehouseAddressId },
                    data: { warehouseKycId: storeKyc.id },
                });
            }

            await tx.storeDraft.deleteMany({
                where: { userId },
            });

            return store;
        });
    }
}
