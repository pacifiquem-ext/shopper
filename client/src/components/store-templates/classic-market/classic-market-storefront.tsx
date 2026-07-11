import type { CSSProperties } from 'react'
import type { ShopCatalogFiltersLabels } from '@/components/shop/shop-catalog-filters'
import { StoreContextSync } from '@/components/shop/store-context-sync'
import { SiteFooter } from '@/components/shop/site-footer'
import { buildSiteFooterStoreContext } from '@/lib/store-footer-context'
import { classicMarketThemeStyle } from '@/lib/store-templates'
import type { CatalogFilterParams } from '@/lib/catalog-query'
import type { CatalogStoreSummary } from '@/services/catalog.service'
import { ClassicMarketCatalog, type ClassicMarketCatalogSections } from './classic-market-catalog'
import { ClassicMarketHero } from './classic-market-hero'
import { ClassicMarketNavbar } from './classic-market-navbar'

export type ClassicMarketTexts = {
  eyebrow: string
  defaultTagline: string
  ctaShop: string
  ctaBrowse: string
  searchAria: string
  addToCart: string
  productsTitle: string
  footerTagline: string
  poweredBy: string
  marketplaceLabel: string
}

export type ClassicMarketStorefrontProps = {
  store: CatalogStoreSummary
  categories: Array<{ name: string; total: number }>
  filters: CatalogFilterParams
  filterLabels: ShopCatalogFiltersLabels
  texts: ClassicMarketTexts
  catalogSections: ClassicMarketCatalogSections
  marketplaceHref: string | null
  cartHref?: string
  isSubdomainHost?: boolean
}

export function ClassicMarketStorefront({
  store,
  categories,
  filters,
  filterLabels,
  texts,
  catalogSections,
  marketplaceHref,
  cartHref = '/cart',
  isSubdomainHost = false,
}: ClassicMarketStorefrontProps) {
  const themeStyle = classicMarketThemeStyle() as CSSProperties
  const tagline = store.description?.trim() || texts.defaultTagline

  return (
    <div
      className="kc-storefront min-h-screen bg-[var(--kc-bg)] text-[var(--kc-ink)] antialiased"
      style={themeStyle}
    >
      <StoreContextSync subdomain={store.subdomain} />
      <ClassicMarketNavbar
        storeName={store.displayName}
        logoUrl={store.logoUrl}
        searchAria={texts.searchAria}
        cartHref={cartHref}
      />
      <ClassicMarketHero
        storeName={store.displayName}
        tagline={tagline}
        eyebrow={texts.eyebrow}
        ctaShop={texts.ctaShop}
        ctaBrowse={texts.ctaBrowse}
      />
      <ClassicMarketCatalog
        filters={filters}
        categories={categories}
        filterLabels={filterLabels}
        sections={catalogSections}
        listingLabels={{ addToCart: texts.addToCart }}
      />
      <SiteFooter
        store={buildSiteFooterStoreContext({
          store,
          isSubdomainHost,
          marketplaceShopAbsoluteHref: marketplaceHref,
        })}
      />
    </div>
  )
}
