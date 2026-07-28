export const STORE_CONTEXT_COOKIE = 'os_store'
export const STORE_CONTEXT_KEY = 'shopper.store-context'

const COOKIE_MAX_AGE_SEC = 60 * 60 * 24 * 30

export function persistStoreContext(slug: string): void {
  if (typeof window === 'undefined') return
  const normalized = slug.trim().toLowerCase()
  if (!normalized) return

  try {
    localStorage.setItem(STORE_CONTEXT_KEY, normalized)
  } catch {
    // ignore quota / private mode
  }

  document.cookie = `${STORE_CONTEXT_COOKIE}=${encodeURIComponent(normalized)};path=/;max-age=${COOKIE_MAX_AGE_SEC};SameSite=Lax`
}

export function readStoreContextFromStorage(): string | null {
  if (typeof window === 'undefined') return null
  try {
    const value = localStorage.getItem(STORE_CONTEXT_KEY)?.trim().toLowerCase()
    return value || null
  } catch {
    return null
  }
}
