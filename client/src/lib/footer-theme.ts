import {
  ISHUSHO_CRAFTS_COLORS,
  VIBRANT_MARKET_COLORS,
  type StoreTemplateId,
} from '@/lib/store-templates'

import { MARKETPLACE_BRAND } from '@/lib/marketplace-brand-colors'

export type FooterThemeTokens = {
  borderColor: string
  background: string
  buttonBackground: string
  buttonText: string
  buttonHoverBackground: string
}

export function resolveFooterTheme(template: StoreTemplateId): FooterThemeTokens {
  if (template === 'VIBRANT_MARKET') {
    return {
      borderColor: 'rgba(255,255,255,0.14)',
      background:
        'radial-gradient(900px 460px at 10% 0%, rgba(255,255,255,0.14), transparent 65%), radial-gradient(720px 420px at 92% 10%, rgba(13,148,136,0.32), transparent 62%), radial-gradient(520px 340px at 55% 35%, rgba(0,0,0,0.18), transparent 70%), linear-gradient(180deg, #1E293B 0%, #0F172A 58%, #020617 100%)',
      buttonBackground: '#ffffff',
      buttonText: VIBRANT_MARKET_COLORS.secondary,
      buttonHoverBackground: 'rgba(255,255,255,0.95)',
    }
  }

  if (template === 'ISHUSHO_CRAFTS') {
    return {
      borderColor: 'rgba(232, 184, 74, 0.28)',
      background:
        'radial-gradient(900px 460px at 10% 0%, rgba(232,184,74,0.22), transparent 65%), radial-gradient(720px 420px at 88% 8%, rgba(244,114,182,0.16), transparent 62%), radial-gradient(520px 340px at 55% 35%, rgba(0,0,0,0.22), transparent 70%), linear-gradient(180deg, #0A0E1A 0%, #050810 58%, #020308 100%)',
      buttonBackground: ISHUSHO_CRAFTS_COLORS.secondary,
      buttonText: ISHUSHO_CRAFTS_COLORS.onSecondary,
      buttonHoverBackground: '#F0C56A',
    }
  }

  const { primary } = MARKETPLACE_BRAND

  return {
    borderColor: 'rgba(166, 98, 80, 0.35)',
    background:
      'radial-gradient(900px 460px at 10% 0%, rgba(255,255,255,0.22), transparent 65%), radial-gradient(720px 420px at 92% 10%, rgba(125,143,105,0.26), transparent 62%), radial-gradient(520px 340px at 55% 35%, rgba(0,0,0,0.12), transparent 70%), linear-gradient(180deg, rgba(29, 175, 97,1) 0%, rgba(166,98,80,1) 55%, rgba(117,63,50,1) 100%)',
    buttonBackground: '#ffffff',
    buttonText: primary,
    buttonHoverBackground: 'rgba(255,255,255,0.95)',
  }
}
