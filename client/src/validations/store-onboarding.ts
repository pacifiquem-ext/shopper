import { useStoreOnboardingStore } from '@/store/store-onboarding.store'
import { WizardStepKey } from '../components/store-onboarding/wizard-context'

export function toSafeInt(value: string) {
  const normalized = value.replace(/[^0-9]/g, '')
  if (!normalized) return 0
  const parsed = Number(normalized)
  if (!Number.isFinite(parsed)) return 0
  return Math.max(0, Math.round(parsed))
}

export function validateStep(
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
    case 'industry': {
      if (!draft.industrySectorId) errors.industrySectorId = 'errors.missingIndustry'
      if (!draft.businessCategoryId) errors.businessCategoryId = 'errors.missingCategory'
      const ok = Object.keys(errors).length === 0
      return { ok, errors, messageKey: ok ? 'errors.ok' : 'errors.missingIndustry' }
    }
    case 'legal': {
      let hasError = false
      if (!(draft.ownerFullName || '').trim()) {
        errors.ownerFullName = 'errors.missingOwnerFullName'
        hasError = true
      }
      if (!(draft.ownerNationality || '').trim()) {
        errors.ownerNationality = 'errors.missingOwnerNationality'
        hasError = true
      }
      if (!(draft.country || '').trim()) {
        errors.country = 'errors.missingCountry'
        hasError = true
      }
      if (!(draft.ownerPhoneNumber || '').trim()) {
        errors.ownerPhoneNumber = 'errors.missingOwnerPhoneNumber'
        hasError = true
      } else if (!/^\+[1-9]\d{1,14}$/.test(draft.ownerPhoneNumber)) {
        errors.ownerPhoneNumber = 'errors.invalidOwnerPhoneNumber'
        hasError = true
      }
      if (!(draft.ownerEmail || '').trim() || !draft.ownerEmail.includes('@')) {
        errors.ownerEmail = 'errors.invalidOwnerEmail'
        hasError = true
      }

      if (hasError) {
        return { ok: false, errors, messageKey: 'errors.missingLegalDetails' as const }
      }
      return { ok: true, errors, messageKey: 'errors.ok' as const }
    }
    case 'businessAddress': {
      let hasError = false
      if (!(draft.businessAddress?.province || '').trim()) {
        errors['businessAddress.province'] = 'errors.missingProvince'
        hasError = true
      }
      if (!(draft.businessAddress?.district || '').trim()) {
        errors['businessAddress.district'] = 'errors.missingDistrict'
        hasError = true
      }
      if (!(draft.businessAddress?.sector || '').trim()) {
        errors['businessAddress.sector'] = 'errors.missingSector'
        hasError = true
      }
      if (!(draft.businessAddress?.physicalAddress || '').trim()) {
        errors['businessAddress.physicalAddress'] = 'errors.missingPhysicalAddress'
        hasError = true
      }

      if (hasError) {
        return { ok: false, errors, messageKey: 'errors.missingLegalDetails' as const }
      }
      return { ok: true, errors, messageKey: 'errors.ok' as const }
    }
    case 'storeBasics': {
      if (!(draft.registeredName || '').trim()) {
        errors.registeredName = 'errors.missingRegisteredName'
      }
      if (!(draft.displayName || '').trim()) {
        errors.displayName = 'errors.missingDisplayName'
      }
      const ok = Object.keys(errors).length === 0
      return { ok, errors, messageKey: ok ? undefined : 'errors.missingRegisteredName' }
    }
    case 'slug': {
      const slug = (draft.slug || '').trim()
      if (!slug) {
        errors.slug = 'errors.missingSlug'
      } else {
        const regex = /^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$/
        if (!regex.test(slug)) {
          errors.slug = 'errors.invalidSlug'
        }
      }
      const ok = Object.keys(errors).length === 0
      return { ok, errors, messageKey: ok ? undefined : 'errors.missingSlug' }
    }
    case 'brand': {
      if (!(draft.brandPrimaryColor || '').trim() || !(draft.brandSecondaryColor || '').trim()) {
        return { ok: false, errors, messageKey: 'errors.missingBrandColors' as const }
      }
      return { ok: true, errors, messageKey: 'errors.ok' as const }
    }
    case 'delivery': {
      let hasError = false
      const zones = draft.deliveryZones || []
      for (let i = 0; i < zones.length; i++) {
        const zone = zones[i]
        if (!(zone.name || '').trim()) {
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
