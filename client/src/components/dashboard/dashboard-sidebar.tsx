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
  User,
} from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'

export function DashboardSidebar() {
  const t = useTranslations('dashboard.nav')
  const pathname = usePathname()
  const router = useRouter()
  const { logout, user } = useAuthStore()

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  const mainNavItems = [
    { href: '/dashboard', label: t('dashboard'), icon: LayoutDashboard },
    {
      href: '/dashboard/inventory',
      label: t('inventory', { fallback: 'Inventory' }),
      icon: Boxes,
    },
    { href: '/dashboard/products', label: t('products'), icon: Package },
    { href: '/dashboard/orders', label: t('orders'), icon: Layers },
    { href: '/dashboard/delivery-settings', label: t('deliverySettings'), icon: Truck },
    { href: '/dashboard/subscription', label: t('subscription'), icon: CreditCard },
    { href: '/dashboard/store-settings', label: t('storeSettings'), icon: Settings },
  ]

  // The main layout background color will be bg-brand-50, which matches the right side content area.
  // The sidebar is bg-brand-800, with geometric shapes like AuthCard.

  return (
    <aside className="bg-brand-800 relative hidden w-[280px] shrink-0 flex-col overflow-hidden shadow-2xl md:flex">
      {/* Abstract geometric background from AuthCard */}
      <div className="bg-brand-500 pointer-events-none absolute top-0 left-0 h-[150%] w-[150%] origin-top-left -translate-x-10 translate-y-10 -rotate-45 opacity-50 shadow-xl" />
      <div className="bg-brand-600 pointer-events-none absolute top-0 left-0 h-[150%] w-[150%] origin-top-left -translate-x-20 translate-y-40 -rotate-45 opacity-50 shadow-xl" />
      <div className="bg-brand-700 pointer-events-none absolute top-0 left-0 h-[150%] w-[150%] origin-top-left -translate-x-30 translate-y-72 -rotate-45 opacity-50 shadow-xl" />

      {/* Profile Section inside Sidebar */}
      <div className="relative z-20 flex flex-col items-center justify-center pt-12 pb-14">
        <div className="from-brand-500 to-brand-700 flex h-20 w-20 items-center justify-center rounded-full bg-linear-to-br text-white shadow-lg ring-4 ring-white/20">
          <User size={40} className="drop-shadow-sm" />
        </div>
        <div className="mt-4 text-center">
          <h3 className="max-w-[260px] truncate px-4 text-xl font-bold text-white">
            {user?.fullName || 'Store Owner'}
          </h3>
        </div>
      </div>

      {/* Navigation */}
      <nav className="relative z-20 flex w-full flex-1 flex-col justify-start space-y-2 overflow-y-auto py-4 pb-8">
        <div className="flex w-full flex-1 flex-col space-y-2">
          {mainNavItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'group relative ml-4 flex w-[calc(100%-1rem)] items-center rounded-l-full py-4 pl-8 text-base font-bold tracking-wider transition-all duration-300',
                  isActive
                    ? 'text-foreground bg-white shadow-[-10px_0_20px_-5px_rgba(0,0,0,0.1)]'
                    : 'text-white hover:bg-white/10'
                )}
              >
                <item.icon className={cn('mr-4 h-5 w-5', isActive ? 'text-brand-700' : '')} />
                {item.label}
                {isActive && (
                  <>
                    <div className="absolute -top-4 right-0 h-4 w-4 rounded-br-full bg-transparent shadow-[10px_10px_0_10px_white] dark:shadow-[10px_10px_0_10px_var(--card)]" />
                    <div className="absolute right-0 -bottom-4 h-4 w-4 rounded-tr-full bg-transparent shadow-[10px_-10px_0_10px_white] dark:shadow-[10px_-10px_0_10px_var(--card)]" />
                  </>
                )}
              </Link>
            )
          })}
        </div>

        <div className="mt-auto flex w-full flex-col space-y-2 pt-8">
          <button
            onClick={handleLogout}
            className="group relative ml-4 flex w-[calc(100%-1rem)] items-center rounded-l-full py-4 pl-8 text-left text-base font-bold tracking-wider text-white transition-all duration-300 hover:bg-white/10"
          >
            <LogOut className="mr-4 h-5 w-5" />
            {t('logout')}
          </button>
        </div>
      </nav>
    </aside>
  )
}
