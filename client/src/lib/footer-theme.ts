import { MARKETPLACE_BRAND } from '@/lib/marketplace-brand-colors'

export type FooterThemeTokens = {
  borderColor: string
  background: string
  buttonBackground: string
  buttonText: string
  buttonHoverBackground: string
}

/** Single marketplace footer theme (AlignUI green commerce). */
export function resolveFooterTheme(): FooterThemeTokens {
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
