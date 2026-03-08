'use client'

import { useTranslations } from 'next-intl'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { useStoreOnboardingStore } from '@/store/store-onboarding.store'
import { useWizardField } from './wizard-context'
import { StepHeader } from './step-header'

export function StepSubdomain() {
  const t = useTranslations('storeOnboarding')
  const { draft, setSubdomain } = useStoreOnboardingStore()

  const subdomainField = useWizardField('subdomain')

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
                : 'focus-within:border-brand-600 border-gray-300'
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
          {subdomainField.hasError && (
            <div className="absolute bg-white pt-1 text-xs font-medium text-red-500">
              {subdomainField.errorMessage}
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
