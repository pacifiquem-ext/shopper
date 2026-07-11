import { MARKETPLACE_BRAND } from '@/lib/marketplace-brand-colors'

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

/** Classic Market (DEFAULT) — light AlignUI green commerce, calm premium. */
export const CLASSIC_MARKET_COLORS = {
  primary: '#171717',
  secondary: '#1daf61',
  primaryDark: '#0b0b0b',
  primaryLight: '#f7f7f7',
  accent: '#335cff',
  bg: '#f7f7f7',
  surface: '#ffffff',
  ink: '#171717',
  muted: '#5c5c5c',
  onPrimary: '#ffffff',
  border: '#ebebeb',
} as const

export function classicMarketThemeStyle(): Record<string, string> {
  return {
    '--kc-primary': CLASSIC_MARKET_COLORS.primary,
    '--kc-secondary': CLASSIC_MARKET_COLORS.secondary,
    '--kc-primary-dark': CLASSIC_MARKET_COLORS.primaryDark,
    '--kc-primary-light': CLASSIC_MARKET_COLORS.primaryLight,
    '--kc-accent': CLASSIC_MARKET_COLORS.accent,
    '--kc-bg': CLASSIC_MARKET_COLORS.bg,
    '--kc-surface': CLASSIC_MARKET_COLORS.surface,
    '--kc-ink': CLASSIC_MARKET_COLORS.ink,
    '--kc-muted': CLASSIC_MARKET_COLORS.muted,
    '--kc-on-primary': CLASSIC_MARKET_COLORS.onPrimary,
    '--kc-border': CLASSIC_MARKET_COLORS.border,
  }
}

/** Vibrant Market — bright daylight market energy. */
export const VIBRANT_MARKET_COLORS = {
  primary: '#0F172A',
  secondary: '#1daf61',
  primaryDark: '#020617',
  primaryLight: '#F1F5F9',
  accent: '#fa7319',
  bg: '#F8FAFC',
  surface: '#FFFFFF',
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

/** Night Market (Ishusho) — dark gallery with purple craft accents. */
export const ISHUSHO_CRAFTS_COLORS = {
  primary: '#0A0E1A',
  secondary: '#8c71f6',
  primaryDark: '#050810',
  primaryLight: '#1A2234',
  accent: '#fb4ba3',
  bg: '#0B0F19',
  surface: '#121826',
  ink: '#F8FAFC',
  muted: '#94A3B8',
  onSecondary: '#0A0E1A',
  border: 'rgba(148, 163, 184, 0.14)',
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

export const STORE_TEMPLATE_BRAND_PRESETS: Record<
  StoreTemplateId,
  { primary: string; secondary: string }
> = {
  DEFAULT: {
    primary: CLASSIC_MARKET_COLORS.primary,
    secondary: CLASSIC_MARKET_COLORS.secondary,
  },
  VIBRANT_MARKET: {
    primary: VIBRANT_MARKET_COLORS.primary,
    secondary: VIBRANT_MARKET_COLORS.secondary,
  },
  ISHUSHO_CRAFTS: {
    primary: ISHUSHO_CRAFTS_COLORS.primary,
    secondary: ISHUSHO_CRAFTS_COLORS.secondary,
  },
}

export const STORE_TEMPLATE_PICKER_UI: Record<
  StoreTemplateId,
  { primary: string; secondary: string; accent: string; bg: string; surface: string }
> = {
  DEFAULT: {
    primary: CLASSIC_MARKET_COLORS.primary,
    secondary: CLASSIC_MARKET_COLORS.secondary,
    accent: CLASSIC_MARKET_COLORS.accent,
    bg: CLASSIC_MARKET_COLORS.bg,
    surface: CLASSIC_MARKET_COLORS.surface,
  },
  VIBRANT_MARKET: {
    primary: VIBRANT_MARKET_COLORS.primary,
    secondary: VIBRANT_MARKET_COLORS.secondary,
    accent: VIBRANT_MARKET_COLORS.accent,
    bg: VIBRANT_MARKET_COLORS.bg,
    surface: VIBRANT_MARKET_COLORS.surface,
  },
  ISHUSHO_CRAFTS: {
    primary: ISHUSHO_CRAFTS_COLORS.primary,
    secondary: ISHUSHO_CRAFTS_COLORS.secondary,
    accent: ISHUSHO_CRAFTS_COLORS.accent,
    bg: ISHUSHO_CRAFTS_COLORS.bg,
    surface: ISHUSHO_CRAFTS_COLORS.surface,
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
  if (normalized === STORE_TEMPLATE_IDS.ISHUSHO_CRAFTS) return STORE_TEMPLATE_IDS.ISHUSHO_CRAFTS
  if (normalized === STORE_TEMPLATE_IDS.VIBRANT_MARKET) return STORE_TEMPLATE_IDS.VIBRANT_MARKET
  if (normalized === 'CLASSIC_MARKET' || normalized === 'KIGALI_CLASSIC' || normalized === 'LAKE_BREEZE') {
    return STORE_TEMPLATE_IDS.DEFAULT
  }
  return STORE_TEMPLATE_IDS.DEFAULT
}

export function isVibrantMarketTemplate(template?: string | null): boolean {
  return template === STORE_TEMPLATE_IDS.VIBRANT_MARKET
}

export function isIshushoCraftsTemplate(template?: string | null): boolean {
  return template === STORE_TEMPLATE_IDS.ISHUSHO_CRAFTS
}

export function isClassicMarketTemplate(template?: string | null): boolean {
  return parseStoreTemplateId(template) === STORE_TEMPLATE_IDS.DEFAULT
}

export function resolveStoreTemplate(store: {
  storeTemplate?: string | null
  brandColors?: BrandColorsWithTemplate | null
}): StoreTemplateId {
  if (store.storeTemplate) return parseStoreTemplateId(store.storeTemplate)
  return parseStoreTemplateId(store.brandColors?.template)
}

export function resolveStorePrimaryColor(
  brandColors: { primary?: string } | null | undefined,
  fallback = CLASSIC_MARKET_COLORS.secondary,
): string {
  const primary = brandColors?.primary?.trim()
  if (primary && /^#[0-9A-Fa-f]{6}$/.test(primary)) return primary
  return fallback
}

// Back-compat alias used by older imports
export const DEFAULT_STORE_COLORS = CLASSIC_MARKET_COLORS
