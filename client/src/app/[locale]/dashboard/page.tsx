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
  ExternalLink,
  Plus,
  Edit,
  Clock,
  CheckCircle2,
  XCircle,
  Layers,
  Boxes,
  AlertTriangle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ExportButton } from '@/components/dashboard/shared/export-button'
import { DashboardFilters } from '@/components/dashboard/shared/dashboard-filters'
import {
  KeyValueRow,
  MetricTile,
  SalesPurchaseChart,
} from '@/components/dashboard/shared/dashboard-metrics'
import { KpiStatCard } from '@/components/dashboard/shared/kpi-stat-card'
import { Badge } from '@/components/ui/badge'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { useState, useEffect, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { LoaderPanel } from '@/components/ui/turning-zero-loader'
import { analyticsService } from '@/services/analytics.service'
import type { DashboardMetrics, TopProduct, InventorySummary, SalesTrendPoint, RecentActivityItem } from '@/services/analytics.service'

export default function DashboardPage() {
  const t = useTranslations('dashboard')
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month' | 'year'>('month')

  const [dashboardMetrics, setDashboardMetrics] = useState<DashboardMetrics | null>(null)
  const [topProducts, setTopProducts] = useState<TopProduct[]>([])
  const [inventorySummary, setInventorySummary] = useState<InventorySummary | null>(null)
  const [salesTrend, setSalesTrend] = useState<SalesTrendPoint[]>([])
  const [recentActivity, setRecentActivity] = useState<RecentActivityItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    const fetchAll = async () => {
      setIsLoading(true)
      try {
        const res = await analyticsService.getDashboardOverview(selectedPeriod, {
          topLimit: 3,
          trendDays: 365,
          activityLimit: 8,
        })

        if (cancelled) return

        const overview = (res as { data?: typeof res })?.data ?? res
        if (overview && typeof overview === 'object' && 'metrics' in overview) {
          setDashboardMetrics(overview.metrics)
          setTopProducts(Array.isArray(overview.topProducts) ? overview.topProducts : [])
          setInventorySummary(overview.inventory ?? null)
          setSalesTrend(Array.isArray(overview.salesTrend) ? overview.salesTrend : [])
          setRecentActivity(
            Array.isArray(overview.recentActivity) ? overview.recentActivity : [],
          )
        }
      } catch {
        // Axios interceptor shows toasts; keep dashboard usable with empty metrics
        if (!cancelled) {
          setDashboardMetrics(null)
          setTopProducts([])
          setInventorySummary(null)
          setSalesTrend([])
          setRecentActivity([])
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    fetchAll()
    return () => { cancelled = true }
  }, [selectedPeriod])

  const quickLinks = useMemo(() => [
    { label: 'Create Product', href: '/dashboard/products?action=create', icon: Plus, color: 'bg-primary-alpha-10 text-primary-base' },
    { label: 'View Orders', href: '/dashboard/orders', icon: Layers, color: 'bg-sky-50 text-sky-900' },
    { label: 'Manage Inventory', href: '/dashboard/inventory', icon: Boxes, color: 'bg-emerald-50 text-emerald-900' },
    { label: 'Store Settings', href: '/dashboard/store-settings', icon: Edit, color: 'bg-violet-50 text-violet-900' },
  ], [])

  const fmt = (n: number | undefined) => (n ?? 0).toLocaleString()
  const dash = (v: string | number | undefined) => isLoading ? '—' : String(v ?? 0)

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-text-strong-950">
            <div className="bg-primary-alpha-10 text-primary-base flex h-9 w-9 items-center justify-center rounded-xl">
              <Box className="h-4 w-4" />
            </div>
            <h1 className="text-xl font-semibold">{t('nav.dashboard')}</h1>
          </div>
          <p className="mt-1 text-sm text-text-soft-400">Welcome back! Here's what's happening with your store.</p>
        </div>

        <div className="flex items-center gap-3">
          <DashboardFilters period={selectedPeriod} />
          <ExportButton
            fetchBlob={() => analyticsService.getReport(selectedPeriod)}
            filename={`report-${selectedPeriod}.csv`}
            label={t('header.generateReport')}
            className="h-10 rounded-xl border-stroke-soft-200 bg-bg-white-0 px-4 text-sm font-medium text-text-sub-600 shadow-regular-xs hover:bg-bg-weak-50 hover:text-text-strong-950"
            variant="outline"
          />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiStatCard
          title="Total Revenue"
          value={`$${fmt(dashboardMetrics?.totalRevenue)}`}
          trendLabel="Gross revenue this period"
          isLoading={isLoading}
        />
        <KpiStatCard
          title="Total Orders"
          value={String(dashboardMetrics?.totalOrders ?? 0)}
          trendLabel={`${dashboardMetrics?.pendingOrders ?? 0} pending`}
          isLoading={isLoading}
        />
        <KpiStatCard
          title="Active Products"
          value={String(dashboardMetrics?.activeProducts ?? 0)}
          trendLabel="Published products"
          isLoading={isLoading}
        />
        <KpiStatCard
          title="Total Customers"
          value={String(dashboardMetrics?.totalCustomers ?? 0)}
          trendLabel="Unique customers"
          isLoading={isLoading}
        />
      </div>

      {/* Quick Links */}
      <Card className="rounded-20 border border-stroke-soft-200 bg-bg-white-0 shadow-regular-xs">
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-text-strong-950">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group flex flex-col items-center gap-3 rounded-xl border border-stroke-soft-200 bg-white p-4 transition-all hover:border-primary-base/20 hover:bg-primary-alpha-10"
              >
                <div className={cn('flex h-12 w-12 items-center justify-center rounded-xl transition-transform group-hover:scale-110', link.color)}>
                  <link.icon className="h-5 w-5" />
                </div>
                <span className="text-center text-sm font-medium text-text-strong-950">{link.label}</span>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Orders & Inventory Overview */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="rounded-20 border border-stroke-soft-200 bg-bg-white-0 shadow-regular-xs">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
            <div>
              <CardTitle className="text-sm font-semibold text-text-strong-950">Orders Overview</CardTitle>
              <div className="mt-1 text-xs text-text-soft-400">Current order status breakdown</div>
            </div>
            <Link href="/dashboard/orders">
              <Button
                type="button"
                variant="ghost"
                className="h-9 w-9 rounded-lg bg-white p-0 text-text-sub-600 hover:bg-primary-alpha-10 hover:text-primary-base"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between rounded-xl bg-gradient-to-br from-gray-50 to-gray-100/50 p-4 transition-all hover:shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm">
                  <Clock className="h-5 w-5 text-text-sub-600" />
                </div>
                <div>
                  <div className="text-xs font-medium text-text-soft-400">Pending</div>
                  <div className="text-2xl font-bold text-text-strong-950">{dash(dashboardMetrics?.pendingOrders)}</div>
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
                  <div className="text-xs font-medium text-text-soft-400">Total Orders</div>
                  <div className="text-2xl font-bold text-text-strong-950">{dash(dashboardMetrics?.totalOrders)}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-medium text-sky-600">All orders</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-gradient-to-br from-emerald-50/30 to-green-50/20 p-4 transition-all hover:shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-sm">
                    <CheckCircle2 className="h-4 w-4 text-[--color-emerald-600]" />
                  </div>
                  <div className="text-xs font-medium text-text-soft-400">Completed</div>
                </div>
                <div className="mt-2 text-xl font-bold text-text-strong-950">{dash(dashboardMetrics?.completedOrders)}</div>
              </div>
              <div className="rounded-xl bg-gradient-to-br from-amber-50/30 to-yellow-50/20 p-4 transition-all hover:shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-sm">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                  </div>
                  <div className="text-xs font-medium text-text-soft-400">Low Stock</div>
                </div>
                <div className="mt-2 text-xl font-bold text-text-strong-950">{dash(inventorySummary?.lowStock)}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-20 border border-stroke-soft-200 bg-bg-white-0 shadow-regular-xs">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
            <div>
              <CardTitle className="text-sm font-semibold text-text-strong-950">Inventory Status</CardTitle>
              <div className="mt-1 text-xs text-text-soft-400">Stock levels and alerts</div>
            </div>
            <Link href="/dashboard/inventory">
              <Button
                type="button"
                variant="ghost"
                className="h-9 w-9 rounded-lg bg-white p-0 text-text-sub-600 hover:bg-primary-alpha-10 hover:text-primary-base"
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
                  <div className="text-xs font-medium text-text-soft-400">Total Stock Value</div>
                </div>
                <div className="mt-3 text-3xl font-bold text-text-strong-950">
                  {isLoading ? '—' : `$${fmt(inventorySummary?.totalStockValue)}`}
                </div>
                <div className="mt-1 text-xs text-text-soft-400">Across all products</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="group rounded-xl bg-gradient-to-br from-gray-50 to-slate-50/50 p-4 transition-all hover:shadow-sm">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-sm transition-transform group-hover:scale-110">
                  <Box className="h-4 w-4 text-text-sub-600" />
                </div>
                <div className="mt-3 text-xs font-medium text-text-soft-400">In Stock</div>
                <div className="mt-1 text-xl font-bold text-text-strong-950">{dash(inventorySummary?.totalStockQuantity)}</div>
                <div className="mt-0.5 text-xs text-gray-400">units</div>
              </div>

              <div className="group rounded-xl bg-gradient-to-br from-slate-50 to-gray-100/50 p-4 transition-all hover:shadow-sm">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-sm transition-transform group-hover:scale-110">
                  <AlertTriangle className="h-4 w-4 text-text-sub-600" />
                </div>
                <div className="mt-3 text-xs font-medium text-text-soft-400">Low Stock</div>
                <div className="mt-1 text-xl font-bold text-text-strong-950">{dash(inventorySummary?.lowStock)}</div>
                <div className="mt-0.5 text-xs text-gray-400">items</div>
              </div>

              <div className="group rounded-xl bg-gradient-to-br from-red-50/30 to-rose-50/20 p-4 transition-all hover:shadow-sm">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-sm transition-transform group-hover:scale-110">
                  <XCircle className="h-4 w-4 text-red-500" />
                </div>
                <div className="mt-3 text-xs font-medium text-text-soft-400">Out of Stock</div>
                <div className="mt-1 text-xl font-bold text-text-strong-950">{dash(inventorySummary?.outOfStock)}</div>
                <div className="mt-0.5 text-xs text-gray-400">items</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sales Overview */}
      <Card className="rounded-20 border border-stroke-soft-200 bg-bg-white-0 shadow-regular-xs">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="text-sm font-semibold text-text-strong-950">{t('cards.salesOverview')}</CardTitle>
            <div className="mt-1 text-xs text-text-soft-400">{t('cards.salesSubtitle')}</div>
          </div>
          <Button
            type="button"
            variant="ghost"
            className="h-9 w-9 rounded-lg bg-white p-0 text-text-sub-600 hover:bg-primary-alpha-10 hover:text-primary-base"
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
                  <ShoppingBag className="h-5 w-5 text-text-sub-600" />
                </div>
                <div>
                  <div className="text-xs font-medium text-text-soft-400">{t('cards.totalSales')}</div>
                  <div className="text-2xl font-bold text-text-strong-950">{dash(dashboardMetrics?.totalOrders)}</div>
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-400">Total orders placed</div>
            </div>

            <div className="group rounded-xl bg-gradient-to-br from-blue-50/40 to-sky-50/30 p-5 transition-all hover:shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm transition-transform group-hover:scale-110">
                  <ArrowUpRight className="h-5 w-5 text-sky-700" />
                </div>
                <div>
                  <div className="text-xs font-medium text-text-soft-400">{t('cards.revenue')}</div>
                  <div className="text-2xl font-bold text-text-strong-950">
                    {isLoading ? '—' : `$${fmt(dashboardMetrics?.totalRevenue)}`}
                  </div>
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-400">Gross income</div>
            </div>

            <div className="group rounded-xl bg-gradient-to-br from-slate-50 to-gray-100/50 p-5 transition-all hover:shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm transition-transform group-hover:scale-110">
                  <ArrowDownRight className="h-5 w-5 text-text-sub-600" />
                </div>
                <div>
                  <div className="text-xs font-medium text-text-soft-400">Completed</div>
                  <div className="text-2xl font-bold text-text-strong-950">{dash(dashboardMetrics?.completedOrders)}</div>
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-400">Fulfilled orders</div>
            </div>

            <div className="group rounded-xl bg-gradient-to-br from-emerald-50/40 via-green-50/20 to-teal-50/30 p-5 transition-all hover:shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm transition-transform group-hover:scale-110">
                  <Users className="h-5 w-5 text-[--color-emerald-600]" />
                </div>
                <div>
                  <div className="text-xs font-medium text-text-soft-400">{t('cards.profit')}</div>
                  <div className="text-2xl font-bold text-text-strong-950">{dash(dashboardMetrics?.totalCustomers)}</div>
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-400">Unique customers</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Products */}
      <Card className="rounded-20 border border-stroke-soft-200 bg-bg-white-0 shadow-regular-xs">
        <CardHeader className="flex flex-row items-start justify-between space-y-0">
          <div>
            <CardTitle className="text-sm font-semibold text-text-strong-950">Top Selling Products</CardTitle>
            <div className="mt-1 text-xs text-text-soft-400">Best performers this {selectedPeriod}</div>
          </div>
          <Link href="/dashboard/products">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 rounded-lg text-xs text-primary-base hover:bg-primary-alpha-10"
            >
              View All
              <ExternalLink className="ml-1 h-3 w-3" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <LoaderPanel minHeightClassName="min-h-[140px]" size="md" />
          ) : topProducts.length === 0 ? (
            <div className="py-8 text-center text-sm text-gray-400">No sales data yet for this period.</div>
          ) : (
            <div className="space-y-3">
              {topProducts.map((product, idx) => (
                <div key={product.productId} className="flex items-center justify-between rounded-xl border border-stroke-soft-200 bg-bg-weak-50 p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-alpha-10 text-sm font-bold text-primary-base">
                      {idx + 1}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-text-strong-950">{product.productName}</div>
                      <div className="text-xs text-text-soft-400">{product.unitsSold} sold</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-text-strong-950">${fmt(product.revenue)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Product & Customer Stats */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="rounded-20 border border-stroke-soft-200 bg-bg-white-0 shadow-regular-xs">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-0">
            <CardTitle className="text-sm font-semibold text-text-strong-950">Product Summary</CardTitle>
            <Link href="/dashboard/products">
              <Button
                type="button"
                variant="ghost"
                className="h-9 w-9 rounded-lg bg-white p-0 text-text-sub-600 hover:bg-primary-alpha-10 hover:text-primary-base"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 pt-4">
            <MetricTile
              icon={<Package className="h-4 w-4" />}
              iconClassName="bg-primary-alpha-10 text-primary-base"
              label="Active Products"
              value={dash(dashboardMetrics?.activeProducts)}
            />
            <MetricTile
              icon={<CheckCircle2 className="h-4 w-4" />}
              iconClassName="bg-emerald-50 text-[--color-emerald-600]"
              label="Completed Orders"
              value={dash(dashboardMetrics?.completedOrders)}
            />
          </CardContent>
        </Card>

        <Card className="rounded-20 border border-stroke-soft-200 bg-bg-white-0 shadow-regular-xs">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-0">
            <CardTitle className="text-sm font-semibold text-text-strong-950">{t('cards.productDetails')}</CardTitle>
            <Button
              type="button"
              variant="ghost"
              className="h-9 w-9 rounded-lg bg-white p-0 text-text-sub-600 hover:bg-primary-alpha-10 hover:text-primary-base"
            >
              <span className="sr-only">{t('cards.more')}</span>
              <Info className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <KeyValueRow label={t('cards.lowStockItems')} value={String(inventorySummary?.lowStock ?? (isLoading ? '—' : '0')).padStart(2, '0')} />
            <KeyValueRow label="Out of Stock" value={String(inventorySummary?.outOfStock ?? (isLoading ? '—' : '0')).padStart(2, '0')} />
            <KeyValueRow label={t('cards.noOfItems')} value={isLoading ? '—' : String(inventorySummary?.totalProducts ?? 0)} />
          </CardContent>
        </Card>

        <Card className="rounded-20 border border-stroke-soft-200 bg-bg-white-0 shadow-regular-xs">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-0">
            <CardTitle className="text-sm font-semibold text-text-strong-950">{t('cards.noOfUsers')}</CardTitle>
            <Button
              type="button"
              variant="ghost"
              className="h-9 w-9 rounded-lg bg-white p-0 text-text-sub-600 hover:bg-primary-alpha-10 hover:text-primary-base"
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
              value={dash(dashboardMetrics?.totalCustomers)}
            />
            <MetricTile
              icon={<ShoppingBag className="h-4 w-4" />}
              iconClassName="bg-sky-50 text-sky-600"
              label="Total Orders"
              value={dash(dashboardMetrics?.totalOrders)}
            />
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-20 border border-stroke-soft-200 bg-bg-white-0 shadow-regular-xs">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
          <div>
            <CardTitle className="text-sm font-semibold text-text-strong-950">{t('cards.salesPurchaseStats')}</CardTitle>
            <div className="mt-1 text-xs text-text-soft-400">{t('cards.salesPurchaseStatsSubtitle')}</div>
          </div>
          <div className="flex items-center gap-6 text-xs text-text-soft-400">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary-base" />
              <span>{t('cards.sales')}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[--color-emerald-600]" />
              <span>{t('cards.purchase')}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <SalesPurchaseChart data={salesTrend} isLoading={isLoading} />
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="rounded-20 border border-stroke-soft-200 bg-bg-white-0 shadow-regular-xs">
        <CardHeader className="flex flex-row items-start justify-between space-y-0">
          <div>
            <CardTitle className="text-sm font-semibold text-text-strong-950">Recent Activity</CardTitle>
            <div className="mt-1 text-xs text-text-soft-400">Latest order events across your store</div>
          </div>
          <Link href="/dashboard/orders">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 rounded-lg text-xs text-primary-base hover:bg-primary-alpha-10"
            >
              View Orders
              <ExternalLink className="ml-1 h-3 w-3" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <LoaderPanel minHeightClassName="min-h-[160px]" size="md" />
          ) : recentActivity.length === 0 ? (
            <div className="py-8 text-center text-sm text-gray-400">No recent activity yet.</div>
          ) : (
            <div className="space-y-2">
              {recentActivity.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-3 rounded-xl border border-stroke-soft-200 bg-bg-weak-50 px-4 py-3"
                >
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary-alpha-10">
                    <TrendingUp className="h-3.5 w-3.5 text-primary-base" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-text-strong-950">{item.title}</span>
                      <span className="shrink-0 text-xs text-gray-400">
                        {new Date(item.createdAt).toLocaleDateString('en-RW', {
                          day: '2-digit',
                          month: 'short',
                        })}
                      </span>
                    </div>
                    <div className="text-xs text-text-soft-400">
                      {item.orderNumber} · {item.customerName}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
