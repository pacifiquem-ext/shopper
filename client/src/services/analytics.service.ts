import { api } from '@/lib/axios'
import type { ApiResponse } from '@/services/auth.service'

export interface DashboardMetrics {
  totalRevenue: number
  totalOrders: number
  activeProducts: number
  totalCustomers: number
  completedOrders: number
  pendingOrders: number
  lowStockCount: number
  outOfStockCount: number
}

export interface SalesTrendPoint {
  date: string
  revenue: number
  cost: number
  orders: number
  profit: number
}

export interface TopProduct {
  productId: string
  productName: string
  unitsSold: number
  revenue: number
}

export interface InventorySummary {
  totalProducts: number
  inStock: number
  lowStock: number
  outOfStock: number
  totalStockValue: number
  totalStockQuantity: number
}

export interface RecentActivityItem {
  id: string
  type: string
  title: string
  description: string
  orderNumber: string
  customerName: string
  createdAt: string
}

export const analyticsService = {
  async getDashboardMetrics(
    period: 'today' | 'week' | 'month' | 'year' = 'month',
  ): Promise<ApiResponse<DashboardMetrics>> {
    return (await api.get(`/analytics/dashboard?period=${period}`)) as ApiResponse<DashboardMetrics>
  },

  async getSalesTrend(days: number = 30): Promise<ApiResponse<SalesTrendPoint[]>> {
    return (await api.get(`/analytics/sales?days=${days}`)) as ApiResponse<SalesTrendPoint[]>
  },

  async getTopProducts(limit: number = 5): Promise<ApiResponse<TopProduct[]>> {
    return (await api.get(`/analytics/products/top?limit=${limit}`)) as ApiResponse<TopProduct[]>
  },

  async getInventorySummary(): Promise<ApiResponse<InventorySummary>> {
    return (await api.get('/analytics/inventory/summary')) as ApiResponse<InventorySummary>
  },

  async getRecentActivity(limit: number = 10): Promise<ApiResponse<RecentActivityItem[]>> {
    return (await api.get(`/analytics/recent-activity?limit=${limit}`)) as ApiResponse<
      RecentActivityItem[]
    >
  },

  async getReport(period: string = 'month'): Promise<Blob> {
    return (await api.get(`/analytics/report?period=${period}`, { responseType: 'blob' })) as unknown as Blob
  },
}
