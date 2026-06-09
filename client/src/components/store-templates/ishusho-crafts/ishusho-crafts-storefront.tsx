import type { CSSProperties } from 'react'

import type { ShopCatalogFiltersLabels } from '@/components/shop/shop-catalog-filters'
import { resolveStoreHeroDescription } from '@/lib/store-hero-description'
import { ishushoCraftsThemeStyle } from '@/lib/store-templates'
import type { CatalogFilterParams } from '@/lib/catalog-query'
import type { CatalogStoreSummary } from '@/services/catalog.service'

import { StoreContextSync } from '@/components/shop/store-context-sync'

import { SiteFooter } from '@/components/shop/site-footer'
import { buildSiteFooterStoreContext } from '@/lib/store-footer-context'

import { IshushoCraftsCatalog, type IshushoCraftsCatalogSections } from './ishusho-crafts-catalog'
import { ishushoCraftsFontClassName } from './ishusho-crafts-fonts'
import { IshushoCraftsHero } from './ishusho-crafts-hero'
import { IshushoCraftsNavbar } from './ishusho-crafts-navbar'
import { IshushoCraftsPromoStrip } from './ishusho-crafts-promo-strip'

export type IshushoCraftsTexts = {
  heroFallback: string
  heroStorefrontLabel: string
  heroBrowse: string
  ctaShop: string
  searchAria: string
  navShopLabel: string
  addToCart: string
  productsTitle: string
  productsSubtitle: string
  chipFilterAria: string
  chipAll: string
  itemsCountLabel: string
  promoMessages: string[]
  tickerAria: string
  footerTagline: string
  poweredBy: string
  marketplaceLabel: string
  contactLabel: string
}

export type IshushoCraftsStorefrontProps = {
  store: CatalogStoreSummary
  categories: Array<{ name: string; total: number }>
  filters: CatalogFilterParams
  filterLabels: ShopCatalogFiltersLabels
  texts: IshushoCraftsTexts
  catalogSections: IshushoCraftsCatalogSections
  marketplaceHref: string | null
  cartHref?: string
}

export function IshushoCraftsStorefront({
  store,
  categories,
  filters,
  filterLabels,
  texts,
  catalogSections,
  marketplaceHref,
  cartHref = '/cart',
}: IshushoCraftsStorefrontProps) {
  const heroDescription = resolveStoreHeroDescription(
    store.description,
    texts.heroFallback,
  )

  const listingLabels = { addToCart: texts.addToCart }

  const themeStyle = ishushoCraftsThemeStyle() as CSSProperties

  return (
    <div
      className={`ic-storefront ${ishushoCraftsFontClassName} min-h-screen bg-[var(--ic-bg)] font-[family-name:var(--font-ic-sans)] text-[var(--ic-ink)]`}
      style={themeStyle}
    >
      <StoreContextSync subdomain={store.subdomain} />
      <IshushoCraftsNavbar
        storeName={store.displayName}
        logoUrl={store.logoUrl}
        navShopLabel={texts.navShopLabel}
        cartHref={cartHref}
      />
      <IshushoCraftsPromoStrip messages={texts.promoMessages} ariaLabel={texts.tickerAria} />
      <IshushoCraftsHero
        storeName={store.displayName}
        tagline={heroDescription}
        storefrontLabel={texts.heroStorefrontLabel}
        ctaShop={texts.ctaShop}
        ctaBrowse={texts.heroBrowse}
        itemsCountLabel={texts.itemsCountLabel}
      />
      <IshushoCraftsCatalog
        filters={filters}
        filterLabels={filterLabels}
        categories={categories}
        chipAllLabel={texts.chipAll}
        chipFilterAria={texts.chipFilterAria}
        productsSubtitle={texts.productsSubtitle}
        sections={catalogSections}
        listingLabels={listingLabels}
      />
      <SiteFooter
        className='mt-12'
        store={buildSiteFooterStoreContext({
          store,
          isSubdomainHost: marketplaceHref != null,
          marketplaceShopAbsoluteHref: marketplaceHref,
          listingSearch: `store=${encodeURIComponent(store.subdomain)}`,
        })}
      />
    </div>
  )
}
