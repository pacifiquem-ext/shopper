import { api } from '@/lib/axios'
import type { ApiResponse } from '@/services/auth.service'

export interface AdminStoreApi {
  id: string
  subdomain: string
  registeredName: string
  displayName: string
  status: string
  createdAt: string
  rejectionReason: string | null
  user: {
    fullName: string
    phoneNumber: string
    email: string | null
  }
}

export interface AdminStoreListApi {
  data: AdminStoreApi[]
  total: number
  skip: number
  take: number
}

export interface AdminStoreKycApi {
  id: string
  subdomain: string
  registeredName: string
  displayName: string
  status: string
  createdAt: string
  kyc: {
    ownerFullName: string
    ownerEmail: string
    ownerPhoneNumber: string
    ownerNationality: string
    country: string
    industrySector: { name: string }
    businessCategory: { name: string }
    businessAddress: {
      province: string
      district: string
      sector: string
      physicalAddress: string
    } | null
  } | null
}

export interface AdminFiltersApi {
  status?: string
  skip?: number
  take?: number
}

export const adminService = {
  async getStores(filters: AdminFiltersApi = {}): Promise<ApiResponse<AdminStoreListApi>> {
    const params = new URLSearchParams()
    if (filters.status) params.set('status', filters.status)
    if (filters.skip != null) params.set('skip', String(filters.skip))
    if (filters.take != null) params.set('take', String(filters.take))
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
}
