'use client'

import { Plus, Store, UploadCloud, UtensilsCrossed, X } from 'lucide-react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useMemo, useRef, useState, createContext, useContext } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useRouter, usePathname } from '@/i18n/navigation'
import { cn } from '@/lib/utils'
import { useStoreOnboardingStore } from '@/store/store-onboarding.store'

type WizardStepKey = 'businessType' | 'storeBasics' | 'subdomain' | 'brand' | 'delivery' | 'contact'

const orderedSteps: WizardStepKey[] = [
  'businessType',
  'storeBasics',
  'subdomain',
  'brand',
  'delivery',
  'contact',
]

const urlSteps = ['business-type', 'store-basics', 'subdomain', 'brand', 'delivery', 'contact']

interface WizardContextValue {
  showErrors: boolean
  errors: Record<string, string>
}

const WizardContext = createContext<WizardContextValue>({ showErrors: false, errors: {} })

function useWizardField(fieldName: string) {
  const { showErrors, errors } = useContext(WizardContext)
  const t = useTranslations('storeOnboarding')
  const errorKey = errors[fieldName]
  const errorMessage = errorKey ? t(errorKey as any) : null

  return {
    hasError: showErrors && !!errorKey,
    errorMessage: showErrors ? errorMessage : null,
  }
}

function clampStepIndex(stepIndex: number) {
  if (Number.isNaN(stepIndex)) return 0
  return Math.min(Math.max(stepIndex, 0), orderedSteps.length - 1)
}

function getStepIndexFromSearchParams(value: string | null) {
  if (!value) return 0
  // Support old numbered steps just in case, but rely on named steps
  const parsed = Number(value)
  if (Number.isFinite(parsed)) {
    return clampStepIndex(parsed - 1)
  }
  const index = urlSteps.indexOf(value)
  if (index === -1) return 0
  return clampStepIndex(index)
}

export function StoreOnboardingWizard() {
  const t = useTranslations('storeOnboarding')
  const router = useRouter()
  const pathname = usePathname()
  const { draft, resetDraft } = useStoreOnboardingStore()

  const [stepIndex, setStepIndex] = useState(() => {
    if (typeof window === 'undefined') return 0
    const params = new URLSearchParams(window.location.search)
    return getStepIndexFromSearchParams(params.get('step'))
  })

  const stepKey = orderedSteps[stepIndex]
  const canGoBack = stepIndex > 0
  const validation = useMemo(() => validateStep(stepKey, draft), [draft, stepKey])
  const [showErrors, setShowErrors] = useState(false)

  function setUrlStep(nextIndex: number) {
    const clamped = clampStepIndex(nextIndex)
    setStepIndex(clamped)
    setShowErrors(false)
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      params.set('step', urlSteps[clamped])
      router.replace(`${pathname}?${params.toString()}`)
    }
  }

  function goNext() {
    if (!validation.ok) {
      setShowErrors(true)
      if (validation.messageKey) {
        toast.error(t(validation.messageKey as any))
      }
      return
    }
    setUrlStep(stepIndex + 1)
  }

  function goBack() {
    if (!canGoBack) return
    setUrlStep(stepIndex - 1)
  }

  function handleSaveAndExit() {
    router.push('/')
  }

  // Airbnb style: No big border around main content, very clean floating forms.
  // Using overflow-x-hidden strictly here avoids horizontal scrolls entirely on wide setups
  return (
    <WizardContext.Provider value={{ showErrors, errors: validation.errors || {} }}>
      <div className="flex min-h-screen flex-col overflow-x-hidden bg-white">
        {/* HEADER */}
        <header className="flex w-full items-center justify-between px-6 py-5 md:px-10 md:py-8">
          <div className="flex items-center gap-2">
            {/* Logo or brand icon */}
            <div className="text-brand-900 flex items-center gap-2 text-xl font-bold tracking-tight">
              <Store className="h-8 w-8" />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button
              type="button"
              variant="outline"
              className="rounded-full px-5 text-sm font-medium"
            >
              {t('header.help', { defaultValue: 'Questions?' })}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="rounded-full px-5 text-sm font-medium"
              onClick={handleSaveAndExit}
            >
              {t('header.saveExit', { defaultValue: 'Save & exit' })}
            </Button>
          </div>
        </header>

        {/* MAIN CONTENT */}
        <main className="mx-auto flex w-full max-w-[850px] flex-1 flex-col items-center justify-center px-6 pt-8 pb-32">
          <div className="animate-in fade-in slide-in-from-bottom-4 w-full max-w-[650px] duration-500">
            {/* Step titles are handled inside the step components to allow unique layouts */}
            {stepKey === 'businessType' && <StepBusinessType />}
            {stepKey === 'storeBasics' && <StepStoreBasics />}
            {stepKey === 'subdomain' && <StepSubdomain />}
            {stepKey === 'brand' && <StepBrand />}
            {stepKey === 'delivery' && <StepDelivery />}
            {stepKey === 'contact' && <StepContact />}
          </div>
        </main>

        {/* FOOTER & PROGRESS */}
        <footer className="fixed inset-x-0 bottom-0 z-50 bg-white">
          <div className="flex w-full items-center gap-2 px-6 pt-1 pb-4">
            {orderedSteps.map((_, idx) => {
              const isDone = idx <= stepIndex
              return (
                <div
                  key={idx}
                  className={cn(
                    'h-1.5 w-full rounded-full transition-colors duration-300',
                    isDone ? 'bg-black' : 'bg-gray-200'
                  )}
                />
              )
            })}
          </div>

          <div className="flex items-center justify-between px-6 py-4 md:px-10 md:pb-6">
            <div>
              {canGoBack ? (
                <button
                  type="button"
                  onClick={goBack}
                  className="text-base font-semibold text-gray-900 underline transition-colors hover:text-gray-600 focus:outline-none"
                >
                  {t('actions.back', { defaultValue: 'Back' })}
                </button>
              ) : (
                <div className="w-10" />
              )}
            </div>

            <Button
              type="button"
              className="rounded-lg bg-black px-10 py-6 text-base font-semibold text-white transition-transform hover:bg-gray-800 disabled:opacity-50"
              onClick={goNext}
            >
              {stepIndex === orderedSteps.length - 1
                ? t('actions.finish', { defaultValue: 'Finish' })
                : t('actions.next', { defaultValue: 'Next' })}
            </Button>
          </div>
        </footer>
      </div>
    </WizardContext.Provider>
  )
}

function StepHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-10 text-center md:mb-12">
      <h1 className="text-3xl font-semibold tracking-tight text-gray-900 md:text-5xl">{title}</h1>
      {subtitle && <p className="mt-4 text-lg text-gray-500">{subtitle}</p>}
    </div>
  )
}

function StepBusinessType() {
  const t = useTranslations('storeOnboarding')
  const { draft, setBusinessType } = useStoreOnboardingStore()

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
          onClick={() => setBusinessType('retail')}
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
          onClick={() => setBusinessType('restaurant')}
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

function StepStoreBasics() {
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
          <Label className="text-sm font-semibold text-gray-700">
            {t('storeBasics.registeredNameLabel', {
              defaultValue: 'Registered Business Name',
            })}
          </Label>
          <div
            className={cn(
              'flex items-center border-b py-2 transition-colors',
              registeredNameField.hasError
                ? 'border-red-500 focus-within:border-red-500'
                : 'focus-within:border-brand-600 border-gray-300'
            )}
          >
            <Input
              value={draft.registeredName}
              onChange={(e) => setRegisteredName(e.target.value)}
              className="rounded-none border-0 bg-transparent px-0 pb-1 text-lg shadow-none focus:outline-none focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0"
              placeholder={t('storeBasics.registeredNamePlaceholder')}
            />
          </div>
          {registeredNameField.hasError && (
            <div className="absolute bg-white pt-1 text-xs font-medium text-red-500">
              {registeredNameField.errorMessage}
            </div>
          )}
        </div>

        <div className="relative space-y-0 pt-4">
          <Label className="text-sm font-semibold text-gray-700">
            {t('storeBasics.displayNameLabel', {
              defaultValue: 'Store Display Name',
            })}
          </Label>
          <div
            className={cn(
              'flex items-center border-b py-2 transition-colors',
              displayNameField.hasError
                ? 'border-red-500 focus-within:border-red-500'
                : 'focus-within:border-brand-600 border-gray-300'
            )}
          >
            <Input
              value={draft.displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="rounded-none border-0 bg-transparent px-0 pb-1 text-lg shadow-none focus:outline-none focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0"
              placeholder={t('storeBasics.displayNamePlaceholder')}
            />
          </div>
          {displayNameField.hasError && (
            <div className="absolute bg-white pt-1 text-xs font-medium text-red-500">
              {displayNameField.errorMessage}
            </div>
          )}
        </div>

        <div className="relative pt-4">
          <Label className="text-sm font-semibold text-gray-700">
            {t('storeBasics.descriptionLabel', {
              defaultValue: 'Store Description',
            })}
          </Label>
          <div className="focus-within:border-brand-600 border-b border-gray-300 transition-colors">
            <Textarea
              value={draft.description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-2 min-h-[120px] resize-none rounded-none border-0 bg-transparent px-0 text-lg shadow-none focus:outline-none focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0"
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

function StepSubdomain() {
  const t = useTranslations('storeOnboarding')
  const { draft, setSubdomain } = useStoreOnboardingStore()

  const subdomainField = useWizardField('subdomain')

  const fullDomain = draft.subdomain.trim()
    ? `${draft.subdomain.trim()}.onlineshop.rw`
    : `_____.onlineshop.rw`

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
              value={draft.subdomain}
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
            <li>Letters, numbers, and hyphens only</li>
            <li>Cannot start or end with a hyphen</li>
            <li>Must be between 2 and 63 characters</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

function StepBrand() {
  const t = useTranslations('storeOnboarding')
  const { draft, setBrandPrimaryColor, setBrandSecondaryColor, setLogoDataUrl } =
    useStoreOnboardingStore()

  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const brandPrimaryColorField = useWizardField('brandPrimaryColor')
  const brandSecondaryColorField = useWizardField('brandSecondaryColor')

  async function handlePickLogo(file: File | null) {
    if (!file) return

    setIsUploading(true)
    try {
      const dataUrl = await readFileAsDataUrl(file)
      setLogoDataUrl(dataUrl)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-8">
      <StepHeader
        title={t('brand.title', {
          defaultValue: 'Add some photos and brand colors',
        })}
        subtitle={t('brand.subtitle', {
          defaultValue: "You'll need a logo and your brand colors to get started.",
        })}
      />

      <div className="space-y-8">
        <div>
          {/* Airbnb style drag and drop box */}
          {draft.logoDataUrl ? (
            <div className="relative flex aspect-video w-full flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 transition-colors hover:bg-gray-100">
              <Image src={draft.logoDataUrl} alt="Logo" fill className="object-contain p-4" />
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity hover:opacity-100">
                <Button type="button" variant="secondary" onClick={() => setLogoDataUrl(null)}>
                  Remove logo
                </Button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="focus:border-brand-600 flex aspect-video w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-400 bg-gray-50 transition-all hover:bg-gray-100 focus:outline-none"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handlePickLogo(e.target.files?.[0] ?? null)}
              />
              <UploadCloud className="mb-4 h-12 w-12 stroke-[1.5] text-gray-700" />
              <div className="text-xl font-semibold text-gray-900">Upload your logo</div>
              <div className="mt-2 text-sm text-gray-500">Click to browse or drag and drop</div>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="relative space-y-0">
            <Label className="text-sm font-semibold text-gray-700">
              {t('brand.primaryColor', { defaultValue: 'Primary Color' })}
            </Label>
            <div
              className={cn(
                'relative mt-2 flex h-14 items-center rounded-full border px-2 transition-colors focus-within:border-2',
                brandPrimaryColorField.hasError
                  ? 'border-red-500 focus-within:border-red-500'
                  : 'focus-within:border-brand-600 border-gray-300'
              )}
            >
              <input
                type="color"
                value={draft.brandPrimaryColor}
                onChange={(e) => setBrandPrimaryColor(e.target.value)}
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              />
              <div
                className="pointer-events-none h-10 w-10 shrink-0 rounded-full border border-black/10 shadow-sm"
                style={{ backgroundColor: draft.brandPrimaryColor }}
              />
              <div className="pointer-events-none ml-4 flex-1 bg-transparent text-lg font-medium tracking-wider text-gray-900 uppercase">
                {draft.brandPrimaryColor}
              </div>
            </div>
            {brandPrimaryColorField.hasError && (
              <div className="absolute bg-white pt-1 text-xs font-medium text-red-500">
                {brandPrimaryColorField.errorMessage}
              </div>
            )}
          </div>
          <div className="relative space-y-0">
            <Label className="text-sm font-semibold text-gray-700">
              {t('brand.secondaryColor', { defaultValue: 'Secondary Color' })}
            </Label>
            <div
              className={cn(
                'relative mt-2 flex h-14 items-center rounded-full border px-2 transition-colors focus-within:border-2',
                brandSecondaryColorField.hasError
                  ? 'border-red-500 focus-within:border-red-500'
                  : 'focus-within:border-brand-600 border-gray-300'
              )}
            >
              <input
                type="color"
                value={draft.brandSecondaryColor}
                onChange={(e) => setBrandSecondaryColor(e.target.value)}
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              />
              <div
                className="pointer-events-none h-10 w-10 shrink-0 rounded-full border border-black/10 shadow-sm"
                style={{ backgroundColor: draft.brandSecondaryColor }}
              />
              <div className="pointer-events-none ml-4 flex-1 bg-transparent text-lg font-medium tracking-wider text-gray-900 uppercase">
                {draft.brandSecondaryColor}
              </div>
            </div>
            {brandSecondaryColorField.hasError && (
              <div className="absolute bg-white pt-1 text-xs font-medium text-red-500">
                {brandSecondaryColorField.errorMessage}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function StepDelivery() {
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
                <h3 className="text-lg font-semibold text-gray-900">Zone {idx + 1}</h3>
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
                  <Label className="text-sm font-semibold text-gray-700">
                    {t('delivery.zoneName', { defaultValue: 'Zone Name' })}
                  </Label>
                  <div
                    className={cn(
                      'mt-1 flex items-center border-b py-2 transition-colors',
                      hasNameError
                        ? 'border-red-500 focus-within:border-red-500'
                        : 'focus-within:border-brand-600 border-gray-300'
                    )}
                  >
                    <Input
                      value={zone.name}
                      onChange={(e) => updateDeliveryZone(idx, { name: e.target.value })}
                      className="rounded-none border-0 bg-transparent px-0 text-base shadow-none focus:outline-none focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0"
                      placeholder="e.g. Kigali City Center"
                    />
                  </div>
                  {hasNameError && (
                    <div className="absolute bg-white pt-1 text-xs font-medium text-red-500">
                      {t(nameErrorKey as any)}
                    </div>
                  )}
                </div>
                <div className="relative space-y-0">
                  <Label className="text-sm font-semibold text-gray-700">
                    {t('delivery.fee', { defaultValue: 'Delivery Fee (RWF)' })}
                  </Label>
                  <div
                    className={cn(
                      'mt-1 flex items-center border-b py-2 transition-colors',
                      hasFeeError
                        ? 'border-red-500 focus-within:border-red-500'
                        : 'focus-within:border-brand-600 border-gray-300'
                    )}
                  >
                    <Input
                      inputMode="numeric"
                      value={String(zone.feeRwf)}
                      onChange={(e) =>
                        updateDeliveryZone(idx, {
                          feeRwf: toSafeInt(e.target.value),
                        })
                      }
                      className="rounded-none border-0 bg-transparent px-0 text-base shadow-none focus:outline-none focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0"
                      placeholder="1000"
                    />
                  </div>
                  {hasFeeError && (
                    <div className="absolute bg-white pt-1 text-xs font-medium text-red-500">
                      {t(feeErrorKey as any)}
                    </div>
                  )}
                </div>
                <div className="relative space-y-0">
                  <Label className="text-sm font-semibold text-gray-700">
                    {t('delivery.eta', { defaultValue: 'ETA (Minutes)' })}
                  </Label>
                  <div
                    className={cn(
                      'mt-1 flex items-center border-b py-2 transition-colors',
                      hasEtaError
                        ? 'border-red-500 focus-within:border-red-500'
                        : 'focus-within:border-brand-600 border-gray-300'
                    )}
                  >
                    <Input
                      inputMode="numeric"
                      value={String(zone.etaMinutes)}
                      onChange={(e) =>
                        updateDeliveryZone(idx, {
                          etaMinutes: toSafeInt(e.target.value),
                        })
                      }
                      className="rounded-none border-0 bg-transparent px-0 text-base shadow-none focus:outline-none focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0"
                      placeholder="45"
                    />
                  </div>
                  {hasEtaError && (
                    <div className="absolute bg-white pt-1 text-xs font-medium text-red-500">
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
          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 py-6 text-base font-semibold text-gray-900 transition-all hover:border-gray-400 hover:bg-gray-100 focus:outline-none"
        >
          <Plus className="h-5 w-5" />
          {t('delivery.addZone', { defaultValue: 'Add another zone' })}
        </button>
      </div>
    </div>
  )
}

function StepContact() {
  const t = useTranslations('storeOnboarding')
  const { draft, setContactEmail, setContactPhone, setAddress, setAboutUs } =
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
          <Label className="text-sm font-semibold text-gray-700">
            {t('contact.emailLabel', {
              defaultValue: 'Contact Email',
            })}
            <span className="ml-1 text-xs font-normal text-gray-500">(Optional)</span>
          </Label>
          <div className="focus-within:border-brand-600 flex items-center border-b border-gray-300 py-2 transition-colors">
            <Input
              type="email"
              value={draft.contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className="rounded-none border-0 bg-transparent px-0 pb-1 text-lg shadow-none focus:outline-none focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0"
              placeholder="e.g. hello@mystore.rw"
            />
          </div>
        </div>

        <div className="relative space-y-0 pt-4">
          <Label className="text-sm font-semibold text-gray-700">
            {t('contact.phoneLabel', {
              defaultValue: 'Contact Phone Number',
            })}
            <span className="ml-1 text-xs font-normal text-gray-500">(Optional)</span>
          </Label>
          <div className="focus-within:border-brand-600 flex items-center border-b border-gray-300 py-2 transition-colors">
            <Input
              type="tel"
              value={draft.contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              className="rounded-none border-0 bg-transparent px-0 pb-1 text-lg shadow-none focus:outline-none focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0"
              placeholder="+250 780 000 000"
            />
          </div>
        </div>

        <div className="relative pt-4">
          <Label className="text-sm font-semibold text-gray-700">
            {t('contact.addressLabel', {
              defaultValue: 'Physical Address / Headquarters',
            })}
            <span className="ml-1 text-xs font-normal text-gray-500">(Optional)</span>
          </Label>
          <div className="focus-within:border-brand-600 border-b border-gray-300 transition-colors">
            <Textarea
              value={draft.address}
              onChange={(e) => setAddress(e.target.value)}
              className="mt-2 min-h-[120px] resize-none rounded-none border-0 bg-transparent px-0 text-lg shadow-none focus:outline-none focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0"
              placeholder="123 Kigali Business Centre, KN 5 Rd..."
              maxLength={300}
            />
          </div>
        </div>

        <div className="relative pt-4">
          <Label className="text-sm font-semibold text-gray-700">
            {t('contact.aboutUsLabel', {
              defaultValue: 'About us',
            })}
            <span className="ml-1 text-xs font-normal text-gray-500">(Optional)</span>
          </Label>
          <div className="focus-within:border-brand-600 border-b border-gray-300 transition-colors">
            <Textarea
              value={draft.aboutUs}
              onChange={(e) => setAboutUs(e.target.value)}
              className="mt-2 min-h-[120px] resize-none rounded-none border-0 bg-transparent px-0 text-lg shadow-none focus:outline-none focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0"
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

function ConfirmResetDialog({ onConfirm }: { onConfirm: () => void }) {
  const t = useTranslations('storeOnboarding')

  return (
    <div className="fixed top-32 left-6 z-50 hidden md:block">
      <Dialog>
        <DialogTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            className="rounded-full text-gray-400 hover:text-gray-900"
          >
            {t('header.reset', { defaultValue: 'Reset progress' })}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reset progress</DialogTitle>
          </DialogHeader>
          <div className="text-sm text-gray-600">
            Are you sure you want to reset all your store details?
          </div>
          <div className="mt-4 flex items-center justify-end gap-2">
            <DialogTrigger asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogTrigger>
            <DialogTrigger asChild>
              <Button
                type="button"
                className="bg-red-600 text-white hover:bg-red-700"
                onClick={onConfirm}
              >
                Reset
              </Button>
            </DialogTrigger>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function toSafeInt(value: string) {
  const normalized = value.replace(/[^0-9]/g, '')
  if (!normalized) return 0
  const parsed = Number(normalized)
  if (!Number.isFinite(parsed)) return 0
  return Math.max(0, Math.round(parsed))
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('failed'))
    reader.onload = () => {
      const result = reader.result
      if (typeof result === 'string') resolve(result)
      else reject(new Error('failed'))
    }
    reader.readAsDataURL(file)
  })
}

function validateStep(
  step: WizardStepKey,
  draft: ReturnType<typeof useStoreOnboardingStore.getState>['draft']
) {
  const errors: Record<string, string> = {}

  switch (step) {
    case 'businessType': {
      if (!draft.businessType)
        return { ok: false, errors, messageKey: 'errors.pickBusinessType' as const }
      return { ok: true, errors, messageKey: 'errors.ok' as const }
    }
    case 'storeBasics': {
      if (!draft.registeredName.trim()) {
        errors.registeredName = 'errors.missingRegisteredName'
      }
      if (!draft.displayName.trim()) {
        errors.displayName = 'errors.missingDisplayName'
      }
      const ok = Object.keys(errors).length === 0
      return { ok, errors, messageKey: ok ? undefined : 'errors.missingRegisteredName' }
    }
    case 'subdomain': {
      const subdomain = draft.subdomain.trim()
      if (!subdomain) {
        errors.subdomain = 'errors.missingSubdomain'
      } else {
        const regex = /^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$/
        if (!regex.test(subdomain)) {
          errors.subdomain = 'errors.invalidSubdomain'
        }
      }
      const ok = Object.keys(errors).length === 0
      return { ok, errors, messageKey: ok ? undefined : 'errors.missingSubdomain' }
    }
    case 'brand': {
      if (!draft.brandPrimaryColor.trim() || !draft.brandSecondaryColor.trim()) {
        return { ok: false, errors, messageKey: 'errors.missingBrandColors' as const }
      }
      return { ok: true, errors, messageKey: 'errors.ok' as const }
    }
    case 'delivery': {
      let hasError = false
      for (let i = 0; i < draft.deliveryZones.length; i++) {
        const zone = draft.deliveryZones[i]
        if (!zone.name.trim()) {
          errors[`deliveryZones.${i}.name`] = 'errors.missingDeliveryZoneName'
          hasError = true
        }
        if (zone.feeRwf <= 0) {
          errors[`deliveryZones.${i}.feeRwf`] = 'errors.missingDeliveryFee'
          hasError = true
        }
        if (zone.etaMinutes <= 0) {
          errors[`deliveryZones.${i}.etaMinutes`] = 'errors.missingDeliveryEta'
          hasError = true
        }
      }
      if (hasError) {
        return { ok: false, errors, messageKey: 'errors.missingDeliveryZoneName' as const }
      }
      return { ok: true, errors, messageKey: 'errors.ok' as const }
    }
    case 'contact':
    default:
      return { ok: true, errors, messageKey: 'errors.ok' as const }
  }
}
