import type { CSSProperties, ReactNode } from 'react'

import { SiteFooter } from '@/components/shop/site-footer'
import type { SiteFooterStoreContext } from '@/components/shop/site-footer'
import { ishushoCraftsFontClassName } from '@/components/store-templates/ishusho-crafts/ishusho-crafts-fonts'
import { IshushoCraftsNavbar } from '@/components/store-templates/ishusho-crafts/ishusho-crafts-navbar'
import { VibrantMarketHeader } from '@/components/store-templates/vibrant-market/vibrant-market-header'
import type { CartPageTheme } from '@/lib/cart-page-theme'
import { ishushoCraftsThemeStyle, vibrantMarketThemeStyle } from '@/lib/store-templates'

export type CartStoreShellTexts = {
  searchAria: string
  promoMessages?: string[]
  tickerAria?: string
  navShopLabel?: string
}

type CartStoreShellProps = {
  theme: CartPageTheme
  storeName: string
  logoUrl: string | null
  footerStore: SiteFooterStoreContext
  cartHref?: string
  texts: CartStoreShellTexts
  children: ReactNode
}

export function CartStoreShell({
  theme,
  storeName,
  logoUrl,
  footerStore,
  cartHref = '/cart',
  texts,
  children,
}: CartStoreShellProps) {
  if (theme === 'vibrant-market') {
    const themeStyle = vibrantMarketThemeStyle() as CSSProperties

    return (
      <div className='vm-storefront min-h-screen bg-[var(--vm-bg)] text-[var(--vm-ink)] antialiased' style={themeStyle}>
        <VibrantMarketHeader
          storeName={storeName}
          logoUrl={logoUrl}
          promoMessages={texts.promoMessages ?? []}
          tickerAria={texts.tickerAria ?? texts.searchAria}
          cartHref={cartHref}
        />
        {children}
        <SiteFooter store={footerStore} />
      </div>
    )
  }

  if (theme === 'ishusho-crafts') {
    const themeStyle = ishushoCraftsThemeStyle() as CSSProperties

    return (
      <div
        className={`ic-storefront ${ishushoCraftsFontClassName} min-h-screen bg-[var(--ic-bg)] font-[family-name:var(--font-ic-sans)] text-[var(--ic-ink)]`}
        style={themeStyle}
      >
        <IshushoCraftsNavbar
          storeName={storeName}
          logoUrl={logoUrl}
          navShopLabel={texts.navShopLabel ?? texts.searchAria}
          cartHref={cartHref}
        />
        {children}
        <SiteFooter store={footerStore} />
      </div>
    )
  }

  return <>{children}</>
}
