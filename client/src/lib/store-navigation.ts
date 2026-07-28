export function storeCartPath(slug: string | null | undefined): string {
  if (!slug?.trim()) return '/cart'
  return `/cart?store=${encodeURIComponent(slug.trim())}`
}

export function storeShopPath(slug: string | null | undefined): string {
  if (!slug?.trim()) return '/shop'
  return `/stores/${encodeURIComponent(slug.trim())}`
}

export function storeProductPath(productId: string): string {
  return `/shop/${productId}`
}
