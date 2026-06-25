'use client'

import { Mail, Phone, Shield, User } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TurningZeroLoader } from '@/components/ui/turning-zero-loader'
import { useAuthStore } from '@/store/auth.store'

function roleLabel(role: string | undefined, t: ReturnType<typeof useTranslations<'dashboard.profile'>>) {
  if (role === 'STORE_OWNER') return t('roles.storeOwner')
  if (role === 'PLATFORM_ADMIN') return t('roles.platformAdmin')
  return t('roles.customer')
}

function statusLabel(status: string | undefined, t: ReturnType<typeof useTranslations<'dashboard.profile'>>) {
  if (status === 'ACTIVE') return t('status.active')
  if (status === 'PENDING_VERIFICATION') return t('status.pendingVerification')
  if (status === 'SUSPENDED') return t('status.suspended')
  return status ?? t('status.unknown')
}

export default function ProfilePage() {
  const t = useTranslations('dashboard.profile')
  const { user, isLoading } = useAuthStore()

  const initials = (user?.fullName ?? 'User')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')

  return (
    <div className="flex w-full max-w-3xl flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">{t('title')}</h1>
        <p className="mt-2 text-gray-500">{t('subtitle')}</p>
      </div>

      <Card className="border-gray-200 shadow-sm">
        {isLoading ? (
          <CardContent className="flex items-center justify-center py-16">
            <TurningZeroLoader size="md" label={t('title')} />
          </CardContent>
        ) : (
          <>
        <CardHeader className="flex flex-row items-center gap-4 space-y-0">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="bg-brand-50 text-brand-900 text-lg font-semibold">
              {initials || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <CardTitle className="truncate text-xl">
              {user?.fullName ?? t('fallbackName')}
            </CardTitle>
            <CardDescription>{roleLabel(user?.role, t)}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <ProfileRow
            icon={User}
            label={t('fields.fullName')}
            value={user?.fullName ?? t('notProvided')}
          />
          <ProfileRow
            icon={Phone}
            label={t('fields.phone')}
            value={user?.phoneNumber ?? t('notProvided')}
          />
          <ProfileRow
            icon={Mail}
            label={t('fields.email')}
            value={user?.email?.trim() ? user.email : t('notProvided')}
          />
          <ProfileRow
            icon={Shield}
            label={t('fields.accountStatus')}
            value={statusLabel(user?.status, t)}
          />
        </CardContent>
          </>
        )}
      </Card>
    </div>
  )
}

function ProfileRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof User
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50/80 px-4 py-3">
      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500">
        <Icon className="h-4 w-4" aria-hidden />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
        <p className="mt-0.5 break-all text-sm font-medium text-gray-900">{value}</p>
      </div>
    </div>
  )
}
