import { getTranslations } from 'next-intl/server'
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
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DashboardFilters } from '@/components/dashboard/dashboard-filters'
import {
  KeyValueRow,
  MetricCell,
  MetricTile,
  SalesPurchaseChart,
} from '@/components/dashboard/dashboard-metrics'

export default async function DashboardPage() {
  const t = await getTranslations('dashboard')

  const metrics = {
    sales: {
      totalSales: 786,
      revenue: 17584,
      cost: 12487,
      profit: 5097,
    },
    purchase: {
      noOfPurchase: 45,
      cancelOrder: 4,
      cost: 786,
      returns: 7,
    },
    inventory: {
      quantityInHand: 214,
      willBeReceived: 44,
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
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-gray-900">
          <div className="bg-brand-50 text-brand-900 flex h-9 w-9 items-center justify-center rounded-xl">
            <Box className="h-4 w-4" />
          </div>
          <h1 className="text-xl font-semibold">{t('nav.dashboard')}</h1>
        </div>

        <DashboardFilters />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="rounded-2xl border border-gray-200/70 bg-white shadow-sm">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-0">
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
          <CardContent className="pt-4">
            <div className="grid grid-cols-2">
              <MetricCell
                icon={<ShoppingBag className="h-4 w-4" />}
                iconClassName="bg-sky-50 text-sky-600"
                label={t('cards.totalSales')}
                value={String(metrics.sales.totalSales)}
                className="border-r border-gray-200/70 pb-4"
              />
              <MetricCell
                icon={<ArrowUpRight className="h-4 w-4" />}
                iconClassName="bg-amber-50 text-amber-600"
                label={t('cards.revenue')}
                value={String(metrics.sales.revenue)}
                className="pb-4"
              />

              <div className="col-span-2 h-px w-full bg-gray-200/70" />

              <MetricCell
                icon={<ArrowDownRight className="h-4 w-4" />}
                iconClassName="bg-rose-50 text-rose-600"
                label={t('cards.cost')}
                value={String(metrics.sales.cost)}
                className="border-r border-gray-200/70 pt-4"
              />
              <MetricCell
                icon={<Banknote className="h-4 w-4" />}
                iconClassName="bg-emerald-50 text-emerald-600"
                label={t('cards.profit')}
                value={String(metrics.sales.profit)}
                className="pt-4"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-gray-200/70 bg-white shadow-sm">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-0">
            <div>
              <CardTitle className="text-sm font-semibold text-gray-900">{t('cards.purchaseOverview')}</CardTitle>
              <div className="mt-1 text-xs text-gray-500">{t('cards.purchaseSubtitle')}</div>
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
          <CardContent className="pt-4">
            <div className="grid grid-cols-2">
              <MetricCell
                icon={<Package className="h-4 w-4" />}
                iconClassName="bg-violet-50 text-violet-600"
                label={t('cards.noOfPurchase')}
                value={String(metrics.purchase.noOfPurchase)}
                className="border-r border-gray-200/70 pb-4"
              />
              <MetricCell
                icon={<RotateCcw className="h-4 w-4" />}
                iconClassName="bg-rose-50 text-rose-600"
                label={t('cards.cancelOrder')}
                value={String(metrics.purchase.cancelOrder).padStart(2, '0')}
                className="pb-4"
              />

              <div className="col-span-2 h-px w-full bg-gray-200/70" />

              <MetricCell
                icon={<ArrowDownRight className="h-4 w-4" />}
                iconClassName="bg-amber-50 text-amber-600"
                label={t('cards.cost')}
                value={String(metrics.purchase.cost)}
                className="border-r border-gray-200/70 pt-4"
              />
              <MetricCell
                icon={<RotateCcw className="h-4 w-4" />}
                iconClassName="bg-indigo-50 text-indigo-600"
                label={t('cards.returns')}
                value={String(metrics.purchase.returns).padStart(2, '0')}
                className="pt-4"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="rounded-2xl border border-gray-200/70 bg-white shadow-sm">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-0">
            <CardTitle className="text-sm font-semibold text-gray-900">{t('cards.inventorySummary')}</CardTitle>
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
              icon={<Box className="h-4 w-4" />}
              iconClassName="bg-emerald-50 text-emerald-600"
              label={t('cards.quantityInHand')}
              value={String(metrics.inventory.quantityInHand)}
            />
            <MetricTile
              icon={<ArrowUpRight className="h-4 w-4" />}
              iconClassName="bg-orange-50 text-orange-600"
              label={t('cards.willBeReceived')}
              value={String(metrics.inventory.willBeReceived)}
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
              iconClassName="bg-emerald-50 text-emerald-600"
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
              <span className="h-2 w-2 rounded-full bg-sky-500" />
              <span>{t('cards.sales')}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-orange-400" />
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
