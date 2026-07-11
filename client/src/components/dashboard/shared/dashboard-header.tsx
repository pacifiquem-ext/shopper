'use client'

import { usePathname } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { RiNotification3Line, RiSearch2Line } from '@remixicon/react'
import * as Button from '@/components/alignui/button'
import * as Input from '@/components/alignui/input'

export function DashboardHeader() {
  const t = useTranslations('dashboard')
  const pathname = usePathname()

  const title =
    pathname.startsWith('/dashboard/products')
      ? t('nav.products')
      : pathname.startsWith('/dashboard/inventory')
        ? t('nav.inventory')
        : pathname.startsWith('/dashboard/orders')
          ? t('nav.orders')
          : pathname.startsWith('/dashboard/payments')
            ? t('nav.payments')
            : pathname.startsWith('/dashboard/store-settings')
              ? t('nav.storeSettings')
              : pathname.startsWith('/dashboard/subscription')
                ? t('nav.subscription')
                : t('nav.dashboard')

  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between gap-4 border-b border-stroke-soft-200 bg-bg-white-0/90 px-4 backdrop-blur-md sm:px-6 lg:px-8">
      <div className="min-w-0">
        <h1 className="truncate text-label-md text-text-strong-950">{title}</h1>
      </div>
      <div className="flex items-center gap-2">
        <div className="hidden w-64 md:block">
          <Input.Root>
            <Input.Wrapper>
              <Input.Icon as={RiSearch2Line} />
              <Input.Input placeholder={t('header.searchPlaceholder', { defaultValue: 'Search…' })} />
            </Input.Wrapper>
          </Input.Root>
        </div>
        <Button.Root variant="neutral" mode="stroke" size="xsmall" type="button" aria-label="Notifications">
          <Button.Icon as={RiNotification3Line} />
        </Button.Root>
      </div>
    </header>
  )
}
