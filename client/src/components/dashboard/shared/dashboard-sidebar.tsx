'use client'

import { Link, usePathname, useRouter } from '@/i18n/navigation'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import {
  LayoutDashboard,
  Package,
  Layers,
  Settings,
  Boxes,
  LogOut,
  Store,
  Building2,
  Palette,
  Mail,
  Truck,
  CreditCard,
  ChevronDown,
  ChevronRight,
} from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'
import { useState, useEffect } from 'react'

export function DashboardSidebar() {
  const t = useTranslations('dashboard')
  const pathname = usePathname()
  const router = useRouter()
  const { logout, user } = useAuthStore()
  
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
    { href: '/dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
    { href: '/dashboard/inventory', label: t('nav.inventory'), icon: Boxes },
    { href: '/dashboard/products', label: t('nav.products'), icon: Package },
    { href: '/dashboard/orders', label: t('nav.orders'), icon: Layers },
  ]

  const storeSettingsSubmenu = [
    { href: '/dashboard/store-settings?tab=business', label: 'Business Info', icon: Building2, tab: 'business' },
    { href: '/dashboard/store-settings?tab=branding', label: 'Branding', icon: Palette, tab: 'branding' },
    { href: '/dashboard/store-settings?tab=contact', label: 'Contact & About', icon: Mail, tab: 'contact' },
    { href: '/dashboard/store-settings?tab=delivery', label: 'Delivery Zones', icon: Truck, tab: 'delivery' },
    { href: '/dashboard/store-settings?tab=subscription', label: 'Subscription', icon: CreditCard, tab: 'subscription' },
  ]

  return (
    <aside className={cn(
      "relative hidden shrink-0 flex-col border-r border-gray-200 bg-white transition-all duration-300 md:flex",
      isSidebarCollapsed ? "w-[72px]" : "w-[280px]"
    )}>
      <div className="flex h-full flex-col">
        <div className="flex items-center gap-3 px-6 pt-5 pb-4">
          <div className="bg-brand-50 text-brand-900 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
            <Store className="h-5 w-5" />
          </div>
          {!isSidebarCollapsed && (
            <div className="leading-tight">
              <div className="text-sm font-semibold text-gray-900">{t('sidebar.brand')}</div>
              <div className="text-xs text-gray-500">{t('sidebar.subtitle')}</div>
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col px-4 pt-6">
          <button
            type="button"
            onClick={toggleSidebar}
            className="mb-4 flex items-center justify-center rounded-lg border border-gray-200 bg-white p-2 text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-900"
            title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <ChevronRight className={cn(
              "h-4 w-4 transition-transform duration-300",
              !isSidebarCollapsed && "rotate-180"
            )} />
          </button>

          <nav className="flex flex-col gap-1">
          {mainNavItems.map((item) => {
            const isActive = pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-brand-50 text-brand-900'
                    : 'text-gray-700 hover:bg-brand-50 hover:text-brand-900',
                  isSidebarCollapsed && 'justify-center'
                )}
                title={isSidebarCollapsed ? item.label : undefined}
              >
                <span
                  className={cn(
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border',
                    isActive
                      ? 'border-brand-200 bg-white text-brand-900'
                      : 'border-gray-200 bg-white text-gray-500 group-hover:text-brand-900'
                  )}
                >
                  <item.icon className="h-4 w-4" />
                </span>
                {!isSidebarCollapsed && <span className="truncate">{item.label}</span>}
              </Link>
            )
          })}

          {/* Store Settings Submenu */}
          {!isSidebarCollapsed && (
            <div className="mt-1">
              <button
                type="button"
                onClick={toggleStoreSettings}
                className={cn(
                  'group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                  pathname.startsWith('/dashboard/store-settings')
                    ? 'bg-brand-50 text-brand-900'
                    : 'text-gray-700 hover:bg-brand-50 hover:text-brand-900'
                )}
              >
                <span
                  className={cn(
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border',
                    pathname.startsWith('/dashboard/store-settings')
                      ? 'border-brand-200 bg-white text-brand-900'
                      : 'border-gray-200 bg-white text-gray-500 group-hover:text-brand-900'
                  )}
                >
                  <Settings className="h-4 w-4" />
                </span>
                <span className="flex-1 truncate text-left">{t('nav.storeSettings')}</span>
                {isStoreSettingsOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>

              {isStoreSettingsOpen && (
                <div className="ml-3 mt-1 space-y-1 border-l-2 border-gray-100 pl-3">
                  {storeSettingsSubmenu.map((item) => {
                    const isActive = pathname === '/dashboard/store-settings' && 
                      (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('tab') === item.tab)

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                          isActive
                            ? 'bg-brand-50 text-brand-900'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        )}
                      >
                        <item.icon className={cn('h-4 w-4', isActive ? 'text-brand-900' : 'text-gray-400')} />
                        <span className="truncate">{item.label}</span>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Collapsed Store Settings - Single Icon */}
          {isSidebarCollapsed && (
            <Link
              href="/dashboard/store-settings?tab=business"
              className={cn(
                'group flex items-center justify-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                pathname.startsWith('/dashboard/store-settings')
                  ? 'bg-brand-50 text-brand-900'
                  : 'text-gray-700 hover:bg-brand-50 hover:text-brand-900'
              )}
              title={t('nav.storeSettings')}
            >
              <span
                className={cn(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border',
                  pathname.startsWith('/dashboard/store-settings')
                    ? 'border-brand-200 bg-white text-brand-900'
                    : 'border-gray-200 bg-white text-gray-500 group-hover:text-brand-900'
                )}
              >
                <Settings className="h-4 w-4" />
              </span>
            </Link>
          )}
          </nav>
        </div>

        <div className="px-4 pb-6">
          <div className="border-t border-gray-200 pt-4">
            <button
              type="button"
              onClick={handleLogout}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-gray-700 transition-colors hover:bg-brand-50 hover:text-brand-900",
                isSidebarCollapsed && "justify-center"
              )}
              title={isSidebarCollapsed ? t('nav.logout') : undefined}
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500">
                <LogOut className="h-4 w-4" />
              </span>
              {!isSidebarCollapsed && <span>{t('nav.logout')}</span>}
            </button>
          </div>
        </div>
      </div>
    </aside>
  )
}
