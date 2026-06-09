import type { CSSProperties } from 'react'

import { ProductDetailsBody, ProductDetailsTopBar } from '@/components/shop/product-details-body'
import { StoreContextSync } from '@/components/shop/store-context-sync'
import { ishushoCraftsThemeStyle } from '@/lib/store-templates'
import type { CatalogProductPublic } from '@/services/catalog.service'

import { SiteFooter } from '@/components/shop/site-footer'
import { buildSiteFooterStoreContext } from '@/lib/store-footer-context'
import { ishushoCraftsFontClassName } from './ishusho-crafts-fonts'
import { IshushoCraftsNavbar } from './ishusho-crafts-navbar'

type IshushoCraftsProductPageProps = {
  product: CatalogProductPublic
  marketplaceHref: string | null
  cartHref?: string
  texts: {
    backToShop: string
    approvedStore: string
    searchAria: string
    navShopLabel: string
    footerTagline: string
    poweredBy: string
    marketplaceLabel: string
    contactLabel: string
  }
  tProduct: (key: string, values?: Record<string, string | number>) => string
}

export function IshushoCraftsProductPage({
  product,
  marketplaceHref,
  cartHref = '/cart',
  texts,
  tProduct,
}: IshushoCraftsProductPageProps) {
  const themeStyle = ishushoCraftsThemeStyle() as CSSProperties

  return (
    <div
      className={`ic-storefront ${ishushoCraftsFontClassName} min-h-screen bg-[var(--ic-bg)] font-[family-name:var(--font-ic-sans)] text-[var(--ic-ink)]`}
      style={themeStyle}
    >
      <StoreContextSync subdomain={product.store.subdomain} />
      <IshushoCraftsNavbar
        storeName={product.store.displayName}
        logoUrl={product.store.logoUrl}
        navShopLabel={texts.navShopLabel}
        cartHref={cartHref}
      />
      <ProductDetailsTopBar
        theme='ishusho-crafts'
        backLabel={texts.backToShop}
        approvedLabel={texts.approvedStore}
      />
      <ProductDetailsBody product={product} theme='ishusho-crafts' t={tProduct} />
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
