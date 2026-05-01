import { api } from '@/lib/axios'
import type { ApiResponse } from '@/services/auth.service'

export interface PaymentOrderApi {
  orderNumber: string
  customerName: string
  customerEmail: string
  customerPhone: string
}

export interface PaymentApi {
  id: string
  orderId: string
  status: string
  method: string
  reference: string | null
  amount: number
  paymentProofUrl: string | null
  paidAt: string | null
  createdAt: string
  updatedAt: string
  order: PaymentOrderApi
}

export interface PaymentListApi {
  data: PaymentApi[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface PaymentFiltersApi {
  page?: number
  limit?: number
  status?: string
  method?: string
  dateFrom?: string
  dateTo?: string
}

export const paymentsService = {
  async getAll(filters: PaymentFiltersApi = {}): Promise<ApiResponse<PaymentListApi>> {
    const params = new URLSearchParams()
    if (filters.page) params.set('page', String(filters.page))
    if (filters.limit) params.set('limit', String(filters.limit))
    if (filters.status) params.set('status', filters.status)
    if (filters.method) params.set('method', filters.method)
    if (filters.dateFrom) params.set('dateFrom', filters.dateFrom)
    if (filters.dateTo) params.set('dateTo', filters.dateTo)
    const qs = params.toString()
    return (await api.get(`/payments${qs ? `?${qs}` : ''}`)) as ApiResponse<PaymentListApi>
  },
}
