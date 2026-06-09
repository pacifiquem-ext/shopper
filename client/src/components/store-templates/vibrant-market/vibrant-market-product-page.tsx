import type { CSSProperties } from 'react'

import { ProductDetailsBody, ProductDetailsTopBar } from '@/components/shop/product-details-body'
import { StoreContextSync } from '@/components/shop/store-context-sync'
import { vibrantMarketThemeStyle } from '@/lib/store-templates'
import type { CatalogProductPublic } from '@/services/catalog.service'

import { SiteFooter } from '@/components/shop/site-footer'
import { buildSiteFooterStoreContext } from '@/lib/store-footer-context'
import { VibrantMarketHeader } from './vibrant-market-header'

type VibrantMarketProductPageProps = {
  product: CatalogProductPublic
  marketplaceHref: string | null
  cartHref?: string
  texts: {
    backToShop: string
    approvedStore: string
    searchAria: string
    promoMessages: string[]
    tickerAria: string
    footerTagline: string
    poweredBy: string
    marketplaceLabel: string
  }
  tProduct: (key: string, values?: Record<string, string | number>) => string
}

export function VibrantMarketProductPage({
  product,
  marketplaceHref,
  cartHref = '/cart',
  texts,
  tProduct,
}: VibrantMarketProductPageProps) {
  const themeStyle = vibrantMarketThemeStyle() as CSSProperties

  return (
    <div className='vm-storefront min-h-screen bg-[var(--vm-bg)] text-[var(--vm-ink)] antialiased' style={themeStyle}>
      <StoreContextSync subdomain={product.store.subdomain} />
      <VibrantMarketHeader
        storeName={product.store.displayName}
        logoUrl={product.store.logoUrl}
        promoMessages={texts.promoMessages}
        tickerAria={texts.tickerAria}
      />
      <ProductDetailsTopBar
        theme='vibrant-market'
        backLabel={texts.backToShop}
        approvedLabel={texts.approvedStore}
      />
      <ProductDetailsBody product={product} theme='vibrant-market' t={tProduct} />
      <SiteFooter
        store={buildSiteFooterStoreContext({
          store: product.store,
          isSubdomainHost: marketplaceHref != null,
          marketplaceShopAbsoluteHref: marketplaceHref,
          listingSearch: `store=${encodeURIComponent(product.store.subdomain)}`,
        })}
      />
    </div>
  )
}
