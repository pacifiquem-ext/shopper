'use client'

import { useMemo, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useRouter } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import * as Button from '@/components/alignui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { RiLoader4Line, RiStore2Line } from '@remixicon/react'
import { useStoreOnboardingStore } from '@/store/store-onboarding.store'
import { useAuthStore } from '@/store/auth.store'

import {
  WizardContext,
  orderedSteps,
  urlSteps,
  WizardStepKey,
} from '@/components/store-onboarding/wizard-context'
import { validateStep } from '@/validations/store-onboarding'
import { StepBusinessType } from '@/components/store-onboarding/step-business-type'
import { StepIndustry } from '@/components/store-onboarding/step-industry'
import { StepLegal } from '@/components/store-onboarding/step-legal'
import { StepBusinessAddress } from '@/components/store-onboarding/step-business-address'
import { StepStoreBasics } from '@/components/store-onboarding/step-store-basics'
import { StepSlug } from '@/components/store-onboarding/step-slug'
import { StepBrand } from '@/components/store-onboarding/step-brand'
import { StepDelivery } from '@/components/store-onboarding/step-delivery'
import { StepContact } from '@/components/store-onboarding/step-contact'
import { cn } from '@/utils/helpers'
import { merchantSignupHref } from '@/lib/auth-return-url'

export default function StoreOnboardingPage() {
  const t = useTranslations('storeOnboarding')
  const searchParams = useSearchParams()
  const router = useRouter()
  const stepParam = searchParams.get('step')

  // Derive current step
  const stepIndex = stepParam ? Math.max(0, urlSteps.indexOf(stepParam)) : 0
  const stepKey: WizardStepKey = orderedSteps[stepIndex]

  const {
    draft,
    resetDraft,
    isLoadingDraft,
    isSavingDraft,
    isSubmitting,
    loadDraft,
    saveDraft,
    submitStore,
    showResumeModal,
    resumeDraft,
    discardDraft,
  } = useStoreOnboardingStore()

  const [showErrors, setShowErrors] = useState(false)
  const [isAuthReady, setIsAuthReady] = useState(false)

  // Require sign-in before store setup; new merchants arrive here after signup → login
  useEffect(() => {
    const init = () => {
      if (!useAuthStore.getState().accessToken) {
        router.replace(merchantSignupHref() as Parameters<typeof router.replace>[0])
        return
      }
      setIsAuthReady(true)
      loadDraft()
    }

    if (useAuthStore.persist.hasHydrated()) {
      init()
      return
    }

    return useAuthStore.persist.onFinishHydration(init)
  }, [loadDraft, router])

  const ensureAuthenticated = () => {
    if (useAuthStore.getState().accessToken) return true
    toast.error(t('authRequired'))
    router.replace(merchantSignupHref() as Parameters<typeof router.replace>[0])
    return false
  }

  const handleAuthFailure = () => {
    useAuthStore.getState().logout()
    return ensureAuthenticated()
  }

  // Validate the current step
  const validation = useMemo(() => validateStep(stepKey, draft), [stepKey, draft])

  const navigateToStep = (index: number) => {
    if (index >= 0 && index < orderedSteps.length) {
      setShowErrors(false)
      router.push(`/store?step=${urlSteps[index]}` as Parameters<typeof router.push>[0])
    }
  }

  const handleNext = () => {
    if (!validation.ok) {
      setShowErrors(true)
      if (validation.messageKey) {
        toast.error(t(validation.messageKey as any))
      }
      return
    }
    navigateToStep(stepIndex + 1)
  }

  const handleBack = () => {
    navigateToStep(stepIndex - 1)
  }

  const handleSubmit = async () => {
    if (!validation.ok) {
      setShowErrors(true)
      if (validation.messageKey) {
        toast.error(t(validation.messageKey as any))
      }
      return
    }

    if (!ensureAuthenticated()) return

    try {
      await submitStore()

      toast.success(t('successText'))
      resetDraft()
      router.push('/dashboard' as Parameters<typeof router.push>[0])
    } catch (error) {
      const status = (error as { response?: { status?: number } })?.response?.status
      if (status === 401) {
        handleAuthFailure()
        return
      }
    }
  }

  const handleSaveAndExit = async () => {
    if (!useAuthStore.getState().accessToken) {
      router.push('/' as Parameters<typeof router.push>[0])
      return
    }

    try {
      await saveDraft(stepIndex + 1)
      router.push('/' as Parameters<typeof router.push>[0])
    } catch (error) {
      const status = (error as { response?: { status?: number } })?.response?.status
      if (status === 401) {
        handleAuthFailure()
        return
      }
    }
  }

  const isFirstStep = stepIndex === 0
  const isLastStep = stepIndex === orderedSteps.length - 1

  if (!isAuthReady || isLoadingDraft) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-weak-50">
        <div className="flex flex-col items-center gap-3">
          <RiLoader4Line className="size-8 animate-spin text-primary-base" aria-hidden />
          <p className="text-paragraph-sm text-text-sub-600">{t('loading')}</p>
        </div>
      </div>
    )
  }

  return (
    <WizardContext.Provider value={{ showErrors, errors: validation.errors || {} }}>
      <Dialog open={showResumeModal} onOpenChange={() => {}}>
        <DialogContent className="max-w-md rounded-20 border border-stroke-soft-200 bg-bg-white-0 p-8 shadow-regular-md">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-center text-title-h6 text-text-strong-950">
              {t('resumeModal.title')}
            </DialogTitle>
            <DialogDescription className="text-center text-paragraph-sm text-text-sub-600">
              {t('resumeModal.description')}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-6 flex flex-col gap-3">
            <Button.Root
              type="button"
              variant="primary"
              mode="filled"
              size="medium"
              className="w-full"
              onClick={() => {
                const step = resumeDraft()
                navigateToStep(step)
              }}
            >
              {t('resumeModal.resumeButton')}
            </Button.Root>
            <Button.Root
              type="button"
              variant="neutral"
              mode="stroke"
              size="medium"
              className="w-full"
              onClick={discardDraft}
            >
              {t('resumeModal.discardButton')}
            </Button.Root>
          </div>
        </DialogContent>
      </Dialog>

      <div className="flex min-h-screen flex-col overflow-x-hidden bg-bg-weak-50">
        <header className="sticky top-0 z-40 border-b border-stroke-soft-200/80 bg-bg-white-0/90 backdrop-blur-md">
          <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
            <div className="flex items-center gap-2.5">
              <span className="grid size-9 place-items-center rounded-10 bg-primary-base text-static-white">
                <RiStore2Line className="size-4" aria-hidden />
              </span>
              <div className="leading-tight">
                <p className="text-label-sm text-text-strong-950">{t('header.brand')}</p>
                <p className="text-paragraph-xs text-text-sub-600">{t('header.setup')}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button.Root
                type="button"
                variant="neutral"
                mode="stroke"
                size="small"
                onClick={handleSaveAndExit}
                disabled={isSavingDraft || isSubmitting}
              >
                {isSavingDraft ? (
                  <Button.Icon as={RiLoader4Line} className="animate-spin" />
                ) : null}
                {t('header.saveExit')}
              </Button.Root>
            </div>
          </div>
        </header>

        <main className="mx-auto flex w-full max-w-[720px] flex-1 flex-col px-4 pt-10 pb-36 sm:px-6">
          <div className="mb-8">
            <div className="mb-2 flex items-center justify-between gap-3">
              <p className="text-label-xs uppercase tracking-[0.12em] text-primary-base">
                {t('stepLabel', {
                  step: stepIndex + 1,
                  total: orderedSteps.length,
                })}
              </p>
              <p className="text-paragraph-xs text-text-soft-400">
                {Math.round(((stepIndex + 1) / orderedSteps.length) * 100)}%
              </p>
            </div>
            <div className="flex w-full items-center gap-1.5" aria-hidden>
              {orderedSteps.map((_, idx) => {
                const isDone = idx <= stepIndex
                return (
                  <div
                    key={idx}
                    className={cn(
                      'h-1.5 w-full rounded-full transition-colors duration-300',
                      isDone ? 'bg-primary-base' : 'bg-stroke-soft-200',
                    )}
                  />
                )
              })}
            </div>
          </div>

          <div className="w-full rounded-20 border border-stroke-soft-200 bg-bg-white-0 p-6 shadow-regular-xs sm:p-8">
            {(() => {
              switch (stepKey) {
                case 'businessType':
                  return <StepBusinessType />
                case 'industry':
                  return <StepIndustry />
                case 'legal':
                  return <StepLegal />
                case 'businessAddress':
                  return <StepBusinessAddress />
                case 'storeBasics':
                  return <StepStoreBasics />
                case 'slug':
                  return <StepSlug />
                case 'brand':
                  return <StepBrand />
                case 'delivery':
                  return <StepDelivery />
                case 'contact':
                  return <StepContact />
                default:
                  return null
              }
            })()}
          </div>
        </main>

        <footer className="fixed inset-x-0 bottom-0 z-50 border-t border-stroke-soft-200 bg-bg-white-0/95 backdrop-blur-md">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
            <div>
              {!isFirstStep && !isSubmitting ? (
                <Button.Root
                  type="button"
                  variant="neutral"
                  mode="ghost"
                  size="medium"
                  onClick={handleBack}
                >
                  {t('actions.back')}
                </Button.Root>
              ) : (
                <div className="w-10" />
              )}
            </div>

            {isLastStep ? (
              <Button.Root
                type="button"
                variant="primary"
                mode="filled"
                size="medium"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="min-w-[8rem]"
              >
                {isSubmitting ? (
                  <>
                    <Button.Icon as={RiLoader4Line} className="animate-spin" />
                    {t('actions.submitting')}
                  </>
                ) : (
                  t('actions.finish')
                )}
              </Button.Root>
            ) : (
              <Button.Root
                type="button"
                variant="primary"
                mode="filled"
                size="medium"
                onClick={handleNext}
                className="min-w-[8rem]"
              >
                {t('actions.next')}
              </Button.Root>
            )}
          </div>
        </footer>
      </div>
    </WizardContext.Provider>
  )
}
