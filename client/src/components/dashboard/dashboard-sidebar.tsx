'use client'

import { Link, usePathname, useRouter } from '@/i18n/navigation'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import {
  LayoutDashboard,
  Package,
  Layers,
  Truck,
  CreditCard,
  Settings,
  Boxes,
  LogOut,
  Store,
} from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'

export function DashboardSidebar() {
  const t = useTranslations('dashboard')
  const pathname = usePathname()
  const router = useRouter()
  const { logout, user } = useAuthStore()

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  const mainNavItems = [
    { href: '/dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
    { href: '/dashboard/inventory', label: t('nav.inventory'), icon: Boxes },
    { href: '/dashboard/products', label: t('nav.products'), icon: Package },
    { href: '/dashboard/orders', label: t('nav.orders'), icon: Layers },
    { href: '/dashboard/delivery-settings', label: t('nav.deliverySettings'), icon: Truck },
    { href: '/dashboard/subscription', label: t('nav.subscription'), icon: CreditCard },
    { href: '/dashboard/store-settings', label: t('nav.storeSettings'), icon: Settings },
  ]

  return (
    <aside className="relative hidden w-[280px] shrink-0 flex-col border-r border-gray-200 bg-white md:flex">
      <div className="flex h-full flex-col">
        <div className="flex items-center gap-3 px-6 pt-5 pb-4">
          <div className="bg-brand-50 text-brand-900 flex h-10 w-10 items-center justify-center rounded-xl">
            <Store className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold text-gray-900">{t('sidebar.brand')}</div>
            <div className="text-xs text-gray-500">{t('sidebar.subtitle')}</div>
          </div>
        </div>

        <div className="flex flex-1 flex-col px-4 pt-6">
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
                    : 'text-gray-700 hover:bg-brand-50 hover:text-brand-900'
                )}
              >
                <span
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-xl border',
                    isActive
                      ? 'border-brand-200 bg-white text-brand-900'
                      : 'border-gray-200 bg-white text-gray-500 group-hover:text-brand-900'
                  )}
                >
                  <item.icon className="h-4 w-4" />
                </span>
                <span className="truncate">{item.label}</span>
              </Link>
            )
          })}
          </nav>
        </div>

        <div className="px-4 pb-6">
          <div className="border-t border-gray-200 pt-4">
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-gray-700 transition-colors hover:bg-brand-50 hover:text-brand-900"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500">
                <LogOut className="h-4 w-4" />
              </span>
              <span>{t('nav.logout')}</span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  )
}
