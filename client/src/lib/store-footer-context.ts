import type { SiteFooterStoreContext } from '@/components/shop/site-footer'
import { resolveStoreTemplate } from '@/lib/store-templates'
import type { CatalogStoreSummary } from '@/services/catalog.service'

export function buildSiteFooterStoreContext(input: {
  store: CatalogStoreSummary
  isSubdomainHost: boolean
  marketplaceShopAbsoluteHref: string | null
  listingSearch?: string
}): SiteFooterStoreContext {
  const { store, ...rest } = input

  return {
    displayName: store.displayName,
    subdomain: store.subdomain,
    logoUrl: store.logoUrl,
    description: store.description,
    contactEmail: store.contactEmail,
    contactPhone: store.contactPhone,
    template: resolveStoreTemplate(store),
    brandColors: store.brandColors,
    ...rest,
  }
}
