import { api } from '@/lib/axios'
import type { ApiResponse } from '@onlineshop/shared'

export interface DeliveryZoneApi {
  id: string
  name: string
  feeRwf: number
  etaMinutes: number
  createdAt: string
  updatedAt: string
}

export interface CreateDeliveryZonePayload {
  name: string
  feeRwf: number
  etaMinutes: number
}

export interface UpdateDeliveryZonePayload {
  name?: string
  feeRwf?: number
  etaMinutes?: number
}

export const deliveryZonesService = {
  async getAll(): Promise<ApiResponse<DeliveryZoneApi[]>> {
    return (await api.get('/delivery-zones')) as ApiResponse<DeliveryZoneApi[]>
  },

  async create(dto: CreateDeliveryZonePayload): Promise<ApiResponse<DeliveryZoneApi>> {
    return (await api.post('/delivery-zones', dto)) as ApiResponse<DeliveryZoneApi>
  },

  async update(id: string, dto: UpdateDeliveryZonePayload): Promise<ApiResponse<DeliveryZoneApi>> {
    return (await api.put(`/delivery-zones/${id}`, dto)) as ApiResponse<DeliveryZoneApi>
  },

  async delete(id: string): Promise<ApiResponse<void>> {
    return (await api.delete(`/delivery-zones/${id}`)) as ApiResponse<void>
  },
}
