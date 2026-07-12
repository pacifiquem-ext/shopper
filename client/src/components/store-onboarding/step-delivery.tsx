'use client'

import { Plus, X } from 'lucide-react'
import { useContext } from 'react'
import { useTranslations } from 'next-intl'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useStoreOnboardingStore } from '@/store/store-onboarding.store'
import { WizardContext } from './wizard-context'
import { StepHeader } from './step-header'
import { toSafeInt } from '../../validations/store-onboarding'

export function StepDelivery() {
  const t = useTranslations('storeOnboarding')
  const { draft, addDeliveryZone, updateDeliveryZone, removeDeliveryZone } =
    useStoreOnboardingStore()
  const { showErrors, errors } = useContext(WizardContext)

  return (
    <div className="w-full space-y-8">
      <StepHeader
        title={t('delivery.title', {
          defaultValue: 'Tell customers where you deliver',
        })}
        subtitle={t('delivery.subtitle', {
          defaultValue: 'Set up your delivery zones, fees, and estimated times.',
        })}
      />

      <div className="space-y-6">
        {draft.deliveryZones.map((zone, idx) => {
          const nameErrorKey = errors[`deliveryZones.${idx}.name`]
          const feeErrorKey = errors[`deliveryZones.${idx}.feeRwf`]
          const etaErrorKey = errors[`deliveryZones.${idx}.etaMinutes`]

          const hasNameError = showErrors && !!nameErrorKey
          const hasFeeError = showErrors && !!feeErrorKey
          const hasEtaError = showErrors && !!etaErrorKey

          return (
            <div
              key={idx}
              className="relative rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  {t('delivery.zoneTitle', {
                    defaultValue: 'Zone {index}',
                    index: idx + 1,
                  })}
                </h3>
                {draft.deliveryZones.length > 1 && (
                  <button
                    type="button"
                    className="text-gray-400 transition-colors hover:text-red-500"
                    onClick={() => removeDeliveryZone(idx)}
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="relative space-y-0 md:col-span-2">
                  <Label
                    htmlFor={`onboarding-zone-name-${idx}`}
                    className="text-sm font-semibold text-gray-700"
                  >
                    {t('delivery.zoneName', { defaultValue: 'Zone Name' })}
                  </Label>
                  <div
                    className={cn(
                      'mt-1 flex items-center border-b py-2 transition-colors',
                      hasNameError
                        ? 'border-red-500 focus-within:border-red-500'
                        : 'focus-within:border-primary-base border-stroke-soft-200'
                    )}
                  >
                    <Input
                      id={`onboarding-zone-name-${idx}`}
                      value={zone.name}
                      onChange={(e) => updateDeliveryZone(idx, { name: e.target.value })}
                      aria-invalid={hasNameError || undefined}
                      className="rounded-none border-0 bg-transparent px-0 text-base shadow-none focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-base/40 focus-visible:ring-offset-0"
                      placeholder="e.g. Kigali City Center"
                    />
                  </div>
                  {hasNameError && (
                    <div className="absolute bg-white pt-1 text-xs font-medium text-red-500" role="alert">
                      {t(nameErrorKey as any)}
                    </div>
                  )}
                </div>
                <div className="relative space-y-0">
                  <Label
                    htmlFor={`onboarding-zone-fee-${idx}`}
                    className="text-sm font-semibold text-gray-700"
                  >
                    {t('delivery.fee', { defaultValue: 'Delivery Fee (RWF)' })}
                  </Label>
                  <div
                    className={cn(
                      'mt-1 flex items-center border-b py-2 transition-colors',
                      hasFeeError
                        ? 'border-red-500 focus-within:border-red-500'
                        : 'focus-within:border-primary-base border-stroke-soft-200'
                    )}
                  >
                    <Input
                      id={`onboarding-zone-fee-${idx}`}
                      inputMode="numeric"
                      value={String(zone.feeRwf)}
                      onChange={(e) =>
                        updateDeliveryZone(idx, {
                          feeRwf: toSafeInt(e.target.value),
                        })
                      }
                      aria-invalid={hasFeeError || undefined}
                      className="rounded-none border-0 bg-transparent px-0 text-base shadow-none focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-base/40 focus-visible:ring-offset-0"
                      placeholder="1000"
                    />
                  </div>
                  {hasFeeError && (
                    <div className="absolute bg-white pt-1 text-xs font-medium text-red-500" role="alert">
                      {t(feeErrorKey as any)}
                    </div>
                  )}
                </div>
                <div className="relative space-y-0">
                  <Label
                    htmlFor={`onboarding-zone-eta-${idx}`}
                    className="text-sm font-semibold text-gray-700"
                  >
                    {t('delivery.eta', { defaultValue: 'ETA (Minutes)' })}
                  </Label>
                  <div
                    className={cn(
                      'mt-1 flex items-center border-b py-2 transition-colors',
                      hasEtaError
                        ? 'border-red-500 focus-within:border-red-500'
                        : 'focus-within:border-primary-base border-stroke-soft-200'
                    )}
                  >
                    <Input
                      id={`onboarding-zone-eta-${idx}`}
                      inputMode="numeric"
                      value={String(zone.etaMinutes)}
                      onChange={(e) =>
                        updateDeliveryZone(idx, {
                          etaMinutes: toSafeInt(e.target.value),
                        })
                      }
                      aria-invalid={hasEtaError || undefined}
                      className="rounded-none border-0 bg-transparent px-0 text-base shadow-none focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-base/40 focus-visible:ring-offset-0"
                      placeholder="45"
                    />
                  </div>
                  {hasEtaError && (
                    <div className="absolute bg-white pt-1 text-xs font-medium text-red-500" role="alert">
                      {t(etaErrorKey as any)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}

        <button
          type="button"
          onClick={addDeliveryZone}
          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-stroke-soft-200 bg-gray-50 py-6 text-base font-semibold text-gray-900 transition-all hover:border-gray-400 hover:bg-gray-100 focus:outline-none"
        >
          <Plus className="h-5 w-5" />
          {t('delivery.addZone', { defaultValue: 'Add another zone' })}
        </button>
      </div>
    </div>
  )
}
