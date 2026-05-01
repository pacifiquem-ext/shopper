import { api } from '@/lib/axios'
import type { ApiResponse } from '@/services/auth.service'

export interface OrderLineItemApi {
  id: string
  productName: string
  sku: string
  quantity: number
  unitPrice: number
  total: number
}

export interface OrderPaymentApi {
  id: string
  status: string
  method: string
  amount: number
  reference?: string
  paymentProofUrl?: string
  paidAt?: string
}

export interface OrderFulfillmentApi {
  id: string
  status: string
  deliveryMethod: string
  courierName?: string
  driverName?: string
  trackingNumber?: string
  packedBy?: string
  deliveredBy?: string
  assignedAt?: string
  deliveredAt?: string
}

export interface OrderEventApi {
  id: string
  type: string
  title: string
  description: string
  performedBy: string
  createdAt: string
}

export interface OrderMessageApi {
  id: string
  sender: string
  senderName: string
  message: string
  createdAt: string
}

export interface OrderApi {
  id: string
  orderNumber: string
  placedAt: string
  customerName: string
  customerPhone: string
  customerEmail?: string
  shippingAddress: string
  billingAddress?: string
  subtotal: number
  deliveryFee: number
  discount: number
  tax: number
  total: number
  customerNote?: string
  internalNote?: string
  createdBy: string
  payment?: OrderPaymentApi
  fulfillment?: OrderFulfillmentApi
  lineItems: OrderLineItemApi[]
  events?: OrderEventApi[]
  messages?: OrderMessageApi[]
}

export interface OrderListApi {
  data: OrderApi[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface OrderFiltersApi {
  page?: number
  limit?: number
  search?: string
  paymentStatus?: string
  fulfillmentStatus?: string
  dateFrom?: string
  dateTo?: string
}

export const ordersService = {
  async getAll(filters: OrderFiltersApi = {}): Promise<ApiResponse<OrderListApi>> {
    const params = new URLSearchParams()
    if (filters.page) params.set('page', String(filters.page))
    if (filters.limit) params.set('limit', String(filters.limit))
    if (filters.search) params.set('search', filters.search)
    if (filters.paymentStatus) params.set('paymentStatus', filters.paymentStatus)
    if (filters.fulfillmentStatus) params.set('fulfillmentStatus', filters.fulfillmentStatus)
    if (filters.dateFrom) params.set('dateFrom', filters.dateFrom)
    if (filters.dateTo) params.set('dateTo', filters.dateTo)
    const qs = params.toString()
    return (await api.get(`/orders${qs ? `?${qs}` : ''}`)) as ApiResponse<OrderListApi>
  },

  async getById(id: string): Promise<ApiResponse<OrderApi>> {
    return (await api.get(`/orders/${id}`)) as ApiResponse<OrderApi>
  },

  async updatePayment(
    id: string,
    dto: { status: string; reference?: string; paymentProofUrl?: string },
  ): Promise<ApiResponse<OrderApi>> {
    return (await api.put(`/orders/${id}/payment`, dto)) as ApiResponse<OrderApi>
  },

  async updateFulfillment(
    id: string,
    dto: { status: string; courierName?: string; driverName?: string; trackingNumber?: string },
  ): Promise<ApiResponse<OrderApi>> {
    return (await api.put(`/orders/${id}/fulfillment`, dto)) as ApiResponse<OrderApi>
  },

  async sendMessage(
    id: string,
    dto: { message: string; senderName?: string },
  ): Promise<ApiResponse<OrderApi>> {
    return (await api.post(`/orders/${id}/messages`, dto)) as ApiResponse<OrderApi>
  },

  async getMessages(id: string): Promise<ApiResponse<OrderMessageApi[]>> {
    return (await api.get(`/orders/${id}/messages`)) as ApiResponse<OrderMessageApi[]>
  },

  async exportCsv(): Promise<Blob> {
    return (await api.get('/orders/export', { responseType: 'blob' })) as unknown as Blob
  },
}
