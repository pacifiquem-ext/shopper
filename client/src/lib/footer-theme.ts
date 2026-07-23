import { MARKETPLACE_BRAND } from '@/lib/marketplace-brand-colors'

export type FooterThemeTokens = {
  borderColor: string
  background: string
  buttonBackground: string
  buttonText: string
  buttonHoverBackground: string
}

/** Single marketplace footer theme (AlignUI green commerce only). */
export function resolveFooterTheme(): FooterThemeTokens {
  const { primary } = MARKETPLACE_BRAND

  return {
    borderColor: 'rgba(255, 255, 255, 0.14)',
    background:
      'radial-gradient(900px 460px at 12% 0%, rgba(255,255,255,0.14), transparent 62%), radial-gradient(720px 420px at 90% 12%, rgba(23,140,78,0.45), transparent 60%), linear-gradient(165deg, #1daf61 0%, #178c4e 48%, #0f5c34 100%)',
    buttonBackground: '#ffffff',
    buttonText: primary,
    buttonHoverBackground: 'rgba(255,255,255,0.95)',
  }
}
