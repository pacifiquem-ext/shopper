import { Suspense } from 'react'
import { cookies, headers } from 'next/headers'
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

import { CartPageClient } from '@/components/shop/cart-page-client'
import { CartTemplateRedirect } from '@/components/shop/cart-template-redirect'
import type { CartStoreShellTexts } from '@/components/shop/cart-store-shell'
import { StoreContextSync } from '@/components/shop/store-context-sync'
import { fetchCatalogGroups } from '@/services/catalog.service'
import { buildSiteFooterStoreContext } from '@/lib/store-footer-context'
import { STORE_CONTEXT_COOKIE } from '@/lib/store-context'
import type { SiteFooterStoreContext } from '@/components/shop/site-footer'
import { extractSubdomain, normalizeStoreSubdomain } from '@/lib/host'
import { marketplaceShopAbsoluteUrl } from '@/lib/marketplace-url'
import { storeCartPath, storeShopPath } from '@/lib/store-navigation'
import {
  isIshushoCraftsTemplate,
  isVibrantMarketTemplate,
  resolveStoreTemplate,
  STORE_TEMPLATE_IDS,
  type StoreTemplateId,
} from '@/lib/store-templates'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'cart' })

  return {
    title: t('title'),
    description: t('subtitle'),
  }
}

export default async function CartPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ store?: string }>
}) {
  const { locale } = await params
  const { store: storeQuery } = await searchParams
  const headersList = await headers()
  const cookieStore = await cookies()
  const hostSubdomain = extractSubdomain(headersList.get('host'))
  const subdomain =
    hostSubdomain ??
    normalizeStoreSubdomain(storeQuery) ??
    normalizeStoreSubdomain(cookieStore.get(STORE_CONTEXT_COOKIE)?.value)

  let template: StoreTemplateId = STORE_TEMPLATE_IDS.DEFAULT
  let shellTexts: CartStoreShellTexts | null = null
  let storeProps: {
    displayName: string
    subdomain: string
    logoUrl: string | null
    contactEmail: string | null
    contactPhone: string | null
  } | null = null
  let marketplaceHref: string | null = null
  let footerStore: SiteFooterStoreContext | null = null

  if (subdomain) {
    const { data } = await fetchCatalogGroups({ subdomain })
    const catalogStore = data?.store ?? null
    if (catalogStore) {
      footerStore = buildSiteFooterStoreContext({
        store: catalogStore,
        isSubdomainHost: Boolean(hostSubdomain),
        marketplaceShopAbsoluteHref: null,
        listingSearch: hostSubdomain
          ? undefined
          : `store=${encodeURIComponent(catalogStore.subdomain)}`,
      })
      template = resolveStoreTemplate(catalogStore)
      storeProps = {
        displayName: catalogStore.displayName,
        subdomain: catalogStore.subdomain,
        logoUrl: catalogStore.logoUrl,
        contactEmail: catalogStore.contactEmail,
        contactPhone: catalogStore.contactPhone,
      }

      if (isIshushoCraftsTemplate(template)) {
        const tIc = await getTranslations('storeTemplates.ishushoCrafts')
        shellTexts = {
          searchAria: tIc('searchAria'),
          navShopLabel: tIc('navShopLabel'),
        }
      } else if (isVibrantMarketTemplate(template)) {
        const tVm = await getTranslations('storeTemplates.vibrantMarket')
        shellTexts = {
          searchAria: tVm('searchAria'),
          promoMessages: [tVm('promo2'), tVm('promo3')],
          tickerAria: tVm('tickerAria'),
        }
      }
    }

    if (hostSubdomain) {
      marketplaceHref = marketplaceShopAbsoluteUrl(locale)
      if (footerStore) {
        footerStore = {
          ...footerStore,
          marketplaceShopAbsoluteHref: marketplaceHref,
        }
      }
    }
  }

  return (
    <>
      {subdomain ? <StoreContextSync subdomain={subdomain} /> : null}
      <Suspense fallback={null}>
        <CartTemplateRedirect template={template} />
      </Suspense>
      <CartPageClient
        template={template}
        shopBackHref={storeShopPath(subdomain, Boolean(hostSubdomain))}
        cartHref={storeCartPath(subdomain, Boolean(hostSubdomain))}
        store={storeProps}
        footerStore={footerStore}
        marketplaceHref={marketplaceHref}
        shellTexts={shellTexts}
      />
    </>
  )
}
