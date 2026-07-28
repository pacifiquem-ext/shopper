import { api } from '@/lib/axios'
import type { ApiResponse, OffsetPage } from '@shopper/shared'

export interface AdminStoreApi {
  id: string
  displayName: string
  slug: string
  status: string
  createdAt: string
  contactEmail?: string | null
  contactPhone?: string | null
}

export interface AdminStoreKycApi {
  ownerFullName: string
  ownerNationality: string
  ownerEmail: string
  ownerPhoneNumber: string
  country: string
  industrySector?: { id: string; name: string } | null
  businessCategory?: { id: string; name: string } | null
  businessAddress?: {
    province: string
    district: string
    sector: string
    physicalAddress: string
  } | null
}

export type AdminStoreListApi = OffsetPage<AdminStoreApi>

export interface AdminPromoApi {
  id: string
  code: string
  name?: string
  type?: 'PERCENT' | 'FIXED'
  value?: number
  discountType?: 'PERCENT' | 'FIXED'
  discountValue?: number
  status?: string
  active?: boolean
  storeId?: string | null
  storeName?: string | null
  startsAt?: string | null
  endsAt?: string | null
  usageCount?: number
}

export interface AdminReviewApi {
  id: string
  rating: number
  title?: string | null
  body?: string | null
  comment?: string | null
  productName?: string
  storeName?: string
  status: string
  createdAt: string
  product?: { name?: string }
  store?: { displayName?: string }
}

export interface AdminCategoryApi {
  id: string
  name: string
  productCount?: number
  attributeKeys?: string[]
}

export interface AdminOverviewApi {
  storesTotal: number
  storesPending: number
  productsTotal: number
  ordersTotal: number
  reviewsPending?: number
}

export const adminService = {
  async getOverview(): Promise<ApiResponse<AdminOverviewApi>> {
    return (await api.get('/admin/dashboard')) as ApiResponse<AdminOverviewApi>
  },

  async getStores(filters: {
    status?: string
    search?: string
    take?: number
    skip?: number
  } = {}): Promise<ApiResponse<AdminStoreListApi>> {
    const params = new URLSearchParams()
    if (filters.status) params.set('status', filters.status)
    if (filters.search) params.set('search', filters.search)
    if (filters.take) params.set('take', String(filters.take))
    if (filters.skip) params.set('skip', String(filters.skip))
    const qs = params.toString()
    return (await api.get(`/admin/stores${qs ? `?${qs}` : ''}`)) as ApiResponse<AdminStoreListApi>
  },

  async getStoreKyc(id: string): Promise<ApiResponse<AdminStoreKycApi>> {
    return (await api.get(`/admin/stores/${id}/kyc`)) as ApiResponse<AdminStoreKycApi>
  },

  async approveStore(id: string): Promise<ApiResponse<AdminStoreApi>> {
    return (await api.post(`/admin/stores/${id}/approve`)) as ApiResponse<AdminStoreApi>
  },

  async rejectStore(id: string, reason?: string): Promise<ApiResponse<AdminStoreApi>> {
    const qs = reason ? `?reason=${encodeURIComponent(reason)}` : ''
    return (await api.post(`/admin/stores/${id}/reject${qs}`)) as ApiResponse<AdminStoreApi>
  },

  async getPromotions(): Promise<ApiResponse<AdminPromoApi[]>> {
    return (await api.get('/admin/promotions')) as ApiResponse<AdminPromoApi[]>
  },

  async createPromotion(dto: {
    code: string
    name: string
    type: 'PERCENT' | 'FIXED'
    value: number
    startsAt: string
    endsAt?: string
  }): Promise<ApiResponse<AdminPromoApi>> {
    return (await api.post('/admin/promotions', dto)) as ApiResponse<AdminPromoApi>
  },

  async deletePromotion(id: string): Promise<ApiResponse<unknown>> {
    return (await api.delete(`/admin/promotions/${id}`)) as ApiResponse<unknown>
  },

  async getReviews(filters: { status?: string } = {}): Promise<ApiResponse<AdminReviewApi[] | { data: AdminReviewApi[] }>> {
    const params = new URLSearchParams()
    if (filters.status) params.set('status', filters.status)
    const qs = params.toString()
    return (await api.get(`/admin/reviews${qs ? `?${qs}` : ''}`)) as ApiResponse<
      AdminReviewApi[] | { data: AdminReviewApi[] }
    >
  },

  async approveReview(id: string): Promise<ApiResponse<unknown>> {
    return (await api.post(`/admin/reviews/${id}/approve`)) as ApiResponse<unknown>
  },

  async rejectReview(id: string): Promise<ApiResponse<unknown>> {
    return (await api.post(`/admin/reviews/${id}/reject`)) as ApiResponse<unknown>
  },

  async getCategories(): Promise<ApiResponse<AdminCategoryApi[]>> {
    return (await api.get('/admin/categories')) as ApiResponse<AdminCategoryApi[]>
  },
}
