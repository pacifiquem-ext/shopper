'use client'

import { UploadCloud } from 'lucide-react'
import Image from 'next/image'
import { useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { processStoreLogoFile } from '@/lib/store-logo-image'
import { useStoreOnboardingStore } from '@/store/store-onboarding.store'
import { StepHeader } from './step-header'
import { useWizardField } from './wizard-context'

export function StepBrand() {
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
      const result = await processStoreLogoFile(file)
      if (!result.ok) {
        if (result.error === 'invalid_type') {
          toast.error(t('brand.logoErrors.invalidType'))
        } else if (result.error === 'too_small') {
          toast.error(
            t('brand.logoErrors.tooSmall', {
              width: result.width ?? 0,
              height: result.height ?? 0,
            }),
          )
        } else {
          toast.error(t('brand.logoErrors.loadFailed'))
        }
        return
      }
      setLogoDataUrl(result.dataUrl)
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
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
          {draft.logoDataUrl ? (
            <div className="relative mx-auto flex aspect-[4/5] w-full max-w-xs flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-stroke-soft-200 bg-gray-50 transition-colors hover:bg-gray-100 sm:mx-0 sm:max-w-sm">
              <Image
                src={draft.logoDataUrl}
                alt={t('brand.logoAlt')}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity hover:opacity-100">
                <Button type="button" variant="secondary" onClick={() => setLogoDataUrl(null)}>
                  {t('brand.removeLogoBtn', { defaultValue: 'Remove logo' })}
                </Button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
              className="focus:border-primary-base mx-auto flex aspect-[4/5] w-full max-w-xs flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-400 bg-gray-50 transition-all hover:bg-gray-100 focus:outline-none sm:mx-0 sm:max-w-sm"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => handlePickLogo(e.target.files?.[0] ?? null)}
              />
              <UploadCloud className="mb-4 h-12 w-12 stroke-[1.5] text-gray-700" />
              <div className="text-xl font-semibold text-gray-900">
                {isUploading
                  ? t('brand.uploading', { defaultValue: 'Uploading...' })
                  : t('brand.uploadLogo', { defaultValue: 'Upload your logo' })}
              </div>
              <div className="mt-2 px-6 text-center text-sm text-gray-500">
                {t('brand.dragDrop', { defaultValue: 'Click to browse or drag and drop' })}
              </div>
              <p className="mt-3 max-w-xs px-6 text-center text-xs text-gray-500">
                {t('brand.logoHint')}
              </p>
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
                  : 'focus-within:border-primary-base border-stroke-soft-200'
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
                  : 'focus-within:border-primary-base border-stroke-soft-200'
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
