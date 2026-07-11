'use client'

import { useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { RiStore2Line } from '@remixicon/react'
import { useStoreOnboardingStore } from '@/store/store-onboarding.store'

export function StepBusinessType() {
  const t = useTranslations('storeOnboarding')
  const { draft, setBusinessType } = useStoreOnboardingStore()

  useEffect(() => {
    if (draft.businessType !== 'retail') {
      setBusinessType('retail')
    }
  }, [draft.businessType, setBusinessType])

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-6">
      <div>
        <h2 className="text-title-h6 text-text-strong-950">
          {t('businessType.title', { defaultValue: 'Your store type' })}
        </h2>
        <p className="mt-2 text-paragraph-sm text-text-sub-600">
          {t('businessType.retailOnly', {
            defaultValue:
              'OnlineShop.rw is built for retail stores. You are set up as a retail merchant — products, inventory, delivery, and orders.',
          })}
        </p>
      </div>

      <div className="flex items-start gap-4 rounded-20 border border-primary-base bg-primary-alpha-10 p-5 ring-1 ring-inset ring-primary-base">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-10 bg-bg-white-0 text-primary-base shadow-regular-xs">
          <RiStore2Line className="size-6" />
        </div>
        <div>
          <div className="text-label-md text-text-strong-950">
            {t('businessType.retail.title', { defaultValue: 'Retail store' })}
          </div>
          <p className="mt-1 text-paragraph-sm text-text-sub-600">
            {t('businessType.retail.subtitle', {
              defaultValue: 'Sell physical products with inventory tracking and delivery zones.',
            })}
          </p>
        </div>
      </div>
    </div>
  )
}
