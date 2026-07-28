export function marketplaceShopAbsoluteUrl(locale: string): string | null {
  const raw = process.env.NEXT_PUBLIC_APP_URL?.trim()
  if (!raw) return null
  const base = raw.replace(/\/+$/, '')
  return `${base}/${locale}/shop`
}
