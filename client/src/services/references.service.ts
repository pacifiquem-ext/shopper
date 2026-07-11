import { api } from '@/lib/axios'
import type { ApiResponse } from '@onlineshop/shared'

export interface IndustrySector {
  id: string
  name: string
  description: string
  isActive?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface BusinessCategory {
  id: string
  industrySectorId: string
  name: string
  description: string
  isActive?: boolean
  createdAt?: string
  updatedAt?: string
}

export const referencesService = {
  async getIndustries(): Promise<ApiResponse<IndustrySector[]>> {
    return (await api.get('/references/industries')) as ApiResponse<IndustrySector[]>
  },

  async getCategories(industrySectorId?: string): Promise<ApiResponse<BusinessCategory[]>> {
    const params = new URLSearchParams()
    if (industrySectorId) {
      params.append('industrySectorId', industrySectorId)
    }
    const query = params.toString() ? `?${params.toString()}` : ''

    return (await api.get(`/references/categories${query}`)) as ApiResponse<BusinessCategory[]>
  },
}
