export type StoreTemplateId = 'DEFAULT' | 'VIBRANT_MARKET' | 'ISHUSHO_CRAFTS'

export type BrandColorsWithTemplate = {
  primary?: string
  secondary?: string
  template?: StoreTemplateId
}

export const STORE_TEMPLATE_IDS = {
  DEFAULT: 'DEFAULT',
  VIBRANT_MARKET: 'VIBRANT_MARKET',
  ISHUSHO_CRAFTS: 'ISHUSHO_CRAFTS',
} as const satisfies Record<string, StoreTemplateId>

/** Commerce-first palette: light shopping canvas, dark nav, teal CTAs, orange promos. */
export const VIBRANT_MARKET_COLORS = {
  primary: '#1E293B', // Slate — header, prices, strong text
  secondary: '#0D9488', // Teal — primary actions (add to cart, filters)
  primaryDark: '#0F172A',
  primaryLight: '#F1F5F9', // Chips & hover surfaces
  accent: '#EA580C', // Orange — sales & ticker
  bg: '#F8FAFC', // Light canvas — product imagery reads clearly
  surface: '#FFFFFF', // Cards & panels
  ink: '#0F172A',
  muted: '#64748B',
  onPrimary: '#FFFFFF',
  border: '#E2E8F0',
} as const

export function vibrantMarketThemeStyle(): Record<string, string> {
  return {
    '--vm-primary': VIBRANT_MARKET_COLORS.primary,
    '--vm-secondary': VIBRANT_MARKET_COLORS.secondary,
    '--vm-primary-dark': VIBRANT_MARKET_COLORS.primaryDark,
    '--vm-primary-light': VIBRANT_MARKET_COLORS.primaryLight,
    '--vm-accent': VIBRANT_MARKET_COLORS.accent,
    '--vm-bg': VIBRANT_MARKET_COLORS.bg,
    '--vm-surface': VIBRANT_MARKET_COLORS.surface,
    '--vm-ink': VIBRANT_MARKET_COLORS.ink,
    '--vm-muted': VIBRANT_MARKET_COLORS.muted,
    '--vm-on-primary': VIBRANT_MARKET_COLORS.onPrimary,
    '--vm-border': VIBRANT_MARKET_COLORS.border,
  }
}

/** Dark commerce palette — midnight canvas, warm gold CTAs, rose promos. */
export const ISHUSHO_CRAFTS_COLORS = {
  primary: '#0A0E1A', // Nav & chrome
  secondary: '#E8B84A', // Gold — add to cart, prices, primary actions
  primaryDark: '#050810',
  primaryLight: '#1A2234', // Elevated panels & inputs
  accent: '#F472B6', // Rose — promos, cart badge, highlights
  bg: '#0D111C', // Store canvas
  surface: '#141B2B', // Cards & sheets
  ink: '#F1F5F9',
  muted: '#8B9CB8',
  onSecondary: '#0A0E1A', // Text on gold buttons
  border: 'rgba(148, 163, 184, 0.16)',
} as const

export function ishushoCraftsThemeStyle(): Record<string, string> {
  return {
    '--ic-primary': ISHUSHO_CRAFTS_COLORS.primary,
    '--ic-secondary': ISHUSHO_CRAFTS_COLORS.secondary,
    '--ic-primary-dark': ISHUSHO_CRAFTS_COLORS.primaryDark,
    '--ic-primary-light': ISHUSHO_CRAFTS_COLORS.primaryLight,
    '--ic-accent': ISHUSHO_CRAFTS_COLORS.accent,
    '--ic-bg': ISHUSHO_CRAFTS_COLORS.bg,
    '--ic-surface': ISHUSHO_CRAFTS_COLORS.surface,
    '--ic-ink': ISHUSHO_CRAFTS_COLORS.ink,
    '--ic-muted': ISHUSHO_CRAFTS_COLORS.muted,
    '--ic-on-secondary': ISHUSHO_CRAFTS_COLORS.onSecondary,
    '--ic-border': ISHUSHO_CRAFTS_COLORS.border,
  }
}

/** Brand colors applied when a merchant selects a template in dashboard settings. */
export const STORE_TEMPLATE_BRAND_PRESETS: Record<
  StoreTemplateId,
  { primary: string; secondary: string }
> = {
  DEFAULT: { primary: '#1d4ed8', secondary: '#e8edfb' },
  VIBRANT_MARKET: {
    primary: VIBRANT_MARKET_COLORS.primary,
    secondary: VIBRANT_MARKET_COLORS.secondary,
  },
  ISHUSHO_CRAFTS: {
    primary: ISHUSHO_CRAFTS_COLORS.primary,
    secondary: ISHUSHO_CRAFTS_COLORS.secondary,
  },
}

/** Picker card accents (preview swatches + selected-state colors). */
export const STORE_TEMPLATE_PICKER_UI: Record<
  StoreTemplateId,
  { primary: string; secondary: string; accent: string }
> = {
  DEFAULT: { primary: '#1d4ed8', secondary: '#e8edfb', accent: '#1d4ed8' },
  VIBRANT_MARKET: {
    primary: VIBRANT_MARKET_COLORS.primary,
    secondary: VIBRANT_MARKET_COLORS.secondary,
    accent: VIBRANT_MARKET_COLORS.accent,
  },
  ISHUSHO_CRAFTS: {
    primary: ISHUSHO_CRAFTS_COLORS.primary,
    secondary: ISHUSHO_CRAFTS_COLORS.secondary,
    accent: ISHUSHO_CRAFTS_COLORS.accent,
  },
}

export const STORE_TEMPLATE_OPTIONS: Array<{
  id: StoreTemplateId
  labelKey: 'defaultTemplate' | 'vibrantMarketTemplate' | 'ishushoCraftsTemplate'
  descriptionKey: 'defaultTemplateDesc' | 'vibrantMarketTemplateDesc' | 'ishushoCraftsTemplateDesc'
  tagKey: 'defaultTemplateTag' | 'vibrantMarketTemplateTag' | 'ishushoCraftsTemplateTag'
}> = [
  {
    id: STORE_TEMPLATE_IDS.DEFAULT,
    labelKey: 'defaultTemplate',
    descriptionKey: 'defaultTemplateDesc',
    tagKey: 'defaultTemplateTag',
  },
  {
    id: STORE_TEMPLATE_IDS.VIBRANT_MARKET,
    labelKey: 'vibrantMarketTemplate',
    descriptionKey: 'vibrantMarketTemplateDesc',
    tagKey: 'vibrantMarketTemplateTag',
  },
  {
    id: STORE_TEMPLATE_IDS.ISHUSHO_CRAFTS,
    labelKey: 'ishushoCraftsTemplate',
    descriptionKey: 'ishushoCraftsTemplateDesc',
    tagKey: 'ishushoCraftsTemplateTag',
  },
]

export function parseStoreTemplateId(value: unknown): StoreTemplateId {
  const normalized = typeof value === 'string' ? value.trim().toUpperCase() : ''
  if (normalized === STORE_TEMPLATE_IDS.ISHUSHO_CRAFTS) {
    return STORE_TEMPLATE_IDS.ISHUSHO_CRAFTS
  }
  if (normalized === STORE_TEMPLATE_IDS.VIBRANT_MARKET) {
    return STORE_TEMPLATE_IDS.VIBRANT_MARKET
  }
  return STORE_TEMPLATE_IDS.DEFAULT
}

export function isVibrantMarketTemplate(template?: string | null): boolean {
  return template === STORE_TEMPLATE_IDS.VIBRANT_MARKET
}

export function isIshushoCraftsTemplate(template?: string | null): boolean {
  return template === STORE_TEMPLATE_IDS.ISHUSHO_CRAFTS
}

/** Resolve template from API store profile or legacy brandColors JSON (no DB column). */
export function resolveStoreTemplate(store: {
  storeTemplate?: string | null
  brandColors?: BrandColorsWithTemplate | null
}): StoreTemplateId {
  if (store.storeTemplate) {
    return parseStoreTemplateId(store.storeTemplate)
  }
  return parseStoreTemplateId(store.brandColors?.template)
}

export function resolveStorePrimaryColor(
  brandColors: { primary?: string } | null | undefined,
  fallback = VIBRANT_MARKET_COLORS.primary,
): string {
  const primary = brandColors?.primary?.trim()
  if (primary && /^#[0-9A-Fa-f]{6}$/.test(primary)) return primary
  return fallback
}
