'use client'

import { useTranslations } from 'next-intl'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useStoreOnboardingStore } from '@/store/store-onboarding.store'
import { useWizardField } from './wizard-context'
import { StepHeader } from './step-header'

export function StepLegal() {
  const t = useTranslations('storeOnboarding')
  const {
    draft,
    setOwnerFullName,
    setOwnerNationality,
    setCountry,
    setOwnerPhoneNumber,
    setOwnerEmail,
  } = useStoreOnboardingStore()

  const ownerFullNameField = useWizardField('ownerFullName')
  const ownerNationalityField = useWizardField('ownerNationality')
  const countryField = useWizardField('country')
  const ownerPhoneNumberField = useWizardField('ownerPhoneNumber')
  const ownerEmailField = useWizardField('ownerEmail')

  return (
    <div className="space-y-8">
      <StepHeader
        title={t('legal.title', {
          defaultValue: 'Business Identity & Ownership',
        })}
        subtitle={t('legal.subtitle', {
          defaultValue: 'Provide your official registration details and head office address.',
        })}
      />

      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900">
          {t('legal.ownerIdentity', { defaultValue: 'Owner Identity' })}
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="relative space-y-0">
            <Label htmlFor="onboarding-owner-full-name" className="text-sm font-semibold text-gray-700">
              {t('legal.fullName', { defaultValue: 'Full Name' })}
            </Label>
            <div
              className={cn(
                'flex items-center border-b py-2 transition-colors',
                ownerFullNameField.hasError
                  ? 'border-red-500 focus-within:border-red-500'
                  : 'focus-within:border-primary-base border-stroke-soft-200'
              )}
            >
              <Input
                id="onboarding-owner-full-name"
                value={draft.ownerFullName || ''}
                onChange={(e) => setOwnerFullName(e.target.value)}
                aria-invalid={ownerFullNameField.hasError || undefined}
                className="rounded-none border-0 bg-transparent px-0 pb-1 text-lg shadow-none focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-base/40 focus-visible:ring-offset-0"
                placeholder="John Doe"
              />
            </div>
            {ownerFullNameField.hasError && (
              <div className="absolute bg-white pt-1 text-xs font-medium text-red-500" role="alert">
                {ownerFullNameField.errorMessage}
              </div>
            )}
          </div>

          <div className="relative space-y-0">
            <Label htmlFor="onboarding-owner-nationality" className="text-sm font-semibold text-gray-700">
              {t('legal.nationality', { defaultValue: 'Nationality' })}
            </Label>
            <div
              className={cn(
                'flex items-center border-b py-2 transition-colors',
                ownerNationalityField.hasError
                  ? 'border-red-500 focus-within:border-red-500'
                  : 'focus-within:border-primary-base border-stroke-soft-200'
              )}
            >
              <Input
                id="onboarding-owner-nationality"
                value={draft.ownerNationality || ''}
                onChange={(e) => setOwnerNationality(e.target.value)}
                aria-invalid={ownerNationalityField.hasError || undefined}
                className="rounded-none border-0 bg-transparent px-0 pb-1 text-lg shadow-none focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-base/40 focus-visible:ring-offset-0"
                placeholder="Rwandan"
              />
            </div>
            {ownerNationalityField.hasError && (
              <div className="absolute bg-white pt-1 text-xs font-medium text-red-500" role="alert">
                {ownerNationalityField.errorMessage}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="relative space-y-0">
            <Label htmlFor="onboarding-owner-email" className="text-sm font-semibold text-gray-700">
              {t('legal.emailAddress', { defaultValue: 'Email Address' })}
            </Label>
            <div
              className={cn(
                'flex items-center border-b py-2 transition-colors',
                ownerEmailField.hasError
                  ? 'border-red-500 focus-within:border-red-500'
                  : 'focus-within:border-primary-base border-stroke-soft-200'
              )}
            >
              <Input
                id="onboarding-owner-email"
                type="email"
                value={draft.ownerEmail || ''}
                onChange={(e) => setOwnerEmail(e.target.value)}
                aria-invalid={ownerEmailField.hasError || undefined}
                className="rounded-none border-0 bg-transparent px-0 pb-1 text-lg shadow-none focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-base/40 focus-visible:ring-offset-0"
                placeholder="owner@onlineshop.rw"
              />
            </div>
            {ownerEmailField.hasError && (
              <div className="absolute bg-white pt-1 text-xs font-medium text-red-500" role="alert">
                {ownerEmailField.errorMessage}
              </div>
            )}
          </div>

          <div className="relative space-y-0">
            <Label htmlFor="onboarding-owner-phone" className="text-sm font-semibold text-gray-700">
              {t('legal.phoneNumber', { defaultValue: 'Phone Number' })}
            </Label>
            <div
              className={cn(
                'flex items-center border-b py-2 transition-colors',
                ownerPhoneNumberField.hasError
                  ? 'border-red-500 focus-within:border-red-500'
                  : 'focus-within:border-primary-base border-stroke-soft-200'
              )}
            >
              <Input
                id="onboarding-owner-phone"
                type="tel"
                value={draft.ownerPhoneNumber || ''}
                onChange={(e) => setOwnerPhoneNumber(e.target.value)}
                aria-invalid={ownerPhoneNumberField.hasError || undefined}
                className="rounded-none border-0 bg-transparent px-0 pb-1 text-lg shadow-none focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-base/40 focus-visible:ring-offset-0"
                placeholder="+250 780 000 000"
              />
            </div>
            {ownerPhoneNumberField.hasError && (
              <div className="absolute bg-white pt-1 text-xs font-medium text-red-500" role="alert">
                {ownerPhoneNumberField.errorMessage}
              </div>
            )}
          </div>
        </div>

        <div className="relative space-y-0">
          <Label htmlFor="onboarding-country" className="text-sm font-semibold text-gray-700">
            {t('legal.registrationCountry', { defaultValue: 'Registration Country' })}
          </Label>
          <div
            className={cn(
              'flex items-center border-b py-2 transition-colors',
              countryField.hasError
                ? 'border-red-500 focus-within:border-red-500'
                : 'focus-within:border-primary-base border-stroke-soft-200'
            )}
          >
            <Input
              id="onboarding-country"
              value={draft.country || ''}
              onChange={(e) => setCountry(e.target.value)}
              aria-invalid={countryField.hasError || undefined}
              className="rounded-none border-0 bg-transparent px-0 pb-1 text-lg shadow-none focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-base/40 focus-visible:ring-offset-0"
              placeholder="RW"
            />
          </div>
          {countryField.hasError && (
            <div className="absolute bg-white pt-1 text-xs font-medium text-red-500" role="alert">
              {countryField.errorMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
