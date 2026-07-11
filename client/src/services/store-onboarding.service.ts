import { api } from '@/lib/axios'
import type { ApiResponse } from '@onlineshop/shared'
import { getPublicApiBaseUrl } from '@/lib/api-base-url'

export interface UpdateDraftDto {
  draftData: Record<string, any>
  currentStep: number
  completionPercentage: number
}

// Ensure this matches the backend SubmitStoreDto
export interface DeliveryZoneDto {
  name: string
  feeRwf: number
  etaMinutes: number
}

export interface SubmitStoreDto {
  subdomain: string
  registeredName: string
  displayName: string
  description?: string
  brandPrimaryColor?: string
  brandSecondaryColor?: string
  logoDataUrl?: string
  aboutUs?: string
  contactEmail?: string
  contactPhone?: string
  contactAddress?: string
  deliveryZones?: DeliveryZoneDto[]
  industrySectorId: string
  businessCategoryId: string
  country: string
  ownerFullName: string
  ownerNationality: string
  ownerEmail: string
  ownerPhoneNumber: string
  businessAddress: {
    province: string
    district: string
    sector: string
    physicalAddress: string
    googleMapsUrl?: string
  }
}

export const storeOnboardingService = {
  async getDraft(): Promise<ApiResponse<any>> {
    return (await api.get('/onboarding/draft')) as ApiResponse<any>
  },

  async updateDraft(data: UpdateDraftDto): Promise<ApiResponse<any>> {
    return (await api.put('/onboarding/draft', data)) as ApiResponse<any>
  },

  async submitStore(data: SubmitStoreDto): Promise<ApiResponse<any>> {
    return (await api.put('/onboarding/submit', data)) as ApiResponse<any>
  },

  async checkSubdomain(
    subdomain: string,
  ): Promise<ApiResponse<{ available: boolean; message: string }>> {
    const base = (getPublicApiBaseUrl()).replace(
      /\/+$/,
      '',
    )
    const url = `${base}/onboarding/check-subdomain?subdomain=${encodeURIComponent(subdomain)}`
    const res = await fetch(url, { headers: { Accept: 'application/json' } })

    if (!res.ok) {
      throw new Error(`Subdomain check failed (${res.status})`)
    }

    const body = (await res.json()) as ApiResponse<{ available: boolean; message: string }>
    return (body.data ? body : { ...body, data: body }) as ApiResponse<{
      available: boolean
      message: string
    }>
  },
}
