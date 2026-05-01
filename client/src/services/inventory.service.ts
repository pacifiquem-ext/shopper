import { api } from '@/lib/axios'
import type { ApiResponse } from '@/services/auth.service'

export interface InventoryVariantApi {
  id: string
  sku: string
  title: string
  colorName?: string
  colorHex?: string
  size?: string
  price: number
  cost?: number
  product: {
    id: string
    name: string
    vendor: string
    category: string
  }
}

export interface InventoryEventApi {
  id: string
  type: string
  quantity: number
  reason?: string
  performedBy: string
  createdAt: string
}

export interface InventoryRecordApi {
  id: string
  productVariantId: string
  onHand: number
  reserved: number
  available: number
  reorderPoint: number
  status: string
  lastRestockedAt?: string
  lastSoldAt?: string
  updatedAt: string
  productVariant: InventoryVariantApi
  events?: InventoryEventApi[]
}

export interface InventoryListApi {
  data: InventoryRecordApi[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface InventoryFiltersApi {
  page?: number
  limit?: number
  status?: string
  category?: string
  vendor?: string
  search?: string
}

export const inventoryService = {
  async getAll(filters: InventoryFiltersApi = {}): Promise<ApiResponse<InventoryListApi>> {
    const params = new URLSearchParams()
    if (filters.page) params.set('page', String(filters.page))
    if (filters.limit) params.set('limit', String(filters.limit))
    if (filters.status) params.set('status', filters.status)
    if (filters.category) params.set('category', filters.category)
    if (filters.vendor) params.set('vendor', filters.vendor)
    if (filters.search) params.set('search', filters.search)
    const qs = params.toString()
    return (await api.get(`/inventory${qs ? `?${qs}` : ''}`)) as ApiResponse<InventoryListApi>
  },

  async getByVariantId(variantId: string): Promise<ApiResponse<InventoryRecordApi>> {
    return (await api.get(`/inventory/${variantId}`)) as ApiResponse<InventoryRecordApi>
  },

  async adjustStock(
    variantId: string,
    quantity: number,
    reason: string,
  ): Promise<ApiResponse<InventoryRecordApi>> {
    return (await api.post(`/inventory/${variantId}/adjust`, {
      quantity,
      reason,
    })) as ApiResponse<InventoryRecordApi>
  },

  async getEvents(variantId: string): Promise<ApiResponse<InventoryEventApi[]>> {
    return (await api.get(`/inventory/${variantId}/events`)) as ApiResponse<InventoryEventApi[]>
  },

  async exportCsv(): Promise<Blob> {
    return (await api.get('/inventory/export', { responseType: 'blob' })) as unknown as Blob
  },
}
