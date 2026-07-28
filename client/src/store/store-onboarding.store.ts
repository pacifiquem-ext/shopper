'use client'

import { create } from 'zustand'
import { toast } from 'sonner'
import { storeOnboardingService, SubmitStoreDto } from '@/services/store-onboarding.service'
import { useAuthStore } from '@/store/auth.store'

export type StoreOnboardingBusinessType = 'retail'

export interface StoreOnboardingDraft {
  businessType: StoreOnboardingBusinessType | null
  industrySectorId: string
  businessCategoryId: string
  country: string
  ownerFullName: string
  ownerNationality: string
  ownerEmail: string
  ownerPhoneNumber: string
  businessAddress: {
    province: string
    district: string
    sector: string
    physicalAddress: string
    googleMapsUrl?: string
  }
  registeredName: string
  displayName: string
  description: string
  slug: string
  brandPrimaryColor: string
  brandSecondaryColor: string
  contactEmail: string
  contactPhone: string
  contactAddress: string
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

  isLoadingDraft: boolean
  isSavingDraft: boolean
  isSubmitting: boolean

  savedDraft: any | null
  showResumeModal: boolean

  setEntireDraft: (draft: Partial<StoreOnboardingDraft>) => void

  loadDraft: () => Promise<void>
  resumeDraft: () => number
  discardDraft: () => void
  saveDraft: (currentStep: number) => Promise<void>
  submitStore: () => Promise<void>

  setBusinessType: (type: StoreOnboardingBusinessType) => void
  setIndustrySectorId: (value: string) => void
  setBusinessCategoryId: (value: string) => void
  setCountry: (value: string) => void
  setOwnerFullName: (value: string) => void
  setOwnerNationality: (value: string) => void
  setOwnerEmail: (value: string) => void
  setOwnerPhoneNumber: (value: string) => void
  setBusinessAddress: (patch: Partial<StoreOnboardingDraft['businessAddress']>) => void

  setRegisteredName: (value: string) => void
  setDisplayName: (value: string) => void
  setDescription: (value: string) => void
  setSlug: (value: string) => void
  setBrandPrimaryColor: (value: string) => void
  setBrandSecondaryColor: (value: string) => void
  setContactEmail: (value: string) => void
  setContactPhone: (value: string) => void
  setContactAddress: (value: string) => void
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
  industrySectorId: '',
  businessCategoryId: '',
  country: 'RW',
  ownerFullName: '',
  ownerNationality: 'Rwandan',
  ownerEmail: '',
  ownerPhoneNumber: '',
  businessAddress: {
    province: '',
    district: '',
    sector: '',
    physicalAddress: '',
  },
  registeredName: '',
  displayName: '',
  description: '',
  slug: '',
  brandPrimaryColor: '#1daf61',
  brandSecondaryColor: '#171717',
  contactEmail: '',
  contactPhone: '',
  contactAddress: '',
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

export const useStoreOnboardingStore = create<StoreOnboardingState>()((set, get) => ({
  draft: initialDraft,

  isLoadingDraft: false,
  isSavingDraft: false,
  isSubmitting: false,

  savedDraft: null,
  showResumeModal: false,

  setEntireDraft: (newDraft) => set((state) => ({ draft: { ...state.draft, ...newDraft } })),

  loadDraft: async () => {
    const { accessToken } = useAuthStore.getState()
    if (!accessToken) {
      set({ isLoadingDraft: false })
      return
    }

    try {
      set({ isLoadingDraft: true })
      const payload = (await storeOnboardingService.getDraft()) as any
      const data = payload?.data || payload
      if (data?.draftData && Object.keys(data.draftData).length > 0) {
        set({ savedDraft: data, showResumeModal: true })
      }
    } catch (error) {
      const status = (error as { response?: { status?: number } })?.response?.status
      if (status === 401) {
        useAuthStore.getState().logout()
      }
    } finally {
      set({ isLoadingDraft: false })
    }
  },

  resumeDraft: () => {
    const savedDraft = get().savedDraft
    let stepToResume = 0
    if (savedDraft) {
      const incoming = savedDraft.draftData as StoreOnboardingDraft & { slug?: string }
      set((state) => ({
        draft: {
          ...state.draft,
          ...incoming,
          slug: incoming.slug || '',
        },
        showResumeModal: false,
        savedDraft: null,
      }))
      stepToResume = savedDraft.currentStep ? savedDraft.currentStep - 1 : 0
    }
    return stepToResume
  },

  discardDraft: () => {
    set({ showResumeModal: false, savedDraft: null })
  },

  saveDraft: async (currentStep: number) => {
    try {
      set({ isSavingDraft: true })
      const draft = get().draft
      // Using 8 steps as reference
      const completionPercentage = Math.round(((currentStep - 1) / 8) * 100)

      await storeOnboardingService.updateDraft({
        draftData: draft,
        currentStep,
        completionPercentage,
      })
    } catch (error) {
      console.error('Failed to save draft:', error)
      throw error // Let the UI handle the error (e.g. show toast)
    } finally {
      set({ isSavingDraft: false })
    }
  },

  submitStore: async () => {
    try {
      set({ isSubmitting: true })
      const draft = get().draft

      const payload: SubmitStoreDto = {
        slug: draft.slug,
        registeredName: draft.registeredName,
        displayName: draft.displayName,
        description: draft.description,
        brandPrimaryColor: draft.brandPrimaryColor,
        brandSecondaryColor: draft.brandSecondaryColor,
        logoDataUrl: draft.logoDataUrl || undefined,
        aboutUs: draft.aboutUs,
        contactEmail: draft.contactEmail,
        contactPhone: draft.contactPhone,
        contactAddress: draft.contactAddress,
        deliveryZones: draft.deliveryZones,
        industrySectorId: draft.industrySectorId,
        businessCategoryId: draft.businessCategoryId,
        country: draft.country,
        ownerFullName: draft.ownerFullName,
        ownerNationality: draft.ownerNationality,
        ownerEmail: draft.ownerEmail,
        ownerPhoneNumber: draft.ownerPhoneNumber,
        businessAddress: {
          province: draft.businessAddress.province,
          district: draft.businessAddress.district,
          sector: draft.businessAddress.sector,
          physicalAddress: draft.businessAddress.physicalAddress,
          googleMapsUrl: draft.businessAddress.googleMapsUrl,
        },
      }

      await storeOnboardingService.submitStore(payload)
    } catch (error) {
      console.error('Failed to submit store:', error)
      throw error
    } finally {
      set({ isSubmitting: false })
    }
  },

  setBusinessType: (businessType) => set((state) => ({ draft: { ...state.draft, businessType } })),
  setIndustrySectorId: (industrySectorId) =>
    set((state) => ({ draft: { ...state.draft, industrySectorId } })),
  setBusinessCategoryId: (businessCategoryId) =>
    set((state) => ({ draft: { ...state.draft, businessCategoryId } })),
  setCountry: (country) => set((state) => ({ draft: { ...state.draft, country } })),
  setOwnerFullName: (ownerFullName) =>
    set((state) => ({ draft: { ...state.draft, ownerFullName } })),
  setOwnerNationality: (ownerNationality) =>
    set((state) => ({ draft: { ...state.draft, ownerNationality } })),
  setOwnerEmail: (ownerEmail) => set((state) => ({ draft: { ...state.draft, ownerEmail } })),
  setOwnerPhoneNumber: (ownerPhoneNumber) =>
    set((state) => ({ draft: { ...state.draft, ownerPhoneNumber } })),
  setBusinessAddress: (patch) =>
    set((state) => ({
      draft: {
        ...state.draft,
        businessAddress: { ...state.draft.businessAddress, ...patch },
      },
    })),

  setRegisteredName: (registeredName) =>
    set((state) => ({ draft: { ...state.draft, registeredName } })),
  setDisplayName: (displayName) => set((state) => ({ draft: { ...state.draft, displayName } })),
  setDescription: (description) => set((state) => ({ draft: { ...state.draft, description } })),
  setSlug: (slug) => set((state) => ({ draft: { ...state.draft, slug } })),
  setBrandPrimaryColor: (brandPrimaryColor) =>
    set((state) => ({ draft: { ...state.draft, brandPrimaryColor } })),
  setBrandSecondaryColor: (brandSecondaryColor) =>
    set((state) => ({ draft: { ...state.draft, brandSecondaryColor } })),
  setContactEmail: (contactEmail) => set((state) => ({ draft: { ...state.draft, contactEmail } })),
  setContactPhone: (contactPhone) => set((state) => ({ draft: { ...state.draft, contactPhone } })),
  setContactAddress: (contactAddress) =>
    set((state) => ({ draft: { ...state.draft, contactAddress } })),
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
}))
