export type CartItem = {
  productId: string
  variantId: string
  storeId: string
  storeName: string
  name: string
  sku: string
  title: string
  price: number
  image: string | null
  quantity: number
}

export const CART_KEY = 'onlineshop.cart.v1'
export const CART_EVENT = 'onlineshop:cart-updated'

export function readCart(): CartItem[] {
  if (typeof window === 'undefined') return []

  try {
    const raw = window.localStorage.getItem(CART_KEY)
    return raw ? (JSON.parse(raw) as CartItem[]) : []
  } catch {
    return []
  }
}

export function writeCart(items: CartItem[]) {
  window.localStorage.setItem(CART_KEY, JSON.stringify(items))
  window.dispatchEvent(new CustomEvent(CART_EVENT, { detail: items }))
}

export function addCartItem(item: Omit<CartItem, 'quantity'>) {
  const cart = readCart()
  const existing = cart.find((entry) => entry.variantId === item.variantId)
  const next = existing
    ? cart.map((entry) =>
        entry.variantId === item.variantId
          ? { ...entry, quantity: entry.quantity + 1 }
          : entry,
      )
    : [...cart, { ...item, quantity: 1 }]

  writeCart(next)
}
