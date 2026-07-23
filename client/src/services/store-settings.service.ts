import { api } from '@/lib/axios'
import type { ApiResponse } from '@onlineshop/shared'
import type { BrandColors } from '@/lib/store-templates'

export type BrandColorsApi = BrandColors

export interface BusinessAddressApi {
  province: string
  district: string
  sector: string
  physicalAddress: string
  googleMapsUrl?: string | null
}

export interface StoreKycApi {
  ownerFullName: string
  ownerNationality: string
  ownerEmail: string
  ownerPhoneNumber: string
  country: string
  industrySector: { id: string; name: string }
  businessCategory: { id: string; name: string }
  businessAddress: BusinessAddressApi | null
}

export interface StoreSettingsApi {
  id: string
  subdomain: string
  slug?: string
  registeredName: string
  displayName: string
  description: string | null
  logoUrl: string | null
  brandColors: BrandColorsApi | null
  aboutUs: string | null
  contactEmail: string | null
  contactPhone: string | null
  contactAddress: string | null
  returnPolicy: string | null
  privacyPolicy: string | null
  termsAndConditions: string | null
  kyc: StoreKycApi | null
}

export interface UpdateStoreSettingsPayload {
  displayName?: string
  description?: string
  logoUrl?: string
  brandColors?: BrandColorsApi
  aboutUs?: string
  contactEmail?: string
  contactPhone?: string
  contactAddress?: string
  returnPolicy?: string
  privacyPolicy?: string
  termsAndConditions?: string
  ownerFullName?: string
  ownerEmail?: string
  ownerPhoneNumber?: string
}

export const storeSettingsService = {
  async getSettings(): Promise<ApiResponse<StoreSettingsApi>> {
    return (await api.get('/store/settings')) as ApiResponse<StoreSettingsApi>
  },

  async updateSettings(dto: UpdateStoreSettingsPayload): Promise<ApiResponse<StoreSettingsApi>> {
    return (await api.put('/store/settings', dto)) as ApiResponse<StoreSettingsApi>
  },
}
