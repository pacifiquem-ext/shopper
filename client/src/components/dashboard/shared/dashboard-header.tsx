'use client'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useAuthStore } from '@/store/auth.store'
import { Bell, ChevronDown, Search, Settings, User } from 'lucide-react'
import { NotificationListSkeleton } from '@/components/dashboard/shared/loading-placeholders'
import { cn } from '@/lib/utils'
import { useRouter, Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { useEffect, useMemo, useState } from 'react'
import { ordersService, type OrderNotificationApi } from '@/services/orders.service'

export function DashboardHeader() {
  const t = useTranslations('dashboard')
  const { user } = useAuthStore()
  const router = useRouter()

  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [notifications, setNotifications] = useState<OrderNotificationApi[]>([])
  const [notificationsLoading, setNotificationsLoading] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [lastNotifiedAt, setLastNotifiedAt] = useState<number>(0)

  const initials = (user?.fullName ?? 'User')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')

  const suggestions = useMemo(() => {
    const items = [
      { title: t('nav.dashboard'), subtitle: t('header.search.suggestions.dashboard') },
      { title: t('nav.inventory'), subtitle: t('header.search.suggestions.inventory') },
      { title: t('nav.products'), subtitle: t('header.search.suggestions.products') },
      { title: t('nav.orders'), subtitle: t('header.search.suggestions.orders') },
      { title: t('nav.storeSettings'), subtitle: t('header.search.suggestions.settings') },
    ]

    const q = searchQuery.trim().toLowerCase()
    if (!q) {
      return items
    }
    return items.filter((item) => item.title.toLowerCase().includes(q) || item.subtitle.toLowerCase().includes(q))
  }, [searchQuery, t])

  const beep = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = 880
      gain.gain.value = 0.04
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.09)
      setTimeout(() => ctx.close().catch(() => null), 120)
    } catch {
      // ignore (autoplay blocked / no audio support)
    }
  }

  const refreshNotifications = (opts?: { playSound?: boolean }) => {
    const playSound = opts?.playSound ?? false
    return ordersService
      .getNotifications(10)
      .then((res) => {
        const items = res?.data ?? []
        setUnreadCount(items.length)

        if (playSound && items.length > 0) {
          const latest = Math.max(...items.map((n) => new Date(n.createdAt).getTime()))
          const now = Date.now()
          // Only beep when we observe a newer notification and not too frequently.
          if (latest > lastNotifiedAt && now - lastNotifiedAt > 1500 && document.visibilityState === 'visible') {
            beep()
            setLastNotifiedAt(latest)
          }
        }

        return items
      })
      .catch(() => {
        setUnreadCount(0)
        return []
      })
  }

  // Poll unread notifications so the bell dot updates automatically.
  useEffect(() => {
    let cancelled = false
    refreshNotifications({ playSound: false }).catch(() => null)

    const id = window.setInterval(() => {
      if (cancelled) return
      refreshNotifications({ playSound: true }).catch(() => null)
    }, 15000)

    return () => {
      cancelled = true
      window.clearInterval(id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!isNotificationsOpen) return

    let cancelled = false
    setNotificationsLoading(true)

    refreshNotifications({ playSound: false })
      .then((res) => {
        if (cancelled) return
        const items = Array.isArray(res) ? res : []
        setNotifications(items)

        const ids = items.map((n) => n.id)
        if (ids.length) {
          // Mark as read after successful fetch so the dot clears.
          ordersService.markNotificationsRead(ids).catch(() => null)
          setUnreadCount(0)
        }
      })
      .catch(() => {
        if (!cancelled) setNotifications([])
      })
      .finally(() => {
        if (!cancelled) setNotificationsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [isNotificationsOpen])

  const hasUnread = unreadCount > 0

  return (
    <header className="sticky top-0 z-30 flex w-full items-center gap-6 border-b border-gray-200 bg-white px-8 py-4">
      <div className="flex w-full items-center justify-between gap-6">
        <div className="w-[220px]" />

        <Popover open={isSearchOpen} onOpenChange={setIsSearchOpen}>
          <PopoverAnchor asChild>
            <div className="relative w-full max-w-xl">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="search"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setIsSearchOpen(true)
                }}
                onFocus={() => setIsSearchOpen(true)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setIsSearchOpen(false)
                  }
                }}
                placeholder={t('header.searchPlaceholder')}
                className="focus-visible:ring-brand-500 w-full rounded-lg border-gray-200 bg-gray-50 pr-4 pl-10"
              />
            </div>
          </PopoverAnchor>
          <PopoverContent
            align="center"
            sideOffset={10}
            className="w-[560px] max-w-[90vw] border-gray-200 bg-white p-3 text-gray-900 shadow-md"
            onOpenAutoFocus={(e) => e.preventDefault()}
            onCloseAutoFocus={(e) => e.preventDefault()}
          >
            <div className="space-y-2">
              <div className="px-1 text-xs font-medium text-gray-500">{t('header.search.title')}</div>
              <div className="grid grid-cols-1 gap-2">
                {suggestions.map((item) => (
                  <button
                    key={item.title}
                    type="button"
                    className={cn(
                      'flex min-h-[72px] flex-col items-start justify-between rounded-xl border-2 p-4 text-left transition-all duration-200 hover:bg-gray-50 focus:outline-none',
                      'border-gray-200 bg-white hover:border-brand-200 hover:bg-brand-50'
                    )}
                  >
                    <div className="text-sm font-semibold text-gray-900">{item.title}</div>
                    <div className="text-xs text-gray-500">{item.subtitle}</div>
                  </button>
                ))}
              </div>
              {suggestions.length === 0 && (
                <div className="rounded-lg border border-gray-200 bg-white px-3 py-4 text-sm text-gray-600">
                  {t('header.search.empty')}
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>

        <div className="flex w-[320px] items-center justify-end gap-3">
          <Popover open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="relative flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
                aria-label={hasUnread ? `${t('header.notificationsAria')} (${unreadCount})` : t('header.notificationsAria')}
              >
                <Bell className="h-4 w-4" />
                {hasUnread ? (
                  <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-red-500" />
                ) : null}
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 border-gray-200 bg-white p-3 text-gray-900 shadow-md">
              <div className="space-y-2">
                <div className="text-sm font-semibold text-gray-900">{t('header.notificationsTitle')}</div>
                {notificationsLoading ? (
                  <NotificationListSkeleton />
                ) : notifications.length === 0 ? (
                  <div className="rounded-xl border border-gray-200 bg-white p-3 text-xs text-gray-500">
                    {t('header.notificationsEmpty')}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {notifications.map((n) => (
                      <NotificationItem
                        key={n.id}
                        title={t('header.notificationsNewOrderTitle', { orderNumber: n.orderNumber })}
                        body={n.body}
                        onClick={() => {
                          setIsNotificationsOpen(false)
                          router.push(`/dashboard/orders?order=${encodeURIComponent(n.orderNumber)}`)
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white p-1 pl-2 shadow-sm transition-colors hover:bg-brand-50"
                aria-label={t('header.userMenuAria')}
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-brand-50 text-brand-900 text-xs font-semibold">
                    {initials || 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden max-w-[160px] truncate text-sm font-medium text-gray-900 sm:inline">
                  {user?.fullName ?? t('sidebar.defaultUserName')}
                </span>
                <ChevronDown className="mr-1 hidden h-4 w-4 text-gray-500 sm:block" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 border-gray-200 bg-white p-1 text-gray-900 shadow-md">
              <DropdownMenuItem asChild className="cursor-pointer rounded-md px-2 py-2 text-sm text-gray-800 focus:bg-brand-50 focus:text-brand-900">
                <Link href="/dashboard/profile" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{t('header.profile')}</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="cursor-pointer rounded-md px-2 py-2 text-sm text-gray-800 focus:bg-brand-50 focus:text-brand-900">
                <Link href="/dashboard/store-settings" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  <span>{t('header.settings')}</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

function NotificationItem({
  title,
  body,
  onClick,
}: {
  title: string
  body: string
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full rounded-xl border border-gray-200 bg-white p-3 text-left transition-colors",
        onClick ? "hover:bg-brand-50" : ""
      )}
    >
      <div className="text-sm font-medium text-gray-900">{title}</div>
      <div className="mt-1 text-xs text-gray-500">{body}</div>
    </button>
  )
}
