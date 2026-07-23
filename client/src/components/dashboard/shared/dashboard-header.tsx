'use client'

import { useState } from 'react'
import { usePathname } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { RiMenuLine, RiNotification3Line, RiSearch2Line } from '@remixicon/react'
import * as Button from '@/components/alignui/button'
import * as Input from '@/components/alignui/input'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { DashboardNavContent } from '@/components/dashboard/shared/dashboard-sidebar'

export function DashboardHeader() {
  const t = useTranslations('dashboard')
  const pathname = usePathname()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

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
              : pathname.startsWith('/dashboard/promotions')
                ? t('nav.promotions')
                : t('nav.dashboard')

  const searchPlaceholder = t('header.searchPlaceholder')

  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between gap-4 border-b border-stroke-soft-200/80 bg-bg-white-0/90 px-4 backdrop-blur-md sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
          <Button.Root
            variant="neutral"
            mode="stroke"
            size="xsmall"
            type="button"
            className="shrink-0 md:hidden"
            aria-label={t('header.openMenuAria')}
            aria-expanded={mobileNavOpen}
            aria-controls="dashboard-mobile-nav"
            onClick={() => setMobileNavOpen(true)}
          >
            <Button.Icon as={RiMenuLine} />
          </Button.Root>
          <SheetContent
            id="dashboard-mobile-nav"
            side="left"
            className="w-[min(100%,20rem)] bg-bg-white-0 p-0 sm:max-w-sm"
          >
            <SheetHeader className="sr-only">
              <SheetTitle>{t('sidebar.navAria')}</SheetTitle>
            </SheetHeader>
            <DashboardNavContent
              idPrefix="mobile-nav"
              collapsed={false}
              showBrand
              showCollapseToggle={false}
              onNavigate={() => setMobileNavOpen(false)}
            />
          </SheetContent>
        </Sheet>
        <div className="min-w-0">
          <p className="text-paragraph-xs uppercase tracking-[0.08em] text-text-soft-400">
            {t('sidebar.brand')}
          </p>
          <p className="truncate text-label-md text-text-strong-950">{title}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="hidden w-64 md:block">
          <Input.Root>
            <Input.Wrapper>
              <Input.Icon as={RiSearch2Line} />
              <Input.Input
                placeholder={searchPlaceholder}
                aria-label={t('header.searchAria')}
              />
            </Input.Wrapper>
          </Input.Root>
        </div>
        <Button.Root
          variant="neutral"
          mode="stroke"
          size="xsmall"
          type="button"
          aria-label={t('header.notificationsAria')}
        >
          <Button.Icon as={RiNotification3Line} />
        </Button.Root>
      </div>
    </header>
  )
}
