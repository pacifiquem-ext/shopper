'use client'

import { Link } from '@/i18n/navigation'
import { MERCHANT_ONBOARDING_PATH, withReturnUrl } from '@/lib/auth-return-url'
import { cn } from '@/lib/utils'
import {
  RiBox3Line,
  RiShoppingBag3Line,
  RiStore2Line,
  RiTruckLine,
} from '@remixicon/react'
import React from 'react'
import { useTranslations } from 'next-intl'

interface AuthCardProps {
  children: React.ReactNode
  activeTab: 'login' | 'signup' | 'forgot-password' | 'reset-password'
  returnUrl?: string | null
  title?: string
  description?: string
}

const brandBullets = [
  { key: 'products' as const, icon: RiBox3Line },
  { key: 'orders' as const, icon: RiTruckLine },
  { key: 'marketplace' as const, icon: RiShoppingBag3Line },
]

export function AuthCard({
  children,
  activeTab,
  returnUrl,
  title,
  description,
}: AuthCardProps) {
  const t = useTranslations('auth')
  const loginHref = withReturnUrl('/login', returnUrl)
  const signupHref = withReturnUrl('/signup', returnUrl ?? MERCHANT_ONBOARDING_PATH)

  const showTabs = activeTab === 'login' || activeTab === 'signup'

  const heading =
    title ??
    (activeTab === 'forgot-password'
      ? t('tabs.forgot')
      : activeTab === 'reset-password'
        ? t('tabs.reset')
        : activeTab === 'signup'
          ? t('tabs.signup')
          : t('tabs.login'))

  return (
    <div className="grid w-full max-w-[960px] overflow-hidden rounded-20 border border-stroke-soft-200 bg-bg-white-0 shadow-regular-md md:grid-cols-[0.95fr_1.05fr]">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-bg-strong-950 p-8 text-static-white md:flex lg:p-10">
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,var(--color-primary-alpha-24),transparent_55%)]"
        />
        <div
          aria-hidden
          className="absolute -right-16 -bottom-20 size-64 rounded-full bg-primary-base/20 blur-3xl"
        />
        <div className="relative z-10">
          <Link
            href="/"
            className="mb-10 inline-flex items-center gap-3 transition opacity-95 hover:opacity-100"
          >
            <span className="grid size-11 place-items-center rounded-10 bg-primary-base text-static-white shadow-regular-xs">
              <RiStore2Line className="size-5" aria-hidden />
            </span>
            <span className="text-label-md text-static-white">{t('brand.title')}</span>
          </Link>
          <h1 className="max-w-sm text-title-h5 text-static-white">{t('brand.subtitle')}</h1>
        </div>
        <ul className="relative z-10 space-y-4">
          {brandBullets.map(({ key, icon: Icon }) => (
            <li key={key} className="flex items-start gap-3">
              <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-white/10 text-primary-base">
                <Icon className="size-4" aria-hidden />
              </span>
              <span className="text-paragraph-sm text-white/80">{t(`brand.bullets.${key}`)}</span>
            </li>
          ))}
        </ul>
      </aside>

      <div className="flex flex-col p-6 sm:p-8 lg:p-10">
        <div className="mb-6 flex items-center gap-2 md:hidden">
          <span className="grid size-9 place-items-center rounded-10 bg-primary-alpha-10 text-primary-base">
            <RiStore2Line className="size-4" aria-hidden />
          </span>
          <span className="text-label-sm text-text-strong-950">{t('brand.title')}</span>
        </div>

        {showTabs ? (
          <div
            className="mb-8 flex rounded-10 bg-bg-weak-50 p-1 ring-1 ring-inset ring-stroke-soft-200"
            role="tablist"
            aria-label={t('tabs.login')}
          >
            <Link
              href={loginHref}
              role="tab"
              aria-selected={activeTab === 'login'}
              aria-current={activeTab === 'login' ? 'page' : undefined}
              className={cn(
                'flex-1 rounded-lg py-2.5 text-center text-label-sm transition duration-200',
                activeTab === 'login'
                  ? 'bg-bg-white-0 text-text-strong-950 shadow-regular-xs'
                  : 'text-text-sub-600 hover:text-text-strong-950',
              )}
            >
              {t('tabs.login')}
            </Link>
            <Link
              href={signupHref}
              role="tab"
              aria-selected={activeTab === 'signup'}
              aria-current={activeTab === 'signup' ? 'page' : undefined}
              className={cn(
                'flex-1 rounded-lg py-2.5 text-center text-label-sm transition duration-200',
                activeTab === 'signup'
                  ? 'bg-bg-white-0 text-text-strong-950 shadow-regular-xs'
                  : 'text-text-sub-600 hover:text-text-strong-950',
              )}
            >
              {t('tabs.signup')}
            </Link>
          </div>
        ) : (
          <div className="mb-6 space-y-1">
            <p className="text-title-h6 text-text-strong-950">{heading}</p>
            {description ? (
              <p className="text-paragraph-sm text-text-sub-600">{description}</p>
            ) : null}
          </div>
        )}

        {showTabs && (title || description) ? (
          <div className="mb-6 space-y-1">
            {title ? <p className="text-label-md text-text-strong-950">{title}</p> : null}
            {description ? (
              <p className="text-paragraph-sm text-text-sub-600">{description}</p>
            ) : null}
          </div>
        ) : null}

        <div className="flex flex-1 flex-col justify-center">{children}</div>
      </div>
    </div>
  )
}
