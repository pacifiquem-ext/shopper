/**
 * Marketplace brand palette — matches the homepage (DEFAULT storefront template).
 * Use Tailwind `brand-*` tokens (globals.css) for UI; import these for charts/SVG/inline styles.
 */
export const MARKETPLACE_BRAND = {
  primary: '#B76E5D',
  primaryHover: '#A66250',
  primaryDark: '#8B4F40',
  secondary: '#7D8F69',
  ink: '#2B2B2B',
  canvas: '#F5F1EB',
  surfaceWarm: '#EAE4DC',
} as const

/** Tailwind `brand-50` … `brand-900` scale (see globals.css). */
export const MARKETPLACE_BRAND_SCALE = {
  50: '#F5F1EB',
  100: '#FAECE7',
  200: '#F0DDD6',
  300: '#E5C4B8',
  400: '#D9A99A',
  500: '#CD8E7C',
  600: '#C17D68',
  700: '#B76E5D',
  800: '#A66250',
  900: '#8B4F40',
} as const
