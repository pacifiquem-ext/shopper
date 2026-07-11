export const STORE_TEMPLATE_IDS = {
  DEFAULT: 'DEFAULT',
  VIBRANT_MARKET: 'VIBRANT_MARKET',
  ISHUSHO_CRAFTS: 'ISHUSHO_CRAFTS',
} as const

export type StoreTemplateId =
  (typeof STORE_TEMPLATE_IDS)[keyof typeof STORE_TEMPLATE_IDS]

export type BrandColorsWithTemplate = {
  primary?: string
  secondary?: string
  template?: StoreTemplateId
}

export function parseStoreTemplateId(value: unknown): StoreTemplateId {
  const normalized = typeof value === 'string' ? value.trim().toUpperCase() : ''
  if (normalized === STORE_TEMPLATE_IDS.ISHUSHO_CRAFTS) {
    return STORE_TEMPLATE_IDS.ISHUSHO_CRAFTS
  }
  if (normalized === STORE_TEMPLATE_IDS.VIBRANT_MARKET) {
    return STORE_TEMPLATE_IDS.VIBRANT_MARKET
  }
  if (
    normalized === 'CLASSIC_MARKET' ||
    normalized === 'KIGALI_CLASSIC' ||
    normalized === 'LAKE_BREEZE'
  ) {
    return STORE_TEMPLATE_IDS.DEFAULT
  }
  return STORE_TEMPLATE_IDS.DEFAULT
}
