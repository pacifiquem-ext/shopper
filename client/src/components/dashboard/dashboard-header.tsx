'use client'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useAuthStore } from '@/store/auth.store'
import { Bell, ChevronDown, Search, Settings, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import { useMemo, useState } from 'react'

export function DashboardHeader() {
  const t = useTranslations('dashboard')
  const { user } = useAuthStore()

  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchOpen, setIsSearchOpen] = useState(false)

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

  return (
    <header className="sticky top-0 z-30 flex w-full items-center gap-6 border-b border-gray-200 bg-white px-8 py-4">
      <div className="flex w-full items-center justify-between gap-6">
        <div className="w-[220px]" />

        <Popover open={isSearchOpen} onOpenChange={setIsSearchOpen}>
          <PopoverTrigger asChild>
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
                placeholder={t('header.searchPlaceholder')}
                className="focus-visible:ring-brand-500 w-full rounded-lg border-gray-200 bg-gray-50 pr-4 pl-10"
              />
            </div>
          </PopoverTrigger>
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
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="relative flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
                aria-label={t('header.notificationsAria')}
              >
                <Bell className="h-4 w-4" />
                <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-red-500" />
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 border-gray-200 bg-white p-3 text-gray-900 shadow-md">
              <div className="space-y-2">
                <div className="text-sm font-semibold text-gray-900">{t('header.notificationsTitle')}</div>
                <div className="space-y-2">
                  <NotificationItem title={t('header.notifications.sample1.title')} body={t('header.notifications.sample1.body')} />
                  <NotificationItem title={t('header.notifications.sample2.title')} body={t('header.notifications.sample2.body')} />
                  <NotificationItem title={t('header.notifications.sample3.title')} body={t('header.notifications.sample3.body')} />
                </div>
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
              <DropdownMenuItem className="cursor-pointer rounded-md px-2 py-2 text-sm text-gray-800 focus:bg-brand-50 focus:text-brand-900">
                <User className="h-4 w-4" />
                <span>{t('header.profile')}</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer rounded-md px-2 py-2 text-sm text-gray-800 focus:bg-brand-50 focus:text-brand-900">
                <Settings className="h-4 w-4" />
                <span>{t('header.settings')}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

function NotificationItem({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3">
      <div className="text-sm font-medium text-gray-900">{title}</div>
      <div className="mt-1 text-xs text-gray-500">{body}</div>
    </div>
  )
}
