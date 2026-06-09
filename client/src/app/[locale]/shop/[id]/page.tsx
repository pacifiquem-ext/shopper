import { headers } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

import { Link } from '@/i18n/navigation'
import { fetchCatalogProductById } from '@/services/catalog.service'
import { Button } from '@/components/ui/button'
import { BecomeSellerShopButton } from '@/components/shop/become-seller-shop-button'
import { CartIconButton } from '@/components/shop/cart-icon-button'
import { ProductDetailsBody, ProductDetailsTopBar } from '@/components/shop/product-details-body'
import { SiteFooter } from '@/components/shop/site-footer'
import { IshushoCraftsProductPage } from '@/components/store-templates/ishusho-crafts/ishusho-crafts-product-page'
import { VibrantMarketProductPage } from '@/components/store-templates/vibrant-market/vibrant-market-product-page'
import { extractSubdomain, isProductId, normalizeStoreSubdomain } from '@/lib/host'
import { marketplaceShopAbsoluteUrl } from '@/lib/marketplace-url'
import { buildSiteFooterStoreContext } from '@/lib/store-footer-context'
import { storeCartPath } from '@/lib/store-navigation'
import {
  isIshushoCraftsTemplate,
  isVibrantMarketTemplate,
  resolveStoreTemplate,
} from '@/lib/store-templates'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>
}): Promise<Metadata> {
  const { locale, id } = await params
  const t = await getTranslations({ locale, namespace: 'product' })
  const headersList = await headers()
  const subdomain = extractSubdomain(headersList.get('host'))
  const storeSlug = !subdomain && !isProductId(id) ? normalizeStoreSubdomain(id) : null
  if (storeSlug) {
    const marketplace = await getTranslations({ locale, namespace: 'marketplace' })
    return {
      title: marketplace('storeMetaTitle', { store: storeSlug }),
      description: marketplace('storeMetaDescription', { store: storeSlug }),
    }
  }

  const { data } = await fetchCatalogProductById(id, { subdomain })
  if (!data) return { title: t('title') }
  return {
    title: `${data.name} — ${t('title')}`,
    description: data.description ?? undefined,
  }
}

export default async function ProductDetailsPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>
}) {
  const { locale, id } = await params
  const t = await getTranslations('product')
  const tMarketplace = await getTranslations('marketplace')
  const headersList = await headers()
  const subdomain = extractSubdomain(headersList.get('host'))
  const storeSlug = !subdomain && !isProductId(id) ? normalizeStoreSubdomain(id) : null
  if (storeSlug) {
    redirect(`/${locale}/shop?store=${encodeURIComponent(storeSlug)}`)
  }

  const { data, devHint } = await fetchCatalogProductById(id, { subdomain })

  if (!data) {
    if (process.env.NODE_ENV === 'development' && devHint) {
      return (
        <div className='mx-auto max-w-3xl px-4 py-16'>
          <p className='text-center text-[#2B2B2B]'>{t('notFound')}</p>
          <pre className='mt-4 overflow-x-auto rounded-md border border-[rgba(43,43,43,0.08)] bg-white/70 p-3 text-left text-xs break-words whitespace-pre-wrap text-[#6E6A66] backdrop-blur-md'>
            {devHint}
          </pre>
          <div className='mt-6 flex justify-center'>
            <Button asChild variant='outline' className='rounded-full border-[rgba(43,43,43,0.08)] bg-white/60 text-[#2B2B2B] backdrop-blur-md hover:bg-white/85 hover:text-[#2B2B2B]'>
              <Link href='/shop'>{t('backToShop')}</Link>
            </Button>
          </div>
        </div>
      )
    }
    notFound()
  }

  const storeFooter = subdomain
    ? buildSiteFooterStoreContext({
        store: data.store,
        isSubdomainHost: true,
        marketplaceShopAbsoluteHref: marketplaceShopAbsoluteUrl(locale),
      })
    : undefined

  const marketplaceHref = subdomain ? marketplaceShopAbsoluteUrl(locale) : null
  const cartHref = storeCartPath(data.store.subdomain, Boolean(subdomain))
  const template = resolveStoreTemplate(data.store)

  if (isIshushoCraftsTemplate(template)) {
    const tIc = await getTranslations('storeTemplates.ishushoCrafts')
    return (
      <IshushoCraftsProductPage
        product={data}
        marketplaceHref={marketplaceHref}
        cartHref={cartHref}
        tProduct={t}
        texts={{
          backToShop: t('backToShop'),
          approvedStore: t('approvedStore'),
          searchAria: tIc('searchAria'),
          navShopLabel: tIc('navShopLabel'),
          footerTagline: tIc('footerTagline', { store: data.store.displayName }),
          poweredBy: tIc('poweredBy'),
          marketplaceLabel: tIc('marketplaceLabel'),
          contactLabel: tIc('contactLabel'),
        }}
      />
    )
  }

  if (isVibrantMarketTemplate(template)) {
    const tVm = await getTranslations('storeTemplates.vibrantMarket')
    return (
      <VibrantMarketProductPage
        product={data}
        marketplaceHref={marketplaceHref}
        cartHref={cartHref}
        tProduct={t}
        texts={{
          backToShop: t('backToShop'),
          approvedStore: t('approvedStore'),
          searchAria: tVm('searchAria'),
          promoMessages: [tVm('promo2'), tVm('promo3')],
          tickerAria: tVm('tickerAria'),
          footerTagline: tVm('footerTagline'),
          poweredBy: tVm('poweredBy'),
          marketplaceLabel: tVm('marketplaceLabel'),
        }}
      />
    )
  }

  return (
    <div className='min-h-screen bg-[#F5F1EB] text-[#2B2B2B]'>
      <CartIconButton />
      <BecomeSellerShopButton label={tMarketplace('becomeSeller')} position='nearCart' />

      <ProductDetailsTopBar
        theme='default'
        backLabel={t('backToShop')}
        approvedLabel={t('approvedStore')}
      />

      <ProductDetailsBody product={data} theme='default' t={t} />

      <SiteFooter store={storeFooter} />
    </div>
  )
}
