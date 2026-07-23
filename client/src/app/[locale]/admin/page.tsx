'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { Card } from '@/components/alignui/card'
import * as Button from '@/components/alignui/button'
import { adminService, type AdminOverviewApi } from '@/services/admin.service'

export default function AdminOverviewPage() {
  const t = useTranslations('admin')
  const [data, setData] = useState<AdminOverviewApi | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await adminService.getOverview()
        const payload = (res as { data?: AdminOverviewApi })?.data ?? (res as unknown as AdminOverviewApi)
        if (!cancelled) setData(payload)
      } catch {
        if (!cancelled) setError(true)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <div>
        <h1 className="text-title-h5 text-text-strong-950">{t('overviewTitle')}</h1>
        <p className="mt-1 text-paragraph-sm text-text-sub-600">{t('overviewSubtitle')}</p>
      </div>

      {error ? (
        <Card className="p-6">
          <p className="text-paragraph-sm text-text-sub-600">{t('overviewUnavailable')}</p>
          <Button.Root asChild variant="primary" size="small" className="mt-4">
            <Link href="/admin/stores">{t('nav.stores')}</Link>
          </Button.Root>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {(
            [
              ['storesTotal', data?.storesTotal],
              ['storesPending', data?.storesPending],
              ['productsTotal', data?.productsTotal],
              ['ordersTotal', data?.ordersTotal],
            ] as const
          ).map(([key, value]) => (
            <Card key={key} className="p-4">
              <p className="text-label-xs uppercase tracking-[0.1em] text-text-sub-600">
                {t(`metrics.${key}`)}
              </p>
              <p className="mt-2 text-title-h5 text-text-strong-950">
                {value == null ? '—' : value}
              </p>
            </Card>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <Button.Root asChild variant="neutral" mode="stroke">
          <Link href="/admin/stores">{t('nav.stores')}</Link>
        </Button.Root>
        <Button.Root asChild variant="neutral" mode="stroke">
          <Link href="/admin/promotions">{t('nav.promotions')}</Link>
        </Button.Root>
        <Button.Root asChild variant="neutral" mode="stroke">
          <Link href="/admin/reviews">{t('nav.reviews')}</Link>
        </Button.Root>
        <Button.Root asChild variant="neutral" mode="stroke">
          <Link href="/admin/categories">{t('nav.categories')}</Link>
        </Button.Root>
      </div>
    </div>
  )
}
