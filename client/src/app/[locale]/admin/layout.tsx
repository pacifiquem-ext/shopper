'use client'

import { useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { RiDashboardLine, RiStore2Line, RiCoupon3Line, RiStarLine, RiFolderLine } from '@remixicon/react'

import { Link, usePathname, useRouter } from '@/i18n/navigation'
import { useAuthStore } from '@/store/auth.store'
import { cn } from '@/lib/utils'
import * as Button from '@/components/alignui/button'

const NAV = [
  { href: '/admin', labelKey: 'overview' as const, icon: RiDashboardLine, exact: true },
  { href: '/admin/stores', labelKey: 'stores' as const, icon: RiStore2Line },
  { href: '/admin/promotions', labelKey: 'promotions' as const, icon: RiCoupon3Line },
  { href: '/admin/reviews', labelKey: 'reviews' as const, icon: RiStarLine },
  { href: '/admin/categories', labelKey: 'categories' as const, icon: RiFolderLine },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const t = useTranslations('admin')
  const { user, accessToken } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()
  const isAdmin = user?.role === 'PLATFORM_ADMIN'

  useEffect(() => {
    if (accessToken === undefined) return
    if (!accessToken) {
      router.replace('/login')
      return
    }
    if (user && !isAdmin) {
      router.replace('/dashboard')
    }
  }, [accessToken, user, isAdmin, router])

  if (!accessToken || !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-weak-50 px-4">
        <p className="text-paragraph-sm text-text-sub-600">{t('gateChecking')}</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-bg-weak-50 text-text-strong-950">
      <aside className="hidden w-60 shrink-0 border-r border-stroke-soft-200 bg-bg-white-0 md:flex md:flex-col">
        <div className="border-b border-stroke-soft-200 px-4 py-5">
          <p className="text-label-sm text-text-strong-950">{t('title')}</p>
          <p className="text-paragraph-xs text-text-sub-600">{t('subtitle')}</p>
        </div>
        <nav className="flex flex-1 flex-col gap-0.5 p-3" aria-label={t('navAria')}>
          {NAV.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`)
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2 rounded-10 px-3 py-2 text-label-sm transition-colors',
                  active
                    ? 'bg-primary-alpha-10 text-primary-base'
                    : 'text-text-sub-600 hover:bg-bg-weak-50 hover:text-text-strong-950',
                )}
              >
                <Icon className="size-4 shrink-0" aria-hidden />
                {t(`nav.${item.labelKey}`)}
              </Link>
            )
          })}
        </nav>
        <div className="border-t border-stroke-soft-200 p-3">
          <Button.Root asChild variant="neutral" mode="stroke" size="small" className="w-full">
            <Link href="/dashboard">{t('backToDashboard')}</Link>
          </Button.Root>
        </div>
      </aside>
      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-2 overflow-x-auto border-b border-stroke-soft-200 bg-bg-white-0 px-4 py-3 md:hidden">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="shrink-0 rounded-full border border-stroke-soft-200 px-3 py-1.5 text-label-xs text-text-sub-600"
            >
              {t(`nav.${item.labelKey}`)}
            </Link>
          ))}
        </header>
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  )
}
