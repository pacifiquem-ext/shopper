import type { CSSProperties } from 'react'
import { StoreContextSync } from '@/components/shop/store-context-sync'
import {
  ProductDetailsBody,
  ProductDetailsTopBar,
} from '@/components/shop/product-details-body'
import { SiteFooter } from '@/components/shop/site-footer'
import { buildSiteFooterStoreContext } from '@/lib/store-footer-context'
import { classicMarketThemeStyle } from '@/lib/store-templates'
import type { CatalogProductPublic } from '@/services/catalog.service'
import { ClassicMarketNavbar } from './classic-market-navbar'

type Props = {
  product: CatalogProductPublic
  marketplaceHref: string | null
  cartHref: string
  shopHref: string
  isSubdomainHost?: boolean
  texts: {
    backToShop: string
    approvedStore: string
    searchAria: string
  }
}

export function ClassicMarketProductPage({
  product,
  marketplaceHref,
  cartHref,
  shopHref,
  isSubdomainHost = false,
  texts,
}: Props) {
  const themeStyle = classicMarketThemeStyle() as CSSProperties
  return (
    <div className="min-h-screen bg-[var(--kc-bg)] text-[var(--kc-ink)]" style={themeStyle}>
      <StoreContextSync subdomain={product.store.subdomain} />
      <ClassicMarketNavbar
        storeName={product.store.displayName}
        logoUrl={product.store.logoUrl}
        searchAria={texts.searchAria}
        cartHref={cartHref}
      />
      <ProductDetailsTopBar
        theme="default"
        backLabel={texts.backToShop}
        approvedLabel={texts.approvedStore}
        backHref={shopHref}
      />
      <ProductDetailsBody product={product} theme="default" />
      <SiteFooter
        store={buildSiteFooterStoreContext({
          store: product.store,
          isSubdomainHost,
          marketplaceShopAbsoluteHref: marketplaceHref,
        })}
      />
    </div>
  )
}
