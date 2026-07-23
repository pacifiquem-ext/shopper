import { api } from '@/lib/axios'
import type { ApiResponse, OffsetPage } from '@onlineshop/shared'

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

export interface OrderNotificationApi {
  id: string
  orderId: string
  orderNumber: string
  title: string
  body: string
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

export type OrderListApi = OffsetPage<OrderApi>

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
  async getCount(filters: Omit<OrderFiltersApi, 'page' | 'limit'> = {}): Promise<number> {
    const res = await this.getAll({ ...filters, page: 1, limit: 1 })
    const payload = res?.data as OrderListApi | { data?: OrderListApi } | undefined
    if (payload && 'total' in payload && typeof payload.total === 'number') {
      return payload.total
    }
    const nested = (payload as { data?: OrderListApi })?.data
    return nested?.total ?? 0
  },

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

  async getNotifications(limit: number = 10): Promise<ApiResponse<OrderNotificationApi[]>> {
    const params = new URLSearchParams()
    params.set('limit', String(limit))
    return (await api.get(`/orders/notifications?${params.toString()}`)) as ApiResponse<
      OrderNotificationApi[]
    >
  },

  async markNotificationsRead(ids: string[]): Promise<ApiResponse<{ count: number }>> {
    return (await api.put('/orders/notifications/read', { ids })) as ApiResponse<{ count: number }>
  },

  async exportCsv(): Promise<Blob> {
    return (await api.get('/orders/export', { responseType: 'blob' })) as unknown as Blob
  },

  async uploadProof(
    id: string,
    payload: { paymentProofUrl: string; reference?: string; phone: string },
  ): Promise<ApiResponse<OrderApi>> {
    const phone = encodeURIComponent(payload.phone)
    return (await api.post(`/catalog/orders/${id}/payment-proof?phone=${phone}`, {
      paymentProofUrl: payload.paymentProofUrl,
      reference: payload.reference,
    })) as ApiResponse<OrderApi>
  },

  async reviewPayment(
    id: string,
    dto: { action: 'APPROVE' | 'REJECT'; rejectionReason?: string; reference?: string },
  ): Promise<ApiResponse<OrderApi>> {
    return (await api.post(`/orders/${id}/payment/review`, dto)) as ApiResponse<OrderApi>
  },

  async getPublicOrder(
    id: string,
    phone?: string,
  ): Promise<ApiResponse<OrderApi>> {
    const params = new URLSearchParams()
    if (phone) params.set('phone', phone)
    const qs = params.toString()
    return (await api.get(`/catalog/orders/${id}${qs ? `?${qs}` : ''}`)) as ApiResponse<OrderApi>
  },
}
