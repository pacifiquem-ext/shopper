'use client'

import { useMemo, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useRouter } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { Store, ChevronLeft, ChevronRight, Check, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import { StepSubdomain } from '@/components/store-onboarding/step-subdomain'
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
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <WizardContext.Provider value={{ showErrors, errors: validation.errors || {} }}>
      <Dialog open={showResumeModal} onOpenChange={() => {}}>
        <DialogContent className="max-w-md border-0 p-8 shadow-2xl sm:rounded-2xl">
          <DialogHeader className="space-y-4">
            <DialogTitle className="text-center text-2xl font-bold text-gray-900">
              {t('resumeModal.title')}
            </DialogTitle>
            <DialogDescription className="text-center text-base text-gray-600">
              {t('resumeModal.description')}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-8 flex flex-col gap-3">
            <Button
              onClick={() => {
                const step = resumeDraft()
                navigateToStep(step)
              }}
              className="bg-primary-darker hover:bg-primary-darker w-full rounded-full py-6 text-base font-bold shadow-regular-xs transition-transform active:scale-95"
            >
              {t('resumeModal.resumeButton')}
            </Button>
            <Button
              variant="outline"
              onClick={discardDraft}
              className="w-full rounded-full border-stroke-soft-200 py-6 text-base font-bold text-gray-700 transition-colors hover:bg-gray-50"
            >
              {t('resumeModal.discardButton')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="flex min-h-screen flex-col overflow-x-hidden bg-white">
        {/* HEADER */}
        <header className="flex w-full items-center justify-between px-6 py-5 md:px-10 md:py-8">
          <div className="flex items-center gap-2">
            {/* Logo or brand icon */}
            <div className="text-primary-base flex items-center gap-2 text-xl font-bold tracking-tight">
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
              disabled={isSavingDraft || isSubmitting}
            >
              {isSavingDraft && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('header.saveExit', { defaultValue: 'Save & exit' })}
            </Button>
          </div>
        </header>

        {/* MAIN CONTENT Area */}
        <main className="mx-auto flex w-full max-w-[850px] flex-1 flex-col items-center justify-center px-6 pt-8 pb-32">
          <div className="animate-in fade-in slide-in-from-bottom-4 w-full max-w-[650px] duration-500">
            {/* Step titles are handled inside the step components to allow unique layouts */}
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
                case 'subdomain':
                  return <StepSubdomain />
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
              {!isFirstStep && !isSubmitting ? (
                <button
                  type="button"
                  onClick={handleBack}
                  className="text-base font-semibold text-gray-900 underline transition-colors hover:text-gray-600 focus:outline-none"
                >
                  {t('actions.back', { defaultValue: 'Back' })}
                </button>
              ) : (
                <div className="w-10" />
              )}
            </div>

            {isLastStep ? (
              <Button
                type="button"
                className="rounded-lg bg-black px-10 py-6 text-base font-semibold text-white transition-transform hover:bg-gray-800 disabled:opacity-50"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="mr-2 animate-pulse text-xl">...</span>
                    {t('actions.submitting', { defaultValue: 'Submitting' })}
                  </>
                ) : (
                  <>{t('actions.finish', { defaultValue: 'Finish' })}</>
                )}
              </Button>
            ) : (
              <Button
                type="button"
                className="rounded-lg bg-black px-10 py-6 text-base font-semibold text-white transition-transform hover:bg-gray-800 disabled:opacity-50"
                onClick={handleNext}
              >
                {t('actions.next', { defaultValue: 'Next' })}
              </Button>
            )}
          </div>
        </footer>
      </div>
    </WizardContext.Provider>
  )
}
