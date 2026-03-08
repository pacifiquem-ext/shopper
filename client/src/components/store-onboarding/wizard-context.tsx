'use client'

import { createContext, useContext } from 'react'
import { useTranslations } from 'next-intl'

export type WizardStepKey =
  | 'businessType'
  | 'industry'
  | 'legal'
  | 'businessAddress'
  | 'storeBasics'
  | 'subdomain'
  | 'brand'
  | 'delivery'
  | 'contact'

export const orderedSteps: WizardStepKey[] = [
  'businessType',
  'industry',
  'legal',
  'businessAddress',
  'storeBasics',
  'subdomain',
  'brand',
  'delivery',
  'contact',
]

export const urlSteps = [
  'business-type',
  'industry',
  'legal',
  'business-address',
  'store-basics',
  'subdomain',
  'brand',
  'delivery',
  'contact',
]

export interface WizardContextValue {
  showErrors: boolean
  errors: Record<string, string>
}

export const WizardContext = createContext<WizardContextValue>({ showErrors: false, errors: {} })

export function useWizardField(fieldName: string) {
  const { showErrors, errors } = useContext(WizardContext)
  const t = useTranslations('storeOnboarding')
  const errorKey = errors[fieldName]
  const errorMessage = errorKey ? t(errorKey as any) : null

  return {
    hasError: showErrors && !!errorKey,
    errorMessage: showErrors ? errorMessage : null,
  }
}
