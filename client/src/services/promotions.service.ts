import { api } from '@/lib/axios'
import type { ApiResponse } from '@onlineshop/shared'

export interface PromoCodeApi {
  id: string
  code: string
  name?: string
  type?: 'PERCENT' | 'FIXED'
  value?: number
  discountType?: 'PERCENT' | 'FIXED'
  discountValue?: number
  status?: string
  active?: boolean
  startsAt?: string | null
  endsAt?: string | null
  maxRedemptions?: number | null
  maxUses?: number | null
  usageCount?: number
}

export interface CreatePromoPayload {
  code: string
  name: string
  type: 'PERCENT' | 'FIXED'
  value: number
  startsAt: string
  endsAt?: string
  maxRedemptions?: number
  minOrderAmount?: number
}

export const promotionsService = {
  async list(): Promise<ApiResponse<PromoCodeApi[]>> {
    return (await api.get('/promotions')) as ApiResponse<PromoCodeApi[]>
  },

  async create(dto: CreatePromoPayload): Promise<ApiResponse<PromoCodeApi>> {
    return (await api.post('/promotions', dto)) as ApiResponse<PromoCodeApi>
  },

  async deactivate(id: string): Promise<ApiResponse<PromoCodeApi>> {
    return (await api.delete(`/promotions/${id}`)) as ApiResponse<PromoCodeApi>
  },
}
