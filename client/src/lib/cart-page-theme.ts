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
}

export function cartPageThemeTokens(): CartPageThemeTokens {
  return {
    page: 'min-h-screen bg-bg-weak-50 text-text-strong-950',
    ink: 'text-text-strong-950',
    muted: 'text-text-sub-600',
    border: 'border-stroke-soft-200',
    surface: 'bg-bg-white-0/80 backdrop-blur-md',
    surfaceStrong: 'bg-bg-white-0/90 backdrop-blur-lg',
    surfaceSoft: 'bg-bg-weak-50/80 backdrop-blur',
    accent: 'text-primary-base',
    accentIcon: 'text-primary-darker',
    accentBg: 'bg-primary-base',
    accentHover: 'hover:bg-primary-darker',
    ctaShadow: 'shadow-fancy-buttons-primary',
    cardShadow: 'shadow-regular-xs',
    summaryShadow: 'shadow-regular-md',
    blurOrbA: 'bg-primary-alpha-10',
    blurOrbB: 'bg-information-alpha-10',
    showDefaultBlurs: true,
  }
}
