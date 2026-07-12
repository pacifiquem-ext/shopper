'use client'

import { useEffect, useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TurningZeroLoader } from '@/components/ui/turning-zero-loader'
import { storeSettingsService } from '@/services/store-settings.service'

export default function SubscriptionPage() {
  const t = useTranslations('dashboard')
  const ts = useTranslations('dashboard.subscriptionPage')
  const [storeName, setStoreName] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    storeSettingsService
      .getSettings()
      .then((res) => {
        const data = (res?.data as any)?.data ?? res?.data
        if (data?.displayName) setStoreName(data.displayName)
      })
      .finally(() => setIsLoading(false))
  }, [])

  const basicFeatures = useMemo(
    () =>
      [
        ts('features.upTo50'),
        ts('features.orderManagement'),
        ts('features.deliveryZones'),
        ts('features.standardTheme'),
      ] as const,
    [ts],
  )

  const proFeatures = useMemo(
    () =>
      [
        ts('features.advancedAnalytics'),
        ts('features.customerManagement'),
        ts('features.discounts'),
        ts('features.loyalty'),
        ts('features.marketing'),
        ts('features.customReports'),
        ts('features.rankingBoost'),
        ts('features.themeCustomization'),
      ] as const,
    [ts],
  )

  return (
    <div className="flex w-full max-w-6xl flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-text-strong-950">{t('nav.subscription')}</h1>
        <p className="mt-2 text-text-soft-400">
          {isLoading ? (
            <TurningZeroLoader size="sm" className="mt-2" />
          ) : storeName ? (
            ts('managingPlanFor', { storeName })
          ) : (
            ts('managePlan')
          )}
        </p>
      </div>

      <div className="mt-4 grid max-w-5xl gap-8 md:grid-cols-2 lg:grid-cols-3">
        <Card className="relative flex flex-col overflow-hidden border-2 border-stroke-soft-200 shadow-sm">
          <div className="absolute top-0 right-0 rounded-bl-lg bg-bg-weak-50 px-3 py-1 text-xs font-bold text-text-sub-600">
            {ts('current')}
          </div>
          <CardHeader>
            <CardTitle className="text-xl">{ts('basic')}</CardTitle>
            <CardDescription>{ts('basicDesc')}</CardDescription>
            <div className="mt-4 text-3xl font-bold">{ts('free')}</div>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col">
            <ul className="flex-1 space-y-3 text-sm text-text-sub-600">
              {basicFeatures.map((feature) => (
                <li key={feature} className="flex items-center gap-2">
                  <CheckCircle2 className="text-primary-base h-4 w-4 shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-primary-base relative z-10 flex transform flex-col overflow-hidden border-2 bg-white shadow-xl md:-translate-y-2 md:scale-105 lg:col-span-2">
          <div className="absolute top-0 right-0 bg-linear-to-r from-amber-400 to-amber-600 px-4 py-1 text-xs font-bold text-white shadow-sm">
            {ts('recommended')}
          </div>
          <CardHeader className="pb-4">
            <CardTitle className="text-primary-base text-2xl">{ts('pro')}</CardTitle>
            <CardDescription className="text-primary-darker/80 text-base">{ts('proDesc')}</CardDescription>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-primary-base text-4xl font-extrabold">{ts('proPrice')}</span>
              <span className="text-primary-darker/70 text-sm font-medium">{ts('perMonth')}</span>
            </div>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col pt-0">
            <div className="bg-primary-alpha-10 my-4 h-px w-full" />
            <div className="mb-8 grid flex-1 gap-3 text-sm font-medium text-text-sub-600 sm:grid-cols-2">
              {proFeatures.map((feature) => (
                <div key={feature} className="flex items-start gap-2">
                  <CheckCircle2 className="text-primary-base mt-0.5 h-4 w-4 shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            <Button
              size="lg"
              disabled
              onClick={() => toast.info(ts('comingSoon'))}
              className="text-md shadow-regular-md mt-auto w-full rounded-xl bg-primary-darker py-6 text-white shadow-md opacity-70"
            >
              {ts('upgradeToPro')} — {ts('comingSoon')}
            </Button>
            <p className="text-primary-darker/60 mt-3 text-center text-xs font-medium">
              {ts('billingNotLive')}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
