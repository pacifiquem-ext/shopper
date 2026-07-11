'use client'

import { Link } from '@/i18n/navigation'
import { MERCHANT_ONBOARDING_PATH, withReturnUrl } from '@/lib/auth-return-url'
import { cn } from '@/lib/utils'
import { RiStore2Line } from '@remixicon/react'
import React from 'react'
import { useTranslations } from 'next-intl'

interface AuthCardProps {
  children: React.ReactNode
  activeTab: 'login' | 'signup' | 'forgot-password' | 'reset-password'
  returnUrl?: string | null
}

export function AuthCard({ children, activeTab, returnUrl }: AuthCardProps) {
  const t = useTranslations('auth')
  const loginHref = withReturnUrl('/login', returnUrl)
  const signupHref = withReturnUrl('/signup', returnUrl ?? MERCHANT_ONBOARDING_PATH)

  const showTabs = activeTab === 'login' || activeTab === 'signup'

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-bg-weak-50 px-4 py-10">
      <div className="grid w-full max-w-[960px] overflow-hidden rounded-20 border border-stroke-soft-200 bg-bg-white-0 shadow-regular-md md:grid-cols-[1fr_1.1fr]">
        <aside className="relative hidden flex-col justify-between bg-bg-strong-950 p-8 text-static-white md:flex lg:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,var(--color-primary-alpha-24),transparent_55%)]" />
          <div className="relative z-10">
            <div className="mb-8 flex size-12 items-center justify-center rounded-10 bg-primary-base text-static-white">
              <RiStore2Line className="size-6" />
            </div>
            <h1 className="text-title-h5 text-static-white">
              {t('brand.title', { defaultValue: 'OnlineShop.rw' })}
            </h1>
            <p className="mt-3 max-w-sm text-paragraph-sm text-white/70">
              {t('brand.subtitle', {
                defaultValue: 'Launch a premium storefront, manage orders, and grow with tools built for Rwanda.',
              })}
            </p>
          </div>
          <ul className="relative z-10 space-y-3 text-paragraph-sm text-white/80">
            <li className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-primary-base" />
              {t('brand.bullets.products', { defaultValue: 'Products & inventory in one place' })}
            </li>
            <li className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-primary-base" />
              {t('brand.bullets.orders', { defaultValue: 'Orders, delivery zones & payments' })}
            </li>
            <li className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-primary-base" />
              {t('brand.bullets.marketplace', { defaultValue: 'Marketplace discovery for new customers' })}
            </li>
          </ul>
        </aside>

        <div className="flex flex-col p-6 sm:p-8 lg:p-10">
          {showTabs && (
            <div className="mb-8 flex rounded-10 bg-bg-weak-50 p-1 ring-1 ring-inset ring-stroke-soft-200">
              <Link
                href={loginHref}
                className={cn(
                  'flex-1 rounded-lg py-2 text-center text-label-sm transition duration-200',
                  activeTab === 'login'
                    ? 'bg-bg-white-0 text-text-strong-950 shadow-regular-xs'
                    : 'text-text-sub-600 hover:text-text-strong-950',
                )}
              >
                {t('tabs.login', { defaultValue: 'Log in' })}
              </Link>
              <Link
                href={signupHref}
                className={cn(
                  'flex-1 rounded-lg py-2 text-center text-label-sm transition duration-200',
                  activeTab === 'signup'
                    ? 'bg-bg-white-0 text-text-strong-950 shadow-regular-xs'
                    : 'text-text-sub-600 hover:text-text-strong-950',
                )}
              >
                {t('tabs.signup', { defaultValue: 'Sign up' })}
              </Link>
            </div>
          )}

          {!showTabs && (
            <div className="mb-6">
              <p className="text-label-md text-text-strong-950">
                {activeTab === 'forgot-password'
                  ? t('tabs.forgot', { defaultValue: 'Forgot password' })
                  : t('tabs.reset', { defaultValue: 'Reset password' })}
              </p>
            </div>
          )}

          <div className="flex flex-1 flex-col justify-center">{children}</div>
        </div>
      </div>
    </div>
  )
}
