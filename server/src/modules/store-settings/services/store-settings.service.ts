import { Injectable } from '@nestjs/common';
import { StoreSettingsRepository } from '../repositories/store-settings.repository';
import { UpdateStoreSettingsDto } from '../dtos/update-store-settings.dto';

@Injectable()
export class StoreSettingsService {
    constructor(private readonly storeSettingsRepository: StoreSettingsRepository) {}

    async getSettings(storeId: string) {
        return this.storeSettingsRepository.findByStoreId(storeId);
    }

    async updateSettings(storeId: string, dto: UpdateStoreSettingsDto) {
        const storeFields: Record<string, any> = {};
        const kycFields: Record<string, any> = {};

        if (dto.displayName !== undefined) storeFields.displayName = dto.displayName;
        if (dto.description !== undefined) storeFields.description = dto.description;
        if (dto.logoUrl !== undefined) storeFields.logoUrl = dto.logoUrl;
        if (dto.brandColors !== undefined) storeFields.brandColors = dto.brandColors;
        if (dto.aboutUs !== undefined) storeFields.aboutUs = dto.aboutUs;
        if (dto.contactEmail !== undefined) storeFields.contactEmail = dto.contactEmail;
        if (dto.contactPhone !== undefined) storeFields.contactPhone = dto.contactPhone;
        if (dto.contactAddress !== undefined) storeFields.contactAddress = dto.contactAddress;
        if (dto.returnPolicy !== undefined) storeFields.returnPolicy = dto.returnPolicy;
        if (dto.privacyPolicy !== undefined) storeFields.privacyPolicy = dto.privacyPolicy;
        if (dto.termsAndConditions !== undefined) storeFields.termsAndConditions = dto.termsAndConditions;

        if (dto.ownerFullName !== undefined) kycFields.ownerFullName = dto.ownerFullName;
        if (dto.ownerEmail !== undefined) kycFields.ownerEmail = dto.ownerEmail;
        if (dto.ownerPhoneNumber !== undefined) kycFields.ownerPhoneNumber = dto.ownerPhoneNumber;

        const [store] = await Promise.all([
            Object.keys(storeFields).length > 0
                ? this.storeSettingsRepository.updateStore(storeId, storeFields)
                : this.storeSettingsRepository.findByStoreId(storeId),
            Object.keys(kycFields).length > 0
                ? this.storeSettingsRepository.updateKyc(storeId, kycFields)
                : Promise.resolve(),
        ]);

        return store;
    }
}
