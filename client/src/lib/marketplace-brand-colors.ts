/**
 * Marketplace brand palette — AlignUI green primary system.
 * Prefer Tailwind semantic tokens (primary-*, brand-*, bg-*, text-*) for UI.
 */
export const MARKETPLACE_BRAND = {
  primary: '#1daf61',
  primaryHover: '#178c4e',
  primaryDark: '#16643b',
  primaryLight: '#e3f7ec',
  secondary: '#171717',
  accent: '#335cff',
  ink: '#171717',
  canvas: '#f7f7f7',
  surfaceWarm: '#ebebeb',
  bg: '#f7f7f7',
  surface: '#ffffff',
  muted: '#5c5c5c',
  border: '#ebebeb',
  onPrimary: '#ffffff',
} as const

/** AlignUI green scale (matches brand-* tokens in globals.css). */
export const MARKETPLACE_BRAND_SCALE = {
  50: '#e3f7ec',
  100: '#d6f5e8',
  200: '#c2f5da',
  300: '#84ebb4',
  400: '#3ee089',
  500: '#1fc16b',
  600: '#1daf61',
  700: '#178c4e',
  800: '#1a7544',
  900: '#16643b',
} as const

export function marketplaceBrandStyle(): Record<string, string> {
  return {
    '--mp-primary': MARKETPLACE_BRAND.primary,
    '--mp-primary-dark': MARKETPLACE_BRAND.primaryDark,
    '--mp-primary-light': MARKETPLACE_BRAND.primaryLight,
    '--mp-secondary': MARKETPLACE_BRAND.secondary,
    '--mp-accent': MARKETPLACE_BRAND.accent,
    '--mp-bg': MARKETPLACE_BRAND.bg,
    '--mp-surface': MARKETPLACE_BRAND.surface,
    '--mp-ink': MARKETPLACE_BRAND.ink,
    '--mp-muted': MARKETPLACE_BRAND.muted,
    '--mp-border': MARKETPLACE_BRAND.border,
    '--mp-on-primary': MARKETPLACE_BRAND.onPrimary,
  }
}
