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
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { useState, useEffect, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { formatRwf } from '@/lib/product-display'
import { LoaderPanel } from '@/components/ui/turning-zero-loader'
import { extractApiPayload } from '@/lib/api-response'
import { analyticsService } from '@/services/analytics.service'
import type {
  DashboardMetrics,
  DashboardOverview,
  TopProduct,
  InventorySummary,
  SalesTrendPoint,
  RecentActivityItem,
} from '@/services/analytics.service'

function money(n: number | undefined) {
  return `${formatRwf(n ?? 0)} RWF`
}

export default function DashboardPage() {
  const t = useTranslations('dashboard')
  const th = useTranslations('dashboard.home')
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month' | 'year'>('month')

  const [dashboardMetrics, setDashboardMetrics] = useState<DashboardMetrics | null>(null)
  const [topProducts, setTopProducts] = useState<TopProduct[]>([])
  const [inventorySummary, setInventorySummary] = useState<InventorySummary | null>(null)
  const [salesTrend, setSalesTrend] = useState<SalesTrendPoint[]>([])
  const [recentActivity, setRecentActivity] = useState<RecentActivityItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let cancelled = false

    const fetchAll = async () => {
      setIsLoading(true)
      setLoadError(false)
      try {
        const res = await analyticsService.getDashboardOverview(selectedPeriod, {
          topLimit: 3,
          trendDays: 365,
          activityLimit: 8,
        })

        if (cancelled) return

        const overview = (extractApiPayload(res) ?? res) as unknown as DashboardOverview | null
        if (overview?.metrics) {
          setDashboardMetrics(overview.metrics)
          setTopProducts(Array.isArray(overview.topProducts) ? overview.topProducts : [])
          setInventorySummary(overview.inventory ?? null)
          setSalesTrend(Array.isArray(overview.salesTrend) ? overview.salesTrend : [])
          setRecentActivity(
            Array.isArray(overview.recentActivity) ? overview.recentActivity : [],
          )
        }
      } catch {
        if (!cancelled) {
          setDashboardMetrics(null)
          setTopProducts([])
          setInventorySummary(null)
          setSalesTrend([])
          setRecentActivity([])
          setLoadError(true)
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    fetchAll()
    return () => { cancelled = true }
  }, [selectedPeriod, reloadKey])

  const quickLinks = useMemo(() => [
    { label: th('createProduct'), href: '/dashboard/products?action=create', icon: Plus, color: 'bg-primary-alpha-10 text-primary-base' },
    { label: th('viewOrders'), href: '/dashboard/orders', icon: Layers, color: 'bg-information-alpha-10 text-information-base' },
    { label: th('manageInventory'), href: '/dashboard/inventory', icon: Boxes, color: 'bg-primary-alpha-10 text-primary-darker' },
    { label: th('storeSettings'), href: '/dashboard/store-settings', icon: Edit, color: 'bg-bg-weak-50 text-text-sub-600' },
  ], [th])

  const dash = (v: string | number | undefined) => (isLoading ? '—' : String(v ?? 0))
  const moneyOrDash = (n: number | undefined) => (isLoading ? '—' : money(n))

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3 text-text-strong-950">
            <div className="flex size-10 items-center justify-center rounded-10 bg-primary-base text-static-white shadow-regular-xs">
              <Box className="size-4" aria-hidden />
            </div>
            <div>
              <h1 className="text-title-h6 text-text-strong-950">{t('nav.dashboard')}</h1>
              <p className="text-paragraph-sm text-text-sub-600">{th('welcome')}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <DashboardFilters period={selectedPeriod} />
          <ExportButton
            fetchBlob={() => analyticsService.getReport(selectedPeriod)}
            filename={`report-${selectedPeriod}.csv`}
            label={t('header.generateReport')}
            className="h-10 rounded-10 border-stroke-soft-200 bg-bg-white-0 px-4 text-label-sm text-text-sub-600 shadow-regular-xs hover:bg-bg-weak-50 hover:text-text-strong-950"
            variant="outline"
          />
        </div>
      </div>

      {loadError && !isLoading ? (
        <div className="flex flex-col items-start gap-3 rounded-20 border border-error-base/20 bg-error-alpha-10 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-paragraph-sm font-medium text-error-base">{t('errors.loadFailed')}</p>
          <Button
            type="button"
            variant="outline"
            onClick={() => setReloadKey((k) => k + 1)}
            className="h-9 rounded-10 border-error-base/30 bg-bg-white-0 text-error-base hover:bg-error-alpha-10"
          >
            {t('errors.retry')}
          </Button>
        </div>
      ) : null}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiStatCard
          title={th('totalRevenue')}
          value={money(dashboardMetrics?.totalRevenue)}
          trendLabel={th('totalRevenueHint')}
          isLoading={isLoading}
        />
        <KpiStatCard
          title={th('totalOrders')}
          value={String(dashboardMetrics?.totalOrders ?? 0)}
          trendLabel={th('pendingCount', { count: dashboardMetrics?.pendingOrders ?? 0 })}
          isLoading={isLoading}
        />
        <KpiStatCard
          title={th('activeProducts')}
          value={String(dashboardMetrics?.activeProducts ?? 0)}
          trendLabel={th('activeProductsHint')}
          isLoading={isLoading}
        />
        <KpiStatCard
          title={th('totalCustomers')}
          value={String(dashboardMetrics?.totalCustomers ?? 0)}
          trendLabel={th('totalCustomersHint')}
          isLoading={isLoading}
        />
      </div>

      {/* Quick Links */}
      <Card className="rounded-20 border border-stroke-soft-200 bg-bg-white-0 shadow-regular-xs">
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-text-strong-950">{th('quickActions')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group flex flex-col items-center gap-3 rounded-10 border border-stroke-soft-200 bg-bg-white-0 p-4 transition duration-200 hover:border-primary-base/25 hover:bg-primary-alpha-10 hover:shadow-regular-xs"
              >
                <div className={cn('flex size-12 items-center justify-center rounded-10 transition-transform group-hover:scale-105', link.color)}>
                  <link.icon className="size-5" aria-hidden />
                </div>
                <span className="text-center text-label-sm text-text-strong-950">{link.label}</span>
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
              <CardTitle className="text-sm font-semibold text-text-strong-950">{th('ordersOverview')}</CardTitle>
              <div className="mt-1 text-xs text-text-soft-400">{th('ordersOverviewSubtitle')}</div>
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
            <div className="flex items-center justify-between rounded-10 bg-bg-weak-50 p-4 ring-1 ring-inset ring-stroke-soft-200">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-10 bg-bg-white-0 shadow-regular-xs">
                  <Clock className="size-5 text-text-sub-600" aria-hidden />
                </div>
                <div>
                  <div className="text-label-xs text-text-soft-400">{th('pending')}</div>
                  <div className="text-title-h6 text-text-strong-950">{dash(dashboardMetrics?.pendingOrders)}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-paragraph-xs text-text-soft-400">{th('awaitingAction')}</div>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-10 bg-information-alpha-10 p-4 ring-1 ring-inset ring-stroke-soft-200">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-10 bg-bg-white-0 shadow-regular-xs">
                  <RotateCcw className="size-5 text-information-base" aria-hidden />
                </div>
                <div>
                  <div className="text-label-xs text-text-soft-400">{th('totalOrders')}</div>
                  <div className="text-title-h6 text-text-strong-950">{dash(dashboardMetrics?.totalOrders)}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-paragraph-xs text-information-base">{th('allOrders')}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-10 bg-primary-alpha-10/60 p-4 ring-1 ring-inset ring-stroke-soft-200">
                <div className="flex items-center gap-2">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-bg-white-0 shadow-regular-xs">
                    <CheckCircle2 className="size-4 text-primary-base" aria-hidden />
                  </div>
                  <div className="text-label-xs text-text-soft-400">{th('completed')}</div>
                </div>
                <div className="mt-2 text-title-h6 text-text-strong-950">{dash(dashboardMetrics?.completedOrders)}</div>
              </div>
              <div className="rounded-10 bg-warning-alpha-10 p-4 ring-1 ring-inset ring-stroke-soft-200">
                <div className="flex items-center gap-2">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-bg-white-0 shadow-regular-xs">
                    <AlertTriangle className="size-4 text-warning-base" aria-hidden />
                  </div>
                  <div className="text-label-xs text-text-soft-400">{th('lowStock')}</div>
                </div>
                <div className="mt-2 text-title-h6 text-text-strong-950">{dash(inventorySummary?.lowStock)}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-20 border border-stroke-soft-200 bg-bg-white-0 shadow-regular-xs">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
            <div>
              <CardTitle className="text-sm font-semibold text-text-strong-950">{th('inventoryStatus')}</CardTitle>
              <div className="mt-1 text-xs text-text-soft-400">{th('inventoryStatusSubtitle')}</div>
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
            <div className="relative overflow-hidden rounded-10 bg-primary-alpha-10/50 p-5 ring-1 ring-inset ring-stroke-soft-200">
              <div className="absolute right-4 top-4 opacity-10">
                <Banknote className="size-16 text-primary-base" aria-hidden />
              </div>
              <div className="relative">
                <div className="flex items-center gap-2">
                  <div className="flex size-9 items-center justify-center rounded-10 bg-bg-white-0 shadow-regular-xs">
                    <Banknote className="size-4 text-primary-base" aria-hidden />
                  </div>
                  <div className="text-label-xs text-text-soft-400">{th('totalStockValue')}</div>
                </div>
                <div className="mt-3 text-title-h5 text-text-strong-950">
                  {moneyOrDash(inventorySummary?.totalStockValue)}
                </div>
                <div className="mt-1 text-paragraph-xs text-text-sub-600">{th('acrossAllProducts')}</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-10 bg-bg-weak-50 p-4 ring-1 ring-inset ring-stroke-soft-200">
                <div className="flex size-8 items-center justify-center rounded-lg bg-bg-white-0 shadow-regular-xs">
                  <Box className="size-4 text-text-sub-600" aria-hidden />
                </div>
                <div className="mt-3 text-label-xs text-text-soft-400">{th('inStock')}</div>
                <div className="mt-1 text-title-h6 text-text-strong-950">{dash(inventorySummary?.totalStockQuantity)}</div>
                <div className="mt-0.5 text-paragraph-xs text-text-soft-400">{th('units')}</div>
              </div>

              <div className="rounded-10 bg-warning-alpha-10 p-4 ring-1 ring-inset ring-stroke-soft-200">
                <div className="flex size-8 items-center justify-center rounded-lg bg-bg-white-0 shadow-regular-xs">
                  <AlertTriangle className="size-4 text-warning-base" aria-hidden />
                </div>
                <div className="mt-3 text-label-xs text-text-soft-400">{th('lowStock')}</div>
                <div className="mt-1 text-title-h6 text-text-strong-950">{dash(inventorySummary?.lowStock)}</div>
                <div className="mt-0.5 text-paragraph-xs text-text-soft-400">{th('items')}</div>
              </div>

              <div className="rounded-10 bg-error-alpha-10 p-4 ring-1 ring-inset ring-stroke-soft-200">
                <div className="flex size-8 items-center justify-center rounded-lg bg-bg-white-0 shadow-regular-xs">
                  <XCircle className="size-4 text-error-base" aria-hidden />
                </div>
                <div className="mt-3 text-label-xs text-text-soft-400">{th('outOfStock')}</div>
                <div className="mt-1 text-title-h6 text-text-strong-950">{dash(inventorySummary?.outOfStock)}</div>
                <div className="mt-0.5 text-paragraph-xs text-text-soft-400">{th('items')}</div>
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
            <div className="group rounded-xl bg-gradient-to-br from-bg-weak-50 to-bg-white-0 p-5 transition-all hover:shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm transition-transform group-hover:scale-110">
                  <ShoppingBag className="h-5 w-5 text-text-sub-600" />
                </div>
                <div>
                  <div className="text-xs font-medium text-text-soft-400">{t('cards.totalSales')}</div>
                  <div className="text-2xl font-bold text-text-strong-950">{dash(dashboardMetrics?.totalOrders)}</div>
                </div>
              </div>
              <div className="mt-2 text-xs text-text-soft-400">{th('totalOrdersPlaced')}</div>
            </div>

            <div className="group rounded-xl bg-gradient-to-br from-information-alpha-10 to-bg-weak-50 p-5 transition-all hover:shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm transition-transform group-hover:scale-110">
                  <ArrowUpRight className="h-5 w-5 text-information-base" />
                </div>
                <div>
                  <div className="text-xs font-medium text-text-soft-400">{t('cards.revenue')}</div>
                  <div className="text-2xl font-bold text-text-strong-950">
                    {moneyOrDash(dashboardMetrics?.totalRevenue)}
                  </div>
                </div>
              </div>
              <div className="mt-2 text-xs text-text-soft-400">{th('grossIncome')}</div>
            </div>

            <div className="group rounded-xl bg-gradient-to-br from-bg-weak-50 to-bg-white-0 p-5 transition-all hover:shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm transition-transform group-hover:scale-110">
                  <ArrowDownRight className="h-5 w-5 text-text-sub-600" />
                </div>
                <div>
                  <div className="text-xs font-medium text-text-soft-400">{th('completed')}</div>
                  <div className="text-2xl font-bold text-text-strong-950">{dash(dashboardMetrics?.completedOrders)}</div>
                </div>
              </div>
              <div className="mt-2 text-xs text-text-soft-400">{th('fulfilledOrders')}</div>
            </div>

            <div className="group rounded-xl bg-gradient-to-br from-primary-alpha-10 to-bg-weak-50 p-5 transition-all hover:shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm transition-transform group-hover:scale-110">
                  <Users className="h-5 w-5 text-primary-base" />
                </div>
                <div>
                  <div className="text-xs font-medium text-text-soft-400">{th('totalCustomers')}</div>
                  <div className="text-2xl font-bold text-text-strong-950">{dash(dashboardMetrics?.totalCustomers)}</div>
                </div>
              </div>
              <div className="mt-2 text-xs text-text-soft-400">{th('totalCustomersHint')}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Products */}
      <Card className="rounded-20 border border-stroke-soft-200 bg-bg-white-0 shadow-regular-xs">
        <CardHeader className="flex flex-row items-start justify-between space-y-0">
          <div>
            <CardTitle className="text-sm font-semibold text-text-strong-950">{th('topSellingProducts')}</CardTitle>
            <div className="mt-1 text-xs text-text-soft-400">{th('bestPerformers', { period: selectedPeriod })}</div>
          </div>
          <Link href="/dashboard/products">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 rounded-lg text-xs text-primary-base hover:bg-primary-alpha-10"
            >
              {th('viewAll')}
              <ExternalLink className="ml-1 h-3 w-3" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <LoaderPanel minHeightClassName="min-h-[140px]" size="md" />
          ) : topProducts.length === 0 ? (
            <div className="py-8 text-center text-sm text-text-soft-400">{th('noSalesData')}</div>
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
                      <div className="text-xs text-text-soft-400">{th('unitsSold', { count: product.unitsSold })}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-text-strong-950">{money(product.revenue)}</div>
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
            <CardTitle className="text-sm font-semibold text-text-strong-950">{th('productSummary')}</CardTitle>
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
              label={th('activeProducts')}
              value={dash(dashboardMetrics?.activeProducts)}
            />
            <MetricTile
              icon={<CheckCircle2 className="h-4 w-4" />}
              iconClassName="bg-primary-alpha-10 text-primary-base"
              label={th('completedOrders')}
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
            <KeyValueRow label={th('outOfStock')} value={String(inventorySummary?.outOfStock ?? (isLoading ? '—' : '0')).padStart(2, '0')} />
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
              iconClassName="bg-primary-alpha-10 text-primary-base"
              label={t('cards.totalCustomers')}
              value={dash(dashboardMetrics?.totalCustomers)}
            />
            <MetricTile
              icon={<ShoppingBag className="h-4 w-4" />}
              iconClassName="bg-information-alpha-10 text-information-base"
              label={th('totalOrders')}
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
            <CardTitle className="text-sm font-semibold text-text-strong-950">{th('recentActivity')}</CardTitle>
            <div className="mt-1 text-xs text-text-soft-400">{th('recentActivitySubtitle')}</div>
          </div>
          <Link href="/dashboard/orders">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 rounded-lg text-xs text-primary-base hover:bg-primary-alpha-10"
            >
              {th('viewOrders')}
              <ExternalLink className="ml-1 h-3 w-3" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <LoaderPanel minHeightClassName="min-h-[160px]" size="md" />
          ) : recentActivity.length === 0 ? (
            <div className="py-8 text-center text-sm text-text-soft-400">{th('noRecentActivity')}</div>
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
                      <span className="shrink-0 text-xs text-text-soft-400">
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
