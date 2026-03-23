'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ArrowDownRight,
  ArrowUpRight,
  Banknote,
  Box,
  Info,
  Package,
  RotateCcw,
  ShoppingBag,
  Users,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  FileText,
  Download,
  ExternalLink,
  Plus,
  Eye,
  Edit,
  Clock,
  CheckCircle2,
  XCircle,
  Layers,
  Boxes,
  CreditCard,
  Calendar,
  Filter,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DashboardFilters } from '@/components/dashboard/shared/dashboard-filters'
import {
  KeyValueRow,
  MetricCell,
  MetricTile,
  SalesPurchaseChart,
} from '@/components/dashboard/shared/dashboard-metrics'
import { KpiStatCard } from '@/components/dashboard/shared/kpi-stat-card'
import { Badge } from '@/components/ui/badge'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { useState, useMemo } from 'react'
import { cn } from '@/lib/utils'

export default function DashboardPage() {
  const t = useTranslations('dashboard')
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month' | 'year'>('month')

  const metrics = useMemo(() => ({
    sales: {
      totalSales: 786,
      revenue: 17584,
      cost: 12487,
      profit: 5097,
      trend: 12.5,
    },
    orders: {
      total: 342,
      pending: 28,
      processing: 45,
      completed: 256,
      cancelled: 13,
      trend: 8.3,
    },
    products: {
      total: 104,
      active: 89,
      draft: 12,
      archived: 3,
      lowStock: 2,
    },
    inventory: {
      quantityInHand: 214,
      willBeReceived: 44,
      lowStockItems: 2,
      outOfStock: 0,
      totalValue: 45230,
    },
    customers: {
      total: 1847,
      new: 23,
      active: 156,
      trend: 15.2,
    },
    purchase: {
      noOfPurchase: 45,
      cancelOrder: 4,
      cost: 786,
      returns: 7,
    },
    productDetails: {
      lowStockItems: 2,
      itemGroup: 14,
      noOfItems: 104,
    },
    users: {
      totalCustomers: '1.8k',
      totalSuppliers: 27,
    },
  }), [])

  const quickLinks = useMemo(() => [
    { label: 'Create Product', href: '/dashboard/products?action=create', icon: Plus, color: 'bg-brand-50 text-brand-900' },
    { label: 'View Orders', href: '/dashboard/orders', icon: Layers, color: 'bg-sky-50 text-sky-900' },
    { label: 'Manage Inventory', href: '/dashboard/inventory', icon: Boxes, color: 'bg-emerald-50 text-emerald-900' },
    { label: 'Store Settings', href: '/dashboard/store-settings', icon: Edit, color: 'bg-violet-50 text-violet-900' },
  ], [])

  const recentActivity = useMemo(() => [
    { type: 'order', message: 'New order #ORD-1234 received', time: '2 min ago', status: 'new' },
    { type: 'inventory', message: 'Low stock alert: Cotton T-shirt', time: '15 min ago', status: 'warning' },
    { type: 'product', message: 'Product "Classic Cap" updated', time: '1 hour ago', status: 'info' },
    { type: 'order', message: 'Order #ORD-1230 completed', time: '2 hours ago', status: 'success' },
  ], [])

  const topProducts = useMemo(() => [
    { name: 'Cotton T-shirt', sales: 156, revenue: 2184, trend: 12 },
    { name: 'Classic Cap', sales: 89, revenue: 712, trend: -5 },
    { name: 'Denim Jeans', sales: 67, revenue: 2010, trend: 8 },
  ], [])

  const handleGenerateReport = () => {
    console.log('Generating report for period:', selectedPeriod)
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-gray-900">
            <div className="bg-brand-50 text-brand-900 flex h-9 w-9 items-center justify-center rounded-xl">
              <Box className="h-4 w-4" />
            </div>
            <h1 className="text-xl font-semibold">{t('nav.dashboard')}</h1>
          </div>
          <p className="mt-1 text-sm text-gray-500">Welcome back! Here's what's happening with your store.</p>
        </div>

        <div className="flex items-center gap-3">
          <DashboardFilters />
          <Button
            type="button"
            onClick={handleGenerateReport}
            className="h-10 rounded-xl bg-brand-900 text-white hover:bg-brand-800"
          >
            <Download className="mr-2 h-4 w-4" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiStatCard
          title="Total Revenue"
          value={`$${metrics.sales.revenue.toLocaleString()}`}
          trend={metrics.sales.trend}
          sparklineData={[12, 19, 15, 22, 18, 25, 20]}
          icon={<Banknote className="h-4 w-4" />}
          iconClassName="bg-emerald-50 text-[--color-emerald-600]"
        />
        <KpiStatCard
          title="Total Orders"
          value={metrics.orders.total.toString()}
          trend={metrics.orders.trend}
          sparklineData={[8, 12, 10, 15, 13, 18, 16]}
          icon={<ShoppingBag className="h-4 w-4" />}
          iconClassName="bg-sky-50 text-sky-600"
        />
        <KpiStatCard
          title="Active Products"
          value={metrics.products.active.toString()}
          trend={5.2}
          sparklineData={[85, 87, 86, 88, 87, 89, 89]}
          icon={<Package className="h-4 w-4" />}
          iconClassName="bg-violet-50 text-violet-600"
        />
        <KpiStatCard
          title="Total Customers"
          value={metrics.customers.total.toLocaleString()}
          trend={metrics.customers.trend}
          sparklineData={[1.6, 1.7, 1.72, 1.75, 1.78, 1.82, 1.85]}
          icon={<Users className="h-4 w-4" />}
          iconClassName="bg-amber-50 text-amber-600"
        />
      </div>

      {/* Quick Links */}
      <Card className="rounded-2xl border border-gray-200/70 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-gray-900">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group flex flex-col items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 transition-all hover:border-brand-200 hover:bg-brand-50"
              >
                <div className={cn('flex h-12 w-12 items-center justify-center rounded-xl transition-transform group-hover:scale-110', link.color)}>
                  <link.icon className="h-5 w-5" />
                </div>
                <span className="text-center text-sm font-medium text-gray-900">{link.label}</span>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Orders & Inventory Overview */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="rounded-2xl border border-gray-200/70 bg-white shadow-sm">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
            <div>
              <CardTitle className="text-sm font-semibold text-gray-900">Orders Overview</CardTitle>
              <div className="mt-1 text-xs text-gray-500">Current order status breakdown</div>
            </div>
            <Link href="/dashboard/orders">
              <Button
                type="button"
                variant="ghost"
                className="h-9 w-9 rounded-lg bg-white p-0 text-gray-700 hover:bg-brand-50 hover:text-brand-900"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between rounded-xl bg-gradient-to-br from-gray-50 to-gray-100/50 p-4 transition-all hover:shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm">
                  <Clock className="h-5 w-5 text-gray-700" />
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-500">Pending</div>
                  <div className="text-2xl font-bold text-gray-900">{metrics.orders.pending}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-medium text-gray-400">Awaiting action</div>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-gradient-to-br from-blue-50/50 to-sky-50/30 p-4 transition-all hover:shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm">
                  <RotateCcw className="h-5 w-5 text-sky-700" />
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-500">Processing</div>
                  <div className="text-2xl font-bold text-gray-900">{metrics.orders.processing}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-medium text-sky-600">In progress</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-gradient-to-br from-emerald-50/30 to-green-50/20 p-4 transition-all hover:shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-sm">
                    <CheckCircle2 className="h-4 w-4 text-[--color-emerald-600]" />
                  </div>
                  <div className="text-xs font-medium text-gray-500">Completed</div>
                </div>
                <div className="mt-2 text-xl font-bold text-gray-900">{metrics.orders.completed}</div>
              </div>
              <div className="rounded-xl bg-gradient-to-br from-gray-50 to-slate-50/50 p-4 transition-all hover:shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-sm">
                    <XCircle className="h-4 w-4 text-gray-500" />
                  </div>
                  <div className="text-xs font-medium text-gray-500">Cancelled</div>
                </div>
                <div className="mt-2 text-xl font-bold text-gray-900">{metrics.orders.cancelled}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-gray-200/70 bg-white shadow-sm">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
            <div>
              <CardTitle className="text-sm font-semibold text-gray-900">Inventory Status</CardTitle>
              <div className="mt-1 text-xs text-gray-500">Stock levels and alerts</div>
            </div>
            <Link href="/dashboard/inventory">
              <Button
                type="button"
                variant="ghost"
                className="h-9 w-9 rounded-lg bg-white p-0 text-gray-700 hover:bg-brand-50 hover:text-brand-900"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-50/40 via-green-50/20 to-teal-50/30 p-5 transition-all hover:shadow-sm">
              <div className="absolute right-4 top-4 opacity-10">
                <Banknote className="h-16 w-16 text-[--color-emerald-600]" />
              </div>
              <div className="relative">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white shadow-sm">
                    <Banknote className="h-4 w-4 text-[--color-emerald-600]" />
                  </div>
                  <div className="text-xs font-medium text-gray-500">Total Stock Value</div>
                </div>
                <div className="mt-3 text-3xl font-bold text-gray-900">${metrics.inventory.totalValue.toLocaleString()}</div>
                <div className="mt-1 text-xs text-gray-500">Across all products</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="group rounded-xl bg-gradient-to-br from-gray-50 to-slate-50/50 p-4 transition-all hover:shadow-sm">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-sm transition-transform group-hover:scale-110">
                  <Box className="h-4 w-4 text-gray-700" />
                </div>
                <div className="mt-3 text-xs font-medium text-gray-500">In Stock</div>
                <div className="mt-1 text-xl font-bold text-gray-900">{metrics.inventory.quantityInHand}</div>
                <div className="mt-0.5 text-xs text-gray-400">units</div>
              </div>

              <div className="group rounded-xl bg-gradient-to-br from-slate-50 to-gray-100/50 p-4 transition-all hover:shadow-sm">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-sm transition-transform group-hover:scale-110">
                  <AlertTriangle className="h-4 w-4 text-gray-600" />
                </div>
                <div className="mt-3 text-xs font-medium text-gray-500">Low Stock</div>
                <div className="mt-1 text-xl font-bold text-gray-900">{metrics.inventory.lowStockItems}</div>
                <div className="mt-0.5 text-xs text-gray-400">items</div>
              </div>

              <div className="group rounded-xl bg-gradient-to-br from-blue-50/40 to-sky-50/30 p-4 transition-all hover:shadow-sm">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-sm transition-transform group-hover:scale-110">
                  <Package className="h-4 w-4 text-sky-700" />
                </div>
                <div className="mt-3 text-xs font-medium text-gray-500">Incoming</div>
                <div className="mt-1 text-xl font-bold text-gray-900">{metrics.inventory.willBeReceived}</div>
                <div className="mt-0.5 text-xs text-gray-400">units</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sales Overview */}
      <Card className="rounded-2xl border border-gray-200/70 bg-white shadow-sm">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="text-sm font-semibold text-gray-900">{t('cards.salesOverview')}</CardTitle>
            <div className="mt-1 text-xs text-gray-500">{t('cards.salesSubtitle')}</div>
          </div>
          <Button
            type="button"
            variant="ghost"
            className="h-9 w-9 rounded-lg bg-white p-0 text-gray-700 hover:bg-brand-50 hover:text-brand-900"
          >
            <span className="sr-only">{t('cards.more')}</span>
            <Info className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="group rounded-xl bg-gradient-to-br from-gray-50 to-slate-50/50 p-5 transition-all hover:shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm transition-transform group-hover:scale-110">
                  <ShoppingBag className="h-5 w-5 text-gray-700" />
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-500">{t('cards.totalSales')}</div>
                  <div className="text-2xl font-bold text-gray-900">{metrics.sales.totalSales}</div>
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-400">Total transactions</div>
            </div>

            <div className="group rounded-xl bg-gradient-to-br from-blue-50/40 to-sky-50/30 p-5 transition-all hover:shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm transition-transform group-hover:scale-110">
                  <ArrowUpRight className="h-5 w-5 text-sky-700" />
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-500">{t('cards.revenue')}</div>
                  <div className="text-2xl font-bold text-gray-900">${metrics.sales.revenue.toLocaleString()}</div>
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-400">Gross income</div>
            </div>

            <div className="group rounded-xl bg-gradient-to-br from-slate-50 to-gray-100/50 p-5 transition-all hover:shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm transition-transform group-hover:scale-110">
                  <ArrowDownRight className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-500">{t('cards.cost')}</div>
                  <div className="text-2xl font-bold text-gray-900">${metrics.sales.cost.toLocaleString()}</div>
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-400">Total expenses</div>
            </div>

            <div className="group rounded-xl bg-gradient-to-br from-emerald-50/40 via-green-50/20 to-teal-50/30 p-5 transition-all hover:shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm transition-transform group-hover:scale-110">
                  <Banknote className="h-5 w-5 text-[--color-emerald-600]" />
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-500">{t('cards.profit')}</div>
                  <div className="text-2xl font-bold text-gray-900">${metrics.sales.profit.toLocaleString()}</div>
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-400">Net earnings</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Products */}
      <Card className="rounded-2xl border border-gray-200/70 bg-white shadow-sm">
        <CardHeader className="flex flex-row items-start justify-between space-y-0">
          <div>
            <CardTitle className="text-sm font-semibold text-gray-900">Top Selling Products</CardTitle>
            <div className="mt-1 text-xs text-gray-500">Best performers this {selectedPeriod}</div>
          </div>
          <Link href="/dashboard/products">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 rounded-lg text-xs text-brand-900 hover:bg-brand-50"
            >
              View All
              <ExternalLink className="ml-1 h-3 w-3" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topProducts.map((product, idx) => (
              <div key={product.name} className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-sm font-bold text-brand-900">
                    {idx + 1}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">{product.name}</div>
                    <div className="text-xs text-gray-500">{product.sales} sales</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-gray-900">${product.revenue}</div>
                  <div className={cn('flex items-center gap-1 text-xs font-medium', product.trend > 0 ? 'text-[--color-emerald-600]' : 'text-gray-500')}>
                    {product.trend > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {Math.abs(product.trend)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Product & Customer Stats */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="rounded-2xl border border-gray-200/70 bg-white shadow-sm">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-0">
            <CardTitle className="text-sm font-semibold text-gray-900">Product Summary</CardTitle>
            <Link href="/dashboard/products">
              <Button
                type="button"
                variant="ghost"
                className="h-9 w-9 rounded-lg bg-white p-0 text-gray-700 hover:bg-brand-50 hover:text-brand-900"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 pt-4">
            <MetricTile
              icon={<Package className="h-4 w-4" />}
              iconClassName="bg-brand-50 text-brand-900"
              label="Total Products"
              value={String(metrics.products.total)}
            />
            <MetricTile
              icon={<CheckCircle2 className="h-4 w-4" />}
              iconClassName="bg-emerald-50 text-[--color-emerald-600]"
              label="Active"
              value={String(metrics.products.active)}
            />
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-gray-200/70 bg-white shadow-sm">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-0">
            <CardTitle className="text-sm font-semibold text-gray-900">{t('cards.productDetails')}</CardTitle>
            <Button
              type="button"
              variant="ghost"
              className="h-9 w-9 rounded-lg bg-white p-0 text-gray-700 hover:bg-brand-50 hover:text-brand-900"
            >
              <span className="sr-only">{t('cards.more')}</span>
              <Info className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <KeyValueRow label={t('cards.lowStockItems')} value={String(metrics.productDetails.lowStockItems).padStart(2, '0')} />
            <KeyValueRow label={t('cards.itemGroup')} value={String(metrics.productDetails.itemGroup)} />
            <KeyValueRow label={t('cards.noOfItems')} value={String(metrics.productDetails.noOfItems)} />
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-gray-200/70 bg-white shadow-sm">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-0">
            <CardTitle className="text-sm font-semibold text-gray-900">{t('cards.noOfUsers')}</CardTitle>
            <Button
              type="button"
              variant="ghost"
              className="h-9 w-9 rounded-lg bg-white p-0 text-gray-700 hover:bg-brand-50 hover:text-brand-900"
            >
              <span className="sr-only">{t('cards.more')}</span>
              <Info className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 pt-4">
            <MetricTile
              icon={<Users className="h-4 w-4" />}
              iconClassName="bg-emerald-50 text-[--color-emerald-600]"
              label={t('cards.totalCustomers')}
              value={String(metrics.users.totalCustomers)}
            />
            <MetricTile
              icon={<Users className="h-4 w-4" />}
              iconClassName="bg-sky-50 text-sky-600"
              label={t('cards.totalSuppliers')}
              value={String(metrics.users.totalSuppliers)}
            />
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl border border-gray-200/70 bg-white shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
          <div>
            <CardTitle className="text-sm font-semibold text-gray-900">{t('cards.salesPurchaseStats')}</CardTitle>
            <div className="mt-1 text-xs text-gray-500">{t('cards.salesPurchaseStatsSubtitle')}</div>
          </div>
          <div className="flex items-center gap-6 text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-brand-600" />
              <span>{t('cards.sales')}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[--color-emerald-600]" />
              <span>{t('cards.purchase')}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <SalesPurchaseChart />
        </CardContent>
      </Card>
    </div>
  )
}
