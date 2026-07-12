'use client'

import { useTranslations } from 'next-intl'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { useStoreOnboardingStore } from '@/store/store-onboarding.store'
import { useWizardField } from './wizard-context'
import { StepHeader } from './step-header'

export function StepStoreBasics() {
  const t = useTranslations('storeOnboarding')
  const { draft, setRegisteredName, setDisplayName, setDescription } = useStoreOnboardingStore()

  const registeredNameField = useWizardField('registeredName')
  const displayNameField = useWizardField('displayName')

  return (
    <div className="space-y-8">
      <StepHeader
        title={t('storeBasics.title', {
          defaultValue: "Next, let's describe your store",
        })}
        subtitle={t('storeBasics.subtitle', {
          defaultValue: 'Share the main details so customers know who you are.',
        })}
      />

      <div className="space-y-6">
        <div className="relative space-y-0">
          <Label htmlFor="onboarding-registered-name" className="text-sm font-semibold text-gray-700">
            {t('storeBasics.registeredNameLabel', {
              defaultValue: 'Registered Business Name',
            })}
          </Label>
          <div
            className={cn(
              'flex items-center border-b py-2 transition-colors',
              registeredNameField.hasError
                ? 'border-red-500 focus-within:border-red-500'
                : 'focus-within:border-primary-base border-stroke-soft-200'
            )}
          >
            <Input
              id="onboarding-registered-name"
              value={draft.registeredName || ''}
              onChange={(e) => setRegisteredName(e.target.value)}
              aria-invalid={registeredNameField.hasError || undefined}
              className="rounded-none border-0 bg-transparent px-0 pb-1 text-lg shadow-none focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-base/40 focus-visible:ring-offset-0"
              placeholder={t('storeBasics.registeredNamePlaceholder')}
            />
          </div>
          {registeredNameField.hasError && (
            <div className="absolute bg-white pt-1 text-xs font-medium text-red-500" role="alert">
              {registeredNameField.errorMessage}
            </div>
          )}
        </div>

        <div className="relative space-y-0 pt-4">
          <Label htmlFor="onboarding-display-name" className="text-sm font-semibold text-gray-700">
            {t('storeBasics.displayNameLabel', {
              defaultValue: 'Store Display Name',
            })}
          </Label>
          <div
            className={cn(
              'flex items-center border-b py-2 transition-colors',
              displayNameField.hasError
                ? 'border-red-500 focus-within:border-red-500'
                : 'focus-within:border-primary-base border-stroke-soft-200'
            )}
          >
            <Input
              id="onboarding-display-name"
              value={draft.displayName || ''}
              onChange={(e) => setDisplayName(e.target.value)}
              aria-invalid={displayNameField.hasError || undefined}
              className="rounded-none border-0 bg-transparent px-0 pb-1 text-lg shadow-none focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-base/40 focus-visible:ring-offset-0"
              placeholder={t('storeBasics.displayNamePlaceholder')}
            />
          </div>
          {displayNameField.hasError && (
            <div className="absolute bg-white pt-1 text-xs font-medium text-red-500" role="alert">
              {displayNameField.errorMessage}
            </div>
          )}
        </div>

        <div className="relative pt-4">
          <Label htmlFor="onboarding-description" className="text-sm font-semibold text-gray-700">
            {t('storeBasics.descriptionLabel', {
              defaultValue: 'Store Description',
            })}
          </Label>
          <div className="focus-within:border-primary-base border-b border-stroke-soft-200 transition-colors">
            <Textarea
              id="onboarding-description"
              value={draft.description || ''}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-2 min-h-[120px] resize-none rounded-none border-0 bg-transparent px-0 text-lg shadow-none focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-base/40 focus-visible:ring-offset-0"
              placeholder={t('storeBasics.descriptionPlaceholder')}
              maxLength={500}
            />
          </div>
          <div className="mt-2 flex justify-end text-xs font-semibold text-gray-500">
            {draft.description.length}/500
          </div>
        </div>
      </div>
    </div>
  )
}
