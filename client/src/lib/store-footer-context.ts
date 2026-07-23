import type { SiteFooterStoreContext } from '@/components/shop/site-footer'
import type { CatalogStoreSummary } from '@/services/catalog.service'

function storeSlug(store: CatalogStoreSummary): string {
  return store.slug ?? store.subdomain
}

export function buildSiteFooterStoreContext(input: {
  store: CatalogStoreSummary
  isSubdomainHost: boolean
  marketplaceShopAbsoluteHref: string | null
  listingSearch?: string
}): SiteFooterStoreContext {
  const { store, ...rest } = input

  return {
    displayName: store.displayName,
    subdomain: storeSlug(store),
    slug: storeSlug(store),
    logoUrl: store.logoUrl,
    description: store.description,
    contactEmail: store.contactEmail,
    contactPhone: store.contactPhone,
    brandColors: store.brandColors,
    ...rest,
  }
}
