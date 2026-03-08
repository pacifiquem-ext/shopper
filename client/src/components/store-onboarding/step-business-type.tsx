'use client'

import { Store, UtensilsCrossed } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useStoreOnboardingStore } from '@/store/store-onboarding.store'
import { cn } from '@/lib/utils'
import { StepHeader } from './step-header'

function SelectCard({ selected, onClick, icon, title, subtitle }: any) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex min-h-[140px] flex-col items-start justify-between rounded-xl border-2 p-6 text-left transition-all duration-200 hover:bg-gray-50 focus:outline-none',
        selected ? 'border-black bg-gray-50' : 'border border-gray-200 bg-white hover:border-black'
      )}
    >
      <div className={cn('mb-4', selected ? 'text-black' : 'text-gray-700')}>{icon}</div>
      <div>
        <div className="text-lg font-semibold text-gray-900">{title}</div>
        <div className="text-sm text-gray-500">{subtitle}</div>
      </div>
    </button>
  )
}

export function StepBusinessType() {
  const t = useTranslations('storeOnboarding')
  const { draft, setBusinessType, setIndustrySectorId, setBusinessCategoryId } =
    useStoreOnboardingStore()

  const handleSelectType = (type: 'retail' | 'restaurant') => {
    setBusinessType(type)
    // We strictly set just the high-level type. The detailed UUID IDs
    // are picked dynamically in the next StepIndustry wizard pane.
  }

  return (
    <div className="space-y-8">
      <StepHeader
        title={t('businessType.title', {
          defaultValue: 'What type of business are you?',
        })}
        subtitle={t('businessType.subtitle', {
          defaultValue: 'Choose the option that best describes your store.',
        })}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <SelectCard
          selected={draft.businessType === 'retail'}
          onClick={() => handleSelectType('retail')}
          icon={<Store className="h-8 w-8 stroke-[1.5]" />}
          title={t('businessType.retail.title', {
            defaultValue: 'Retail Store',
          })}
          subtitle={t('businessType.retail.subtitle', {
            defaultValue: 'Physical goods & products',
          })}
        />
        <SelectCard
          selected={draft.businessType === 'restaurant'}
          onClick={() => handleSelectType('restaurant')}
          icon={<UtensilsCrossed className="h-8 w-8 stroke-[1.5]" />}
          title={t('businessType.restaurant.title', {
            defaultValue: 'Restaurant',
          })}
          subtitle={t('businessType.restaurant.subtitle', {
            defaultValue: 'Food & drinks delivery',
          })}
        />
      </div>
    </div>
  )
}
