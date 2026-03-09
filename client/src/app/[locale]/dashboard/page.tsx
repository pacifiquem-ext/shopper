import { getTranslations } from 'next-intl/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Package, Layers, Box, AlertCircle, Banknote, Lock } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { Button } from '@/components/ui/button'

export default async function DashboardPage() {
  const t = await getTranslations('dashboard')

  // Mock data for the MVP dashboard
  const metrics = {
    totalProducts: 124,
    totalOrders: 45,
    totalStock: 850,
    outOfStock: 12,
    totalRevenue: '2,450,000 RWF',
  }

  return (
    <div className="flex w-full max-w-6xl flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">{t('nav.dashboard')}</h1>
        <p className="mt-2 text-gray-500">Quick overview of store activity.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-5">
        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              {t('metrics.totalProducts')}
            </CardTitle>
            <div className="bg-brand-50 text-brand-600 flex h-8 w-8 items-center justify-center rounded-full">
              <Package className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{metrics.totalProducts}</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              {t('metrics.totalOrders')}
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <Layers className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{metrics.totalOrders}</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              {t('metrics.totalStock')}
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <Box className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{metrics.totalStock}</div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-red-50/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-600">
              {t('metrics.outOfStock')}
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-red-600">
              <AlertCircle className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700">{metrics.outOfStock}</div>
          </CardContent>
        </Card>

        <Card className="bg-brand-700 border-0 text-white shadow-sm">
          <CardHeader className="text-brand-100 flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-brand-100 text-sm font-medium">
              {t('metrics.totalRevenue')}
            </CardTitle>
            <div className="bg-brand-600 flex h-8 w-8 items-center justify-center rounded-full text-white">
              <Banknote className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalRevenue}</div>
          </CardContent>
        </Card>
      </div>

      {/* Blurred "Upgrade to Pro" Card */}
      <div className="relative mt-4 flex h-[300px] w-full max-w-4xl items-center justify-center overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        {/* Fake chart background to make it look like there's hidden analytics */}
        <div className="pointer-events-none absolute inset-0 flex items-end justify-between px-12 pt-16 pb-8 opacity-20 blur-md select-none">
          <div className="bg-brand-300 h-[40%] w-16 rounded-t-md"></div>
          <div className="bg-brand-400 h-[60%] w-16 rounded-t-md"></div>
          <div className="bg-brand-300 h-[50%] w-16 rounded-t-md"></div>
          <div className="bg-brand-500 h-[80%] w-16 rounded-t-md"></div>
          <div className="bg-brand-400 h-[70%] w-16 rounded-t-md"></div>
          <div className="bg-brand-600 h-[95%] w-16 rounded-t-md"></div>
        </div>

        {/* Actual Overlaid Content */}
        <div className="relative z-10 flex max-w-md flex-col items-center justify-center rounded-xl border border-white bg-white/80 p-8 text-center shadow-xl backdrop-blur-sm">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-br from-amber-400 to-amber-600 text-white shadow-lg ring-4 ring-amber-100">
            <Lock size={32} strokeWidth={2.5} />
          </div>
          <h2 className="mb-2 text-2xl font-bold tracking-tight text-gray-900">
            {t('upgradeCard.title')}
          </h2>
          <p className="mb-8 max-w-[280px] text-gray-500">{t('upgradeCard.description')}</p>
          <Button
            asChild
            size="lg"
            className="bg-brand-700 hover:bg-brand-800 text-md w-full rounded-full py-6 font-bold text-white shadow-md"
          >
            <Link href="/dashboard/subscription">{t('upgradeCard.button')}</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
