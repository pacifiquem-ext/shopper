'use client'

import { Link, usePathname, useRouter } from '@/i18n/navigation'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import { useSearchParams } from 'next/navigation'
import {
  RiDashboardLine,
  RiBox3Line,
  RiShoppingBag3Line,
  RiSettings4Line,
  RiStackLine,
  RiLogoutBoxRLine,
  RiStore2Line,
  RiBuilding2Line,
  RiPaletteLine,
  RiMailLine,
  RiTruckLine,
  RiBankCardLine,
  RiArrowRightSLine,
  RiMenuFoldLine,
  RiMenuUnfoldLine,
  RiMoneyDollarCircleLine,
} from '@remixicon/react'
import { useAuthStore } from '@/store/auth.store'
import { useState, useEffect } from 'react'
import * as Button from '@/components/alignui/button'

export function DashboardSidebar() {
  const t = useTranslations('dashboard')
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()
  const { logout, user } = useAuthStore()

  const storeSettingsTab =
    pathname === '/dashboard/store-settings'
      ? (searchParams.get('tab') ?? 'business')
      : null

  const [isStoreSettingsOpen, setIsStoreSettingsOpen] = useState(true)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  useEffect(() => {
    const savedStoreSettingsState = localStorage.getItem('storeSettingsOpen')
    if (savedStoreSettingsState !== null) {
      setIsStoreSettingsOpen(savedStoreSettingsState === 'true')
    }
    const savedSidebarState = localStorage.getItem('sidebarCollapsed')
    if (savedSidebarState !== null) {
      setIsSidebarCollapsed(savedSidebarState === 'true')
    }
  }, [])

  const toggleStoreSettings = () => {
    const newState = !isStoreSettingsOpen
    setIsStoreSettingsOpen(newState)
    localStorage.setItem('storeSettingsOpen', String(newState))
  }

  const toggleSidebar = () => {
    const newState = !isSidebarCollapsed
    setIsSidebarCollapsed(newState)
    localStorage.setItem('sidebarCollapsed', String(newState))
  }

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  const mainNavItems = [
    { href: '/dashboard', label: t('nav.dashboard'), icon: RiDashboardLine },
    { href: '/dashboard/products', label: t('nav.products'), icon: RiShoppingBag3Line },
    { href: '/dashboard/inventory', label: t('nav.inventory'), icon: RiBox3Line },
    { href: '/dashboard/orders', label: t('nav.orders'), icon: RiStackLine },
    { href: '/dashboard/payments', label: t('nav.payments'), icon: RiMoneyDollarCircleLine },
  ]

  const storeSettingsSubmenu = [
    { href: '/dashboard/store-settings?tab=business', label: t('nav.businessInfo', { defaultValue: 'Business' }), icon: RiBuilding2Line, tab: 'business' },
    { href: '/dashboard/store-settings?tab=branding', label: t('nav.branding', { defaultValue: 'Branding' }), icon: RiPaletteLine, tab: 'branding' },
    { href: '/dashboard/store-settings?tab=contact', label: t('nav.contact', { defaultValue: 'Contact' }), icon: RiMailLine, tab: 'contact' },
    { href: '/dashboard/store-settings?tab=delivery', label: t('nav.delivery', { defaultValue: 'Delivery' }), icon: RiTruckLine, tab: 'delivery' },
    { href: '/dashboard/store-settings?tab=subscription', label: t('nav.subscription'), icon: RiBankCardLine, tab: 'subscription' },
  ]

  return (
    <aside
      className={cn(
        'relative hidden shrink-0 flex-col border-r border-stroke-soft-200 bg-bg-white-0 transition-[width] duration-200 md:flex',
        isSidebarCollapsed ? 'w-[72px]' : 'w-[260px]',
      )}
    >
      <div className="flex h-full flex-col">
        <div className={cn('flex items-center gap-3 px-4 pt-5 pb-4', isSidebarCollapsed && 'justify-center px-2')}>
          <div className="flex size-10 shrink-0 items-center justify-center rounded-10 bg-primary-alpha-10 text-primary-base">
            <RiStore2Line className="size-5" />
          </div>
          {!isSidebarCollapsed && (
            <div className="min-w-0 leading-tight">
              <div className="truncate text-label-sm text-text-strong-950">{t('sidebar.brand')}</div>
              <div className="truncate text-paragraph-xs text-text-sub-600">{t('sidebar.subtitle')}</div>
            </div>
          )}
        </div>

        <div className="px-3 pb-2">
          <Button.Root
            variant="neutral"
            mode="stroke"
            size="xsmall"
            type="button"
            onClick={toggleSidebar}
            className="w-full"
            title={isSidebarCollapsed ? 'Expand' : 'Collapse'}
          >
            <Button.Icon as={isSidebarCollapsed ? RiMenuUnfoldLine : RiMenuFoldLine} />
            {!isSidebarCollapsed && <span>Collapse</span>}
          </Button.Root>
        </div>

        <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 pb-4">
          {mainNavItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'group flex items-center gap-2.5 rounded-10 px-2.5 py-2 text-label-sm transition duration-200',
                  isActive
                    ? 'bg-primary-alpha-10 text-primary-base'
                    : 'text-text-sub-600 hover:bg-bg-weak-50 hover:text-text-strong-950',
                  isSidebarCollapsed && 'justify-center px-0',
                )}
                title={isSidebarCollapsed ? item.label : undefined}
              >
                <item.icon className={cn('size-5 shrink-0', isActive ? 'text-primary-base' : 'text-text-soft-400 group-hover:text-text-sub-600')} />
                {!isSidebarCollapsed && <span className="truncate">{item.label}</span>}
              </Link>
            )
          })}

          {!isSidebarCollapsed && (
            <div className="mt-3">
              <button
                type="button"
                onClick={toggleStoreSettings}
                className={cn(
                  'flex w-full cursor-pointer items-center gap-2.5 rounded-10 px-2.5 py-2 text-label-sm transition duration-200',
                  pathname.startsWith('/dashboard/store-settings')
                    ? 'bg-primary-alpha-10 text-primary-base'
                    : 'text-text-sub-600 hover:bg-bg-weak-50 hover:text-text-strong-950',
                )}
              >
                <RiSettings4Line className="size-5 shrink-0" />
                <span className="flex-1 truncate text-left">{t('nav.storeSettings')}</span>
                <RiArrowRightSLine
                  className={cn('size-4 transition-transform', isStoreSettingsOpen && 'rotate-90')}
                />
              </button>
              {isStoreSettingsOpen && (
                <div className="mt-0.5 ml-3 space-y-0.5 border-l border-stroke-soft-200 pl-2">
                  {storeSettingsSubmenu.map((item) => {
                    const isActive = storeSettingsTab === item.tab
                    return (
                      <Link
                        key={item.tab}
                        href={item.href}
                        className={cn(
                          'flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-paragraph-sm transition duration-200',
                          isActive
                            ? 'bg-bg-weak-50 font-medium text-text-strong-950'
                            : 'text-text-sub-600 hover:bg-bg-weak-50 hover:text-text-strong-950',
                        )}
                      >
                        <item.icon className="size-4 shrink-0 text-text-soft-400" />
                        <span className="truncate">{item.label}</span>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </nav>

        <div className="mt-auto border-t border-stroke-soft-200 p-3">
          {!isSidebarCollapsed && user && (
            <div className="mb-2 truncate px-1 text-paragraph-xs text-text-sub-600">
              {user.fullName || user.phoneNumber}
            </div>
          )}
          <Button.Root
            variant="neutral"
            mode="stroke"
            size="small"
            type="button"
            onClick={handleLogout}
            className={cn(
              'w-full justify-start text-text-sub-600 hover:text-text-strong-950',
              isSidebarCollapsed && 'justify-center px-0',
            )}
          >
            <Button.Icon as={RiLogoutBoxRLine} />
            {!isSidebarCollapsed && <span>{t('sidebar.logout')}</span>}
          </Button.Root>
        </div>
      </div>
    </aside>
  )
}
