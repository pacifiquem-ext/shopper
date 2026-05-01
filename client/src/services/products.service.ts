import { api } from '@/lib/axios'
import type { ApiResponse } from '@/services/auth.service'

export interface ProductVariantApi {
  id: string
  sku: string
  title: string
  colorName?: string
  colorHex?: string
  size?: string
  price: number
  compareAt?: number
  cost?: number
  inventory?: {
    onHand: number
    available: number
    status: string
  }
}

export interface ProductApi {
  id: string
  name: string
  description?: string
  vendor: string
  category: string
  status: string
  tags?: string[]
  images?: string[]
  primaryImage?: string
  deliveryEnabled: boolean
  deliveryLocation?: string
  deliveryPrice?: number
  variants: ProductVariantApi[]
  createdAt: string
  updatedAt: string
}

export interface ProductListApi {
  data: ProductApi[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface CreateProductPayload {
  name: string
  description?: string
  vendor: string
  category: string
  status?: string
  tags?: string[]
  images?: string[]
  primaryImage?: string
  deliveryEnabled?: boolean
  deliveryLocation?: string
  deliveryPrice?: number
  variants: Array<{
    colorName?: string
    colorHex?: string
    size?: string
    model?: string
    price: number
    compareAt?: number
    cost?: number
    stock: number
  }>
}

export interface ProductFiltersApi {
  page?: number
  limit?: number
  status?: string
  category?: string
  vendor?: string
  search?: string
}

export interface ProductAnalyticsApi {
  productId: string
  totalRevenue: number
  totalUnitsSold: number
  totalOrders: number
  averageOrderValue: number
}

export const productsService = {
  async getAll(filters: ProductFiltersApi = {}): Promise<ApiResponse<ProductListApi>> {
    const params = new URLSearchParams()
    if (filters.page) params.set('page', String(filters.page))
    if (filters.limit) params.set('limit', String(filters.limit))
    if (filters.status) params.set('status', filters.status)
    if (filters.category) params.set('category', filters.category)
    if (filters.vendor) params.set('vendor', filters.vendor)
    if (filters.search) params.set('search', filters.search)
    const qs = params.toString()
    return (await api.get(`/products${qs ? `?${qs}` : ''}`)) as ApiResponse<ProductListApi>
  },

  async getById(id: string): Promise<ApiResponse<ProductApi>> {
    return (await api.get(`/products/${id}`)) as ApiResponse<ProductApi>
  },

  async create(dto: CreateProductPayload): Promise<ApiResponse<ProductApi>> {
    return (await api.post('/products', dto)) as ApiResponse<ProductApi>
  },

  async update(id: string, dto: Partial<Omit<CreateProductPayload, 'variants'>>): Promise<ApiResponse<ProductApi>> {
    return (await api.put(`/products/${id}`, dto)) as ApiResponse<ProductApi>
  },

  async delete(id: string): Promise<ApiResponse<{ message: string }>> {
    return (await api.delete(`/products/${id}`)) as ApiResponse<{ message: string }>
  },

  async getAnalytics(id: string): Promise<ApiResponse<ProductAnalyticsApi>> {
    return (await api.get(`/products/${id}/analytics`)) as ApiResponse<ProductAnalyticsApi>
  },

  async exportCsv(): Promise<Blob> {
    return (await api.get('/products/export', { responseType: 'blob' })) as unknown as Blob
  },
}
