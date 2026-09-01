export const SHOPPER_VISITOR_KEY = 'shopper.visitor.v1'
export const SHOPPER_VISITOR_COOKIE = 'shopper_vid'
export const SHOPPER_VISITOR_HEADER = 'X-Shopper-Visitor'
export const SHOPPER_SIGNAL_EVENT = 'shopper:signal'

export type ShopperClientSignal = {
  type: 'SEARCH' | 'VIEW_PRODUCT' | 'VIEW_CATEGORY' | 'VIEW_STORE' | 'ADD_CART' | 'WISHLIST' | 'PURCHASE'
  query?: string
  productId?: string
  storeId?: string
  category?: string
  tags?: string[]
  price?: number
}

function randomId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `vid_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`
}

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

function writeCookie(name: string, value: string) {
  if (typeof document === 'undefined') return
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${60 * 60 * 24 * 180}; samesite=lax`
}

export function getShopperVisitorId(): string {
  if (typeof window === 'undefined') return ''
  const fromCookie = readCookie(SHOPPER_VISITOR_COOKIE)
  const fromStorage = window.localStorage.getItem(SHOPPER_VISITOR_KEY)
  const id = fromCookie || fromStorage || randomId()
  window.localStorage.setItem(SHOPPER_VISITOR_KEY, id)
  if (fromCookie !== id) writeCookie(SHOPPER_VISITOR_COOKIE, id)
  return id
}

export function emitShopperSignal(signal: ShopperClientSignal) {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(SHOPPER_SIGNAL_EVENT, { detail: signal }))
}

export async function catalogAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = { Accept: 'application/json' }
  if (typeof window !== 'undefined') {
    const visitorId = getShopperVisitorId()
    if (visitorId) headers[SHOPPER_VISITOR_HEADER] = visitorId
    return headers
  }
  try {
    const { cookies } = await import('next/headers')
    const jar = await cookies()
    const visitorId = jar.get(SHOPPER_VISITOR_COOKIE)?.value
    if (visitorId) headers[SHOPPER_VISITOR_HEADER] = visitorId
  } catch {
    // cookies() is only available in a Next request scope
  }
  return headers
}
