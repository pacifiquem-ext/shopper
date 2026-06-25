import { routing } from '@/i18n/routing'

/** Default destination after new merchant signup + login. */
export const MERCHANT_ONBOARDING_PATH = '/store'

/** Default destination after merchant login. */
export const MERCHANT_DASHBOARD_PATH = '/dashboard'

export function normalizeReturnUrl(raw: string | null): string {
  if (!raw || !raw.startsWith('/') || raw.startsWith('//')) return '/'

  const queryIndex = raw.indexOf('?')
  const pathPart = queryIndex === -1 ? raw : raw.slice(0, queryIndex)
  const query = queryIndex === -1 ? '' : raw.slice(queryIndex)
  const segments = pathPart.split('/').filter(Boolean)

  if (segments.length > 0 && routing.locales.includes(segments[0] as (typeof routing.locales)[number])) {
    const withoutLocale = `/${segments.slice(1).join('/')}`
    return `${withoutLocale === '/' ? '' : withoutLocale}${query}` || '/'
  }

  return raw
}

export function withReturnUrl(path: string, returnUrl: string | null | undefined): string {
  if (!returnUrl) return path
  return `${path}?returnUrl=${encodeURIComponent(returnUrl)}`
}

export function merchantSignupHref(): string {
  return withReturnUrl('/signup', MERCHANT_ONBOARDING_PATH)
}

export function resolvePostAuthRedirect(
  returnUrl: string | null,
  fallback: string = MERCHANT_DASHBOARD_PATH,
): string {
  if (!returnUrl) return fallback
  return normalizeReturnUrl(returnUrl)
}
