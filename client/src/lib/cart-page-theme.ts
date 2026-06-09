import type { StoreTemplateId } from '@/lib/store-templates'
import { STORE_TEMPLATE_IDS } from '@/lib/store-templates'

export type CartPageTheme = 'default' | 'vibrant-market' | 'ishusho-crafts'

export function cartPageThemeFromTemplate(template: StoreTemplateId): CartPageTheme {
  if (template === STORE_TEMPLATE_IDS.VIBRANT_MARKET) return 'vibrant-market'
  if (template === STORE_TEMPLATE_IDS.ISHUSHO_CRAFTS) return 'ishusho-crafts'
  return 'default'
}

export type CartPageThemeTokens = {
  page: string
  ink: string
  muted: string
  border: string
  surface: string
  surfaceStrong: string
  surfaceSoft: string
  accent: string
  accentIcon: string
  accentBg: string
  accentHover: string
  ctaShadow: string
  cardShadow: string
  summaryShadow: string
  blurOrbA: string
  blurOrbB: string
  showDefaultBlurs: boolean
  useTemplateChrome: boolean
}

export function cartPageThemeTokens(theme: CartPageTheme): CartPageThemeTokens {
  if (theme === 'vibrant-market') {
    return {
      page: 'min-h-screen bg-[var(--vm-bg)] text-[var(--vm-ink)]',
      ink: 'text-[var(--vm-ink)]',
      muted: 'text-[var(--vm-muted)]',
      border: 'border-white/10',
      surface: 'bg-[var(--vm-surface)]',
      surfaceStrong: 'bg-[var(--vm-surface)]',
      surfaceSoft: 'bg-[var(--vm-primary-light)]/70',
      accent: 'text-[var(--vm-secondary)]',
      accentIcon: 'text-[var(--vm-secondary)]',
      accentBg: 'bg-[var(--vm-secondary)]',
      accentHover: 'hover:brightness-95',
      ctaShadow: 'shadow-[0_12px_28px_rgba(163,255,18,0.22)]',
      cardShadow: 'shadow-[0_8px_28px_rgba(0,0,0,0.25)]',
      summaryShadow: 'shadow-[0_12px_40px_rgba(0,0,0,0.32)]',
      blurOrbA: '',
      blurOrbB: '',
      showDefaultBlurs: false,
      useTemplateChrome: true,
    }
  }
  if (theme === 'ishusho-crafts') {
    return {
      page: 'ic-storefront min-h-screen bg-[var(--ic-bg)] font-[family-name:var(--font-ic-sans)] text-[var(--ic-ink)]',
      ink: 'text-[var(--ic-ink)]',
      muted: 'text-[var(--ic-muted)]',
      border: 'border-[var(--ic-border)]',
      surface: 'bg-[var(--ic-surface)]',
      surfaceStrong: 'bg-[var(--ic-surface)]',
      surfaceSoft: 'bg-[var(--ic-primary-light)]/80',
      accent: 'text-[var(--ic-secondary)]',
      accentIcon: 'text-[var(--ic-accent)]',
      accentBg: 'bg-[var(--ic-secondary)]',
      accentHover: 'hover:brightness-105',
      ctaShadow: 'shadow-[0_8px_24px_color-mix(in_srgb,var(--ic-secondary)_28%,transparent)]',
      cardShadow: 'shadow-[0_8px_32px_rgba(0,0,0,0.35)]',
      summaryShadow: 'shadow-[0_8px_32px_rgba(0,0,0,0.35)]',
      blurOrbA: '',
      blurOrbB: '',
      showDefaultBlurs: false,
      useTemplateChrome: true,
    }
  }
  return {
    page: 'min-h-screen bg-[#F5F1EB] text-[#2B2B2B]',
    ink: 'text-[#2B2B2B]',
    muted: 'text-[#6E6A66]',
    border: 'border-[rgba(43,43,43,0.08)]',
    surface: 'bg-white/60 backdrop-blur-md',
    surfaceStrong: 'bg-white/65 backdrop-blur-lg',
    surfaceSoft: 'bg-[#EAE4DC]/65 backdrop-blur',
    accent: 'text-[#B76E5D]',
    accentIcon: 'text-[#7D8F69]',
    accentBg: 'bg-[#B76E5D]',
    accentHover: 'hover:bg-[#A66250]',
    ctaShadow: 'shadow-[0_12px_28px_rgba(183,110,93,0.28)]',
    cardShadow: 'shadow-[0_1px_2px_rgba(43,43,43,0.03)]',
    summaryShadow: 'shadow-[0_1px_2px_rgba(43,43,43,0.03),0_16px_36px_rgba(43,43,43,0.07)]',
    blurOrbA: 'bg-[#B76E5D]/10',
    blurOrbB: 'bg-[#7D8F69]/12',
    showDefaultBlurs: true,
    useTemplateChrome: false,
  }
}
