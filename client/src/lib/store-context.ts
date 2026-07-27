/** Cookie + localStorage key for the last storefront the shopper browsed. */
export const STORE_CONTEXT_COOKIE = 'os_store'
export const STORE_CONTEXT_KEY = 'shopper.store-context'

const COOKIE_MAX_AGE_SEC = 60 * 60 * 24 * 30

/** Persist store subdomain in the browser (cart + cart icon links). */
export function persistStoreContext(subdomain: string): void {
  if (typeof window === 'undefined') return
  const normalized = subdomain.trim().toLowerCase()
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
