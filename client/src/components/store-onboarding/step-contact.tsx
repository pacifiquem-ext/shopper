'use client'

import { useTranslations } from 'next-intl'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useStoreOnboardingStore } from '@/store/store-onboarding.store'
import { StepHeader } from './step-header'

export function StepContact() {
  const t = useTranslations('storeOnboarding')
  const { draft, setContactEmail, setContactPhone, setContactAddress, setAboutUs } =
    useStoreOnboardingStore()

  return (
    <div className="space-y-8">
      <StepHeader
        title={t('contact.title', {
          defaultValue: "Add your store's contact info",
        })}
        subtitle={t('contact.subtitle', {
          defaultValue:
            'Help customers reach you and find your physical location. These are optional.',
        })}
      />

      <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-700">
        {t('contact.publicWarning', {
          defaultValue: 'Note: This information will be displayed publicly on your store.',
        })}
      </div>

      <div className="space-y-6">
        <div className="relative space-y-0">
          <Label htmlFor="onboarding-contact-email" className="text-sm font-semibold text-gray-700">
            {t('contact.emailLabel', {
              defaultValue: 'Contact Email',
            })}
            <span className="ml-1 text-xs font-normal text-gray-500">
              {t('common.optional', { defaultValue: '(Optional)' })}
            </span>
          </Label>
          <div className="focus-within:border-primary-base flex items-center border-b border-stroke-soft-200 py-2 transition-colors">
            <Input
              id="onboarding-contact-email"
              type="email"
              value={draft.contactEmail || ''}
              onChange={(e) => setContactEmail(e.target.value)}
              className="rounded-none border-0 bg-transparent px-0 pb-1 text-lg shadow-none focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-base/40 focus-visible:ring-offset-0"
              placeholder="e.g. hello@mystore.rw"
            />
          </div>
        </div>

        <div className="relative space-y-0 pt-4">
          <Label htmlFor="onboarding-contact-phone" className="text-sm font-semibold text-gray-700">
            {t('contact.phoneLabel', {
              defaultValue: 'Contact Phone Number',
            })}
            <span className="ml-1 text-xs font-normal text-gray-500">
              {t('common.optional', { defaultValue: '(Optional)' })}
            </span>
          </Label>
          <div className="focus-within:border-primary-base flex items-center border-b border-stroke-soft-200 py-2 transition-colors">
            <Input
              id="onboarding-contact-phone"
              type="tel"
              value={draft.contactPhone || ''}
              onChange={(e) => setContactPhone(e.target.value)}
              className="rounded-none border-0 bg-transparent px-0 pb-1 text-lg shadow-none focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-base/40 focus-visible:ring-offset-0"
              placeholder="+250 780 000 000"
            />
          </div>
        </div>

        <div className="relative pt-4">
          <Label htmlFor="onboarding-contact-address" className="text-sm font-semibold text-gray-700">
            {t('contact.addressLabel', {
              defaultValue: 'Physical Address / Headquarters',
            })}
            <span className="ml-1 text-xs font-normal text-gray-500">
              {t('common.optional', { defaultValue: '(Optional)' })}
            </span>
          </Label>
          <div className="focus-within:border-primary-base border-b border-stroke-soft-200 transition-colors">
            <Textarea
              id="onboarding-contact-address"
              value={draft.contactAddress || ''}
              onChange={(e) => setContactAddress(e.target.value)}
              className="mt-2 min-h-[120px] resize-none rounded-none border-0 bg-transparent px-0 text-lg shadow-none focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-base/40 focus-visible:ring-offset-0"
              placeholder="123 Kigali Business Centre, KN 5 Rd..."
              maxLength={300}
            />
          </div>
        </div>

        <div className="relative pt-4">
          <Label htmlFor="onboarding-about-us" className="text-sm font-semibold text-gray-700">
            {t('contact.aboutUsLabel', {
              defaultValue: 'About us',
            })}
            <span className="ml-1 text-xs font-normal text-gray-500">
              {t('common.optional', { defaultValue: '(Optional)' })}
            </span>
          </Label>
          <div className="focus-within:border-primary-base border-b border-stroke-soft-200 transition-colors">
            <Textarea
              id="onboarding-about-us"
              value={draft.aboutUs || ''}
              onChange={(e) => setAboutUs(e.target.value)}
              className="mt-2 min-h-[120px] resize-none rounded-none border-0 bg-transparent px-0 text-lg shadow-none focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-base/40 focus-visible:ring-offset-0"
              placeholder={t('contact.aboutUsPlaceholder', {
                defaultValue:
                  'Tell your customers your story, your mission, and what you stand for.',
              })}
              maxLength={1000}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
