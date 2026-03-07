'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type StoreOnboardingBusinessType = 'retail' | 'restaurant'

export interface StoreOnboardingDraft {
  businessType: StoreOnboardingBusinessType | null
  registeredName: string
  displayName: string
  description: string
  subdomain: string
  brandPrimaryColor: string
  brandSecondaryColor: string
  contactEmail: string
  contactPhone: string
  address: string
  aboutUs: string
  logoDataUrl: string | null
  deliveryZones: Array<{
    name: string
    feeRwf: number
    etaMinutes: number
  }>
}

interface StoreOnboardingState {
  draft: StoreOnboardingDraft

  setBusinessType: (type: StoreOnboardingBusinessType) => void
  setRegisteredName: (value: string) => void
  setDisplayName: (value: string) => void
  setDescription: (value: string) => void
  setSubdomain: (value: string) => void
  setBrandPrimaryColor: (value: string) => void
  setBrandSecondaryColor: (value: string) => void
  setContactEmail: (value: string) => void
  setContactPhone: (value: string) => void
  setAddress: (value: string) => void
  setAboutUs: (value: string) => void
  setLogoDataUrl: (value: string | null) => void

  addDeliveryZone: () => void
  updateDeliveryZone: (
    index: number,
    patch: Partial<StoreOnboardingDraft['deliveryZones'][number]>
  ) => void
  removeDeliveryZone: (index: number) => void

  resetDraft: () => void
}

const initialDraft: StoreOnboardingDraft = {
  businessType: null,
  registeredName: '',
  displayName: '',
  description: '',
  subdomain: '',
  brandPrimaryColor: '#1d4ed8',
  brandSecondaryColor: '#e8edfb',
  contactEmail: '',
  contactPhone: '',
  address: '',
  aboutUs: '',
  logoDataUrl: null,
  deliveryZones: [
    {
      name: '',
      feeRwf: 0,
      etaMinutes: 0,
    },
  ],
}

export const useStoreOnboardingStore = create<StoreOnboardingState>()(
  persist(
    (set) => ({
      draft: initialDraft,

      setBusinessType: (businessType) =>
        set((state) => ({ draft: { ...state.draft, businessType } })),
      setRegisteredName: (registeredName) =>
        set((state) => ({ draft: { ...state.draft, registeredName } })),
      setDisplayName: (displayName) => set((state) => ({ draft: { ...state.draft, displayName } })),
      setDescription: (description) => set((state) => ({ draft: { ...state.draft, description } })),
      setSubdomain: (subdomain) => set((state) => ({ draft: { ...state.draft, subdomain } })),
      setBrandPrimaryColor: (brandPrimaryColor) =>
        set((state) => ({ draft: { ...state.draft, brandPrimaryColor } })),
      setBrandSecondaryColor: (brandSecondaryColor) =>
        set((state) => ({ draft: { ...state.draft, brandSecondaryColor } })),
      setContactEmail: (contactEmail) =>
        set((state) => ({ draft: { ...state.draft, contactEmail } })),
      setContactPhone: (contactPhone) =>
        set((state) => ({ draft: { ...state.draft, contactPhone } })),
      setAddress: (address) => set((state) => ({ draft: { ...state.draft, address } })),
      setAboutUs: (aboutUs) => set((state) => ({ draft: { ...state.draft, aboutUs } })),
      setLogoDataUrl: (logoDataUrl) => set((state) => ({ draft: { ...state.draft, logoDataUrl } })),

      addDeliveryZone: () =>
        set((state) => ({
          draft: {
            ...state.draft,
            deliveryZones: [...state.draft.deliveryZones, { name: '', feeRwf: 0, etaMinutes: 60 }],
          },
        })),
      updateDeliveryZone: (index, patch) =>
        set((state) => ({
          draft: {
            ...state.draft,
            deliveryZones: state.draft.deliveryZones.map((z, i) =>
              i === index ? { ...z, ...patch } : z
            ),
          },
        })),
      removeDeliveryZone: (index) =>
        set((state) => ({
          draft: {
            ...state.draft,
            deliveryZones: state.draft.deliveryZones.filter((_, i) => i !== index),
          },
        })),

      resetDraft: () => set({ draft: initialDraft }),
    }),
    {
      name: 'store-onboarding-draft',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
