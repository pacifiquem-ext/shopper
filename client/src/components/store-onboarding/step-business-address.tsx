'use client'

import { useTranslations } from 'next-intl'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useStoreOnboardingStore } from '@/store/store-onboarding.store'
import { StepHeader } from './step-header'
import { useWizardField } from './wizard-context'

export function StepBusinessAddress() {
  const t = useTranslations('storeOnboarding')
  const { draft, setBusinessAddress } = useStoreOnboardingStore()

  const provinceField = useWizardField('businessAddress.province')
  const districtField = useWizardField('businessAddress.district')
  const sectorField = useWizardField('businessAddress.sector')
  const physicalAddressField = useWizardField('businessAddress.physicalAddress')

  return (
    <div className="space-y-8">
      <StepHeader
        title={t('businessAddress.title', {
          defaultValue: 'Business Address',
        })}
        subtitle={t('businessAddress.subtitle', {
          defaultValue: 'Provide your official registered physical address.',
        })}
      />

      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900">
          {t('businessAddress.registeredAddressTitle', {
            defaultValue: 'Registered Business Address',
          })}
        </h3>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="relative space-y-0">
            <Label className="text-sm font-semibold text-gray-700">
              {t('businessAddress.province', { defaultValue: 'Province' })}
            </Label>
            <div
              className={cn(
                'flex items-center border-b py-2 transition-colors',
                provinceField.hasError
                  ? 'border-red-500 focus-within:border-red-500'
                  : 'focus-within:border-primary-base border-stroke-soft-200'
              )}
            >
              <Input
                value={draft.businessAddress?.province || ''}
                onChange={(e) => setBusinessAddress({ province: e.target.value })}
                className="rounded-none border-0 bg-transparent px-0 pb-1 text-lg shadow-none focus:outline-none focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0"
                placeholder="Kigali"
              />
            </div>
            {provinceField.hasError && (
              <div className="absolute bg-white pt-1 text-xs font-medium text-red-500">
                {provinceField.errorMessage}
              </div>
            )}
          </div>

          <div className="relative space-y-0">
            <Label className="text-sm font-semibold text-gray-700">
              {t('businessAddress.district', { defaultValue: 'District' })}
            </Label>
            <div
              className={cn(
                'flex items-center border-b py-2 transition-colors',
                districtField.hasError
                  ? 'border-red-500 focus-within:border-red-500'
                  : 'focus-within:border-primary-base border-stroke-soft-200'
              )}
            >
              <Input
                value={draft.businessAddress?.district || ''}
                onChange={(e) => setBusinessAddress({ district: e.target.value })}
                className="rounded-none border-0 bg-transparent px-0 pb-1 text-lg shadow-none focus:outline-none focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0"
                placeholder="Gasabo"
              />
            </div>
            {districtField.hasError && (
              <div className="absolute bg-white pt-1 text-xs font-medium text-red-500">
                {districtField.errorMessage}
              </div>
            )}
          </div>

          <div className="relative space-y-0">
            <Label className="text-sm font-semibold text-gray-700">
              {t('businessAddress.sector', { defaultValue: 'Sector' })}
            </Label>
            <div
              className={cn(
                'flex items-center border-b py-2 transition-colors',
                sectorField.hasError
                  ? 'border-red-500 focus-within:border-red-500'
                  : 'focus-within:border-primary-base border-stroke-soft-200'
              )}
            >
              <Input
                value={draft.businessAddress?.sector || ''}
                onChange={(e) => setBusinessAddress({ sector: e.target.value })}
                className="rounded-none border-0 bg-transparent px-0 pb-1 text-lg shadow-none focus:outline-none focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0"
                placeholder="Remera"
              />
            </div>
            {sectorField.hasError && (
              <div className="absolute bg-white pt-1 text-xs font-medium text-red-500">
                {sectorField.errorMessage}
              </div>
            )}
          </div>
        </div>

        <div className="relative space-y-0">
          <Label className="text-sm font-semibold text-gray-700">
            {t('businessAddress.physicalDetails', {
              defaultValue: 'Physical Address details',
            })}
          </Label>
          <div
            className={cn(
              'flex items-center border-b py-2 transition-colors',
              physicalAddressField.hasError
                ? 'border-red-500 focus-within:border-red-500'
                : 'focus-within:border-primary-base border-stroke-soft-200'
            )}
          >
            <Input
              value={draft.businessAddress?.physicalAddress || ''}
              onChange={(e) => setBusinessAddress({ physicalAddress: e.target.value })}
              className="rounded-none border-0 bg-transparent px-0 pb-1 text-lg shadow-none focus:outline-none focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0"
              placeholder="KG 11 Ave, 123 Building"
            />
          </div>
          {physicalAddressField.hasError && (
            <div className="absolute bg-white pt-1 text-xs font-medium text-red-500">
              {physicalAddressField.errorMessage}
            </div>
          )}
        </div>

        <div className="relative space-y-0 pt-4">
          <Label className="text-sm font-semibold text-gray-700">
            {t('businessAddress.googleMapsUrl', { defaultValue: 'Google Maps URL' })}{' '}
            <span className="text-xs font-normal text-gray-500">
              {t('common.optional', { defaultValue: '(Optional)' })}
            </span>
          </Label>
          <div className="focus-within:border-primary-base flex items-center border-b border-stroke-soft-200 py-2 transition-colors">
            <Input
              value={draft.businessAddress?.googleMapsUrl || ''}
              onChange={(e) => setBusinessAddress({ googleMapsUrl: e.target.value })}
              className="rounded-none border-0 bg-transparent px-0 pb-1 text-lg shadow-none focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0"
              placeholder="https://maps.google.com/..."
            />
          </div>
        </div>
      </div>
    </div>
  )
}
