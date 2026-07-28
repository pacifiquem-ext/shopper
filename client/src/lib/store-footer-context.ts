import type { SiteFooterStoreContext } from '@/components/shop/site-footer'
import type { CatalogStoreSummary } from '@/services/catalog.service'

export function buildSiteFooterStoreContext(input: {
  store: CatalogStoreSummary
  listingSearch?: string
}): SiteFooterStoreContext {
  const { store, listingSearch } = input
  const slug = store.slug

  return {
    displayName: store.displayName,
    slug,
    logoUrl: store.logoUrl,
    description: store.description,
    contactEmail: store.contactEmail,
    contactPhone: store.contactPhone,
    brandColors: store.brandColors,
    listingSearch,
  }
}
