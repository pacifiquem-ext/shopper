/** Cart URL that preserves storefront template on marketplace (`?store=`). */
export function storeCartPath(
  subdomain: string | null | undefined,
  isSubdomainHost: boolean,
): string {
  if (!subdomain?.trim()) return '/cart'
  if (isSubdomainHost) return '/cart'
  return `/cart?store=${encodeURIComponent(subdomain.trim())}`
}

/** Shop home URL for “back to shop” from cart or product pages. */
export function storeShopPath(
  subdomain: string | null | undefined,
  isSubdomainHost: boolean,
): string {
  if (!subdomain?.trim()) return '/shop'
  if (isSubdomainHost) return '/'
  return `/shop?store=${encodeURIComponent(subdomain.trim())}`
}

/** Public product detail page on the marketplace app. */
export function storeProductPath(productId: string): string {
  return `/shop/${productId}`
}
