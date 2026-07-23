import { headers } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

import { Link } from '@/i18n/navigation'
import { fetchCatalogProductById, storePublicSlug } from '@/services/catalog.service'
import { Button } from '@/components/ui/button'
import { ProductDetailsBody, ProductDetailsTopBar } from '@/components/shop/product-details-body'
import { SiteFooter } from '@/components/shop/site-footer'
import { extractSubdomain, isProductId, normalizeStoreSubdomain } from '@/lib/host'

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

  const { data } = await fetchCatalogProductById(id, { storeSlug: subdomain })
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
  const headersList = await headers()
  const subdomain = extractSubdomain(headersList.get('host'))
  const storeSlug = !subdomain && !isProductId(id) ? normalizeStoreSubdomain(id) : null
  if (storeSlug) {
    redirect(`/${locale}/stores/${encodeURIComponent(storeSlug)}` as never)
  }

  const { data, devHint } = await fetchCatalogProductById(id, { storeSlug: subdomain })

  if (!data) {
    if (process.env.NODE_ENV === 'development' && devHint) {
      return (
        <div className='mx-auto max-w-3xl px-4 py-16'>
          <p className='text-center text-text-strong-950'>{t('notFound')}</p>
          <pre className='mt-4 overflow-x-auto rounded-md border border-stroke-soft-200 bg-bg-white-0/70 p-3 text-left text-xs break-words whitespace-pre-wrap text-text-sub-600 backdrop-blur-md'>
            {devHint}
          </pre>
          <div className='mt-6 flex justify-center'>
            <Button
              asChild
              variant='outline'
              className='rounded-full border-stroke-soft-200 bg-bg-white-0/60 text-text-strong-950 backdrop-blur-md hover:bg-bg-white-0/85'
            >
              <Link href='/shop'>{t('backToShop')}</Link>
            </Button>
          </div>
        </div>
      )
    }
    notFound()
  }

  const sellerSlug = storePublicSlug(data.store)

  return (
    <div className='min-h-screen bg-bg-weak-50 text-text-strong-950'>
      <ProductDetailsTopBar
        backLabel={t('backToShop')}
        approvedLabel={t('approvedStore')}
        backHref='/shop'
      />
      <ProductDetailsBody product={data} />
      <div className='mx-auto max-w-6xl px-4 pb-8'>
        <Link
          href={`/stores/${encodeURIComponent(sellerSlug)}`}
          className='text-sm font-semibold text-primary-base hover:underline'
        >
          {t('fromStore', { name: data.store.displayName })}
        </Link>
      </div>
      <SiteFooter />
    </div>
  )
}
