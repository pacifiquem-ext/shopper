import type { CSSProperties } from 'react'

import type { ShopProductCell } from '@/components/shop/shop-product-grids-with-quick-view'
import type { ShopCatalogFiltersLabels } from '@/components/shop/shop-catalog-filters'
import { vibrantMarketThemeStyle } from '@/lib/store-templates'
import type { CatalogFilterParams } from '@/lib/catalog-query'
import type { CatalogStoreSummary } from '@/services/catalog.service'

import { StoreContextSync } from '@/components/shop/store-context-sync'

import { VibrantMarketCatalog, type VibrantMarketCatalogSections } from './vibrant-market-catalog'
import { SiteFooter } from '@/components/shop/site-footer'
import { buildSiteFooterStoreContext } from '@/lib/store-footer-context'
import { VibrantMarketHero } from './vibrant-market-hero'
import { VibrantMarketHeader } from './vibrant-market-header'

export type VibrantMarketTexts = {
  eyebrow: string
  promoMessages: string[]
  productsTitle: string
  categoriesLabel: string
  emptyMessage: string
  searchAria: string
  defaultTagline: string
  ctaStartShopping: string
  ctaTrendingNow: string
  tickerAria: string
  flashSaleBadge: string
  addToCart: string
  footerTagline: string
  poweredBy: string
  marketplaceLabel: string
}

export type VibrantMarketStorefrontProps = {
  store: CatalogStoreSummary
  items: ShopProductCell[]
  categories: Array<{ name: string; total: number }>
  filters: CatalogFilterParams
  filterLabels: ShopCatalogFiltersLabels
  texts: VibrantMarketTexts
  catalogSections: VibrantMarketCatalogSections
  marketplaceHref: string | null
  cartHref?: string
}

export function VibrantMarketStorefront({
  store,
  items,
  categories,
  filters,
  filterLabels,
  texts,
  catalogSections,
  marketplaceHref,
  cartHref = '/cart',
}: VibrantMarketStorefrontProps) {
  const tagline = texts.defaultTagline
  const newArrivalsHref = '#new-arrivals'
  const themeStyle = vibrantMarketThemeStyle() as CSSProperties

  return (
    <div
      className='vm-storefront min-h-screen bg-[var(--vm-bg)] text-[var(--vm-ink)] antialiased'
      style={themeStyle}
    >
      <StoreContextSync subdomain={store.subdomain} />
      <VibrantMarketHeader
        storeName={store.displayName}
        logoUrl={store.logoUrl}
        promoMessages={texts.promoMessages}
        tickerAria={texts.tickerAria}
        cartHref={cartHref}
      />
      <VibrantMarketHero
        eyebrow={texts.eyebrow}
        storeName={store.displayName}
        tagline={tagline}
        ctaStartShopping={texts.ctaStartShopping}
        ctaTrendingNow={texts.ctaTrendingNow}
        trendingHref={newArrivalsHref}
      />
      <VibrantMarketCatalog
        filters={filters}
        categories={categories}
        filterLabels={filterLabels}
        categoriesLabel={texts.categoriesLabel}
        sections={catalogSections}
        listingLabels={{
          flashSaleBadge: texts.flashSaleBadge,
          addToCart: texts.addToCart,
        }}
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
