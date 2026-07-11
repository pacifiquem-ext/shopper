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
    const subdomain = draft.subdomain || ''

    if (subdomain.length < 2 || !/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(subdomain)) {
      setAvailability('idle')
      return
    }

    setAvailability('checking')
    const timer = setTimeout(async () => {
      try {
        const res = await storeOnboardingService.checkSubdomain(subdomain)
        const data = (res as any)?.data ?? res
        setAvailability(data?.available ? 'available' : 'taken')
      } catch {
        setAvailability('error')
      }
    }, 400)

    return () => clearTimeout(timer)
  }, [draft.subdomain])

  return (
    <div className="space-y-8">
      <StepHeader
        title={t('subdomain.title', { defaultValue: 'Choose your store link' })}
        subtitle={t('subdomain.subtitle', {
          defaultValue: 'This is the web address where customers will find you.',
        })}
      />

      <div className="space-y-6">
        <div className="relative space-y-0">
          <Label className="text-sm font-semibold text-gray-700">
            {t('subdomain.label', { defaultValue: 'Subdomain' })}
          </Label>
          <div
            className={cn(
              'flex items-center border-b py-2 transition-colors',
              subdomainField.hasError
                ? 'border-red-500 focus-within:border-red-500'
                : availability === 'taken'
                  ? 'border-red-400 focus-within:border-red-400'
                  : availability === 'available'
                    ? 'border-emerald-500 focus-within:border-emerald-500'
                    : 'focus-within:border-primary-base border-stroke-soft-200',
            )}
          >
            <input
              type="text"
              value={draft.subdomain || ''}
              onChange={(e) => setSubdomain(e.target.value.toLowerCase())}
              className="flex-1 bg-transparent pb-1 text-lg font-medium outline-none"
              placeholder={t('subdomain.placeholder', {
                defaultValue: 'my-store',
              })}
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
            />
            <div className="pb-1 text-lg font-medium text-gray-500">.onlineshop.rw</div>
          </div>

          {/* Validation error (from wizard) */}
          {subdomainField.hasError && (
            <div className="absolute bg-white pt-1 text-xs font-medium text-red-500">
              {subdomainField.errorMessage}
            </div>
          )}

          {/* Availability status */}
          {!subdomainField.hasError && availability !== 'idle' && (
            <div
              className={cn('pt-1 text-xs font-medium', {
                'text-gray-400': availability === 'checking',
                'text-emerald-600': availability === 'available',
                'text-red-500': availability === 'taken',
                'text-amber-500': availability === 'error',
              })}
            >
              {availability === 'checking' && 'Checking availability...'}
              {availability === 'available' && '✓ Available'}
              {availability === 'taken' && '✗ Already taken — choose a different name'}
              {availability === 'error' && 'Could not check availability'}
            </div>
          )}
        </div>

        <div className="rounded-xl bg-gray-50 p-6">
          <div className="text-base font-semibold text-gray-900">
            {t('subdomain.rulesTitle', { defaultValue: 'Link requirements' })}
          </div>
          <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-gray-600">
            <li>{t('subdomain.rule1', { defaultValue: 'Letters, numbers, and hyphens only' })}</li>
            <li>{t('subdomain.rule2', { defaultValue: 'Cannot start or end with a hyphen' })}</li>
            <li>{t('subdomain.rule3', { defaultValue: 'Must be between 2 and 63 characters' })}</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
