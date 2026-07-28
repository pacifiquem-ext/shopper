/** Brand-color helpers for store settings. */

export type BrandColors = {
  primary?: string
  secondary?: string
}

/** @deprecated Use BrandColors — template field ignored */
export type BrandColorsWithTemplate = BrandColors & {
  template?: string
}

export const MARKETPLACE_PRIMARY = '#1daf61'

export function resolveStorePrimaryColor(
  brandColors: { primary?: string } | null | undefined,
  fallback = MARKETPLACE_PRIMARY,
): string {
  const primary = brandColors?.primary?.trim()
  if (primary && /^#[0-9A-Fa-f]{6}$/.test(primary)) return primary
  return fallback
}

export const DEFAULT_STORE_COLORS = {
  primary: '#171717',
  secondary: MARKETPLACE_PRIMARY,
} as const
