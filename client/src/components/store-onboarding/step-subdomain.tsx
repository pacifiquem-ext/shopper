'use client'

import { useTranslations } from 'next-intl'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { useStoreOnboardingStore } from '@/store/store-onboarding.store'
import { useWizardField } from './wizard-context'
import { StepHeader } from './step-header'
import { storeOnboardingService } from '@/services/store-onboarding.service'
import { useEffect, useState } from 'react'

type AvailabilityState = 'idle' | 'checking' | 'available' | 'taken' | 'error'

export function StepSubdomain() {
  const t = useTranslations('storeOnboarding')
  const { draft, setSubdomain } = useStoreOnboardingStore()

  const subdomainField = useWizardField('subdomain')

  const [availability, setAvailability] = useState<AvailabilityState>('idle')

  useEffect(() => {
    const slug = draft.subdomain || ''

    if (slug.length < 2 || !/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(slug)) {
      setAvailability('idle')
      return
    }

    setAvailability('checking')
    const timer = setTimeout(async () => {
      try {
        const res = await storeOnboardingService.checkSlug(slug)
        const data = (res as { data?: { available?: boolean } })?.data ?? res
        setAvailability((data as { available?: boolean })?.available ? 'available' : 'taken')
      } catch {
        setAvailability('error')
      }
    }, 400)

    return () => clearTimeout(timer)
  }, [draft.subdomain])

  return (
    <div className="space-y-8">
      <StepHeader title={t('slug.title')} subtitle={t('slug.subtitle')} />

      <div className="space-y-6">
        <div className="relative space-y-0">
          <Label htmlFor="onboarding-slug" className="text-sm font-semibold text-text-sub-600">
            {t('slug.label')}
          </Label>
          <div
            className={cn(
              'flex items-center border-b py-2 transition-colors',
              subdomainField.hasError
                ? 'border-error-base focus-within:border-error-base'
                : availability === 'taken'
                  ? 'border-error-base focus-within:border-error-base'
                  : availability === 'available'
                    ? 'border-success-base focus-within:border-success-base'
                    : 'focus-within:border-primary-base border-stroke-soft-200',
            )}
          >
            <span className="pb-1 pr-2 text-sm font-medium text-text-soft-400">
              /stores/
            </span>
            <input
              id="onboarding-slug"
              type="text"
              value={draft.subdomain || ''}
              onChange={(e) => setSubdomain(e.target.value.toLowerCase())}
              aria-invalid={subdomainField.hasError || availability === 'taken' || undefined}
              className="flex-1 bg-transparent pb-1 text-lg font-medium outline-none focus-visible:ring-2 focus-visible:ring-primary-base/40"
              placeholder={t('slug.placeholder')}
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
            />
          </div>

          {subdomainField.hasError && (
            <div className="absolute bg-bg-white-0 pt-1 text-xs font-medium text-error-base" role="alert">
              {subdomainField.errorMessage}
            </div>
          )}

          {!subdomainField.hasError && availability !== 'idle' && (
            <div
              className={cn('pt-1 text-xs font-medium', {
                'text-text-soft-400': availability === 'checking',
                'text-success-base': availability === 'available',
                'text-error-base': availability === 'taken',
                'text-warning-base': availability === 'error',
              })}
            >
              {availability === 'checking' && t('slug.checking')}
              {availability === 'available' && t('slug.available')}
              {availability === 'taken' && t('slug.taken')}
              {availability === 'error' && t('slug.checkError')}
            </div>
          )}
        </div>

        <div className="rounded-xl bg-bg-weak-50 p-6">
          <div className="text-base font-semibold text-text-strong-950">{t('slug.rulesTitle')}</div>
          <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-text-sub-600">
            <li>{t('slug.rule1')}</li>
            <li>{t('slug.rule2')}</li>
            <li>{t('slug.rule3')}</li>
            <li>{t('slug.rule4')}</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
