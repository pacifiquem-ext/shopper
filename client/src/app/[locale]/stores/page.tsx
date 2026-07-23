import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import { RiStore2Line } from '@remixicon/react'

import { Link } from '@/i18n/navigation'
import { fetchCatalogGroups } from '@/services/catalog.service'
import * as Button from '@/components/alignui/button'
import { Card } from '@/components/alignui/card'
import { SiteFooter } from '@/components/shop/site-footer'
import { CartIconButton } from '@/components/shop/cart-icon-button'
import { buildTopStoresFromProducts, withTopStoreProductCountLabels } from '@/lib/catalog-stores'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'marketplace' })
  return {
    title: `${t('storesDirectoryTitle')}${t('brandSuffix')}`,
    description: t('storesDirectoryDescription'),
  }
}

export default async function StoresDirectoryPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale: _locale } = await params
  const t = await getTranslations('marketplace')
  const { data, devHint } = await fetchCatalogGroups({ cache: 'no-store' })

  if (!data) {
    return (
      <div className='mx-auto max-w-3xl px-4 py-16 text-center'>
        <p className='text-error-base'>{t('error')}</p>
        {process.env.NODE_ENV === 'development' && devHint ? (
          <pre className='mt-4 overflow-x-auto rounded-10 bg-bg-weak-50 p-3 text-left text-xs text-text-sub-600'>
            {devHint}
          </pre>
        ) : null}
        <div className='mt-6 flex justify-center'>
          <Button.Root asChild variant='neutral' mode='stroke'>
            <Link href='/'>{t('homeLink')}</Link>
          </Button.Root>
        </div>
      </div>
    )
  }

  const products = data.groups.flatMap((g) => g.products)
  const stores = withTopStoreProductCountLabels(
    data.stores?.length
      ? data.stores.map((entry) => ({
          store: entry.store,
          productCount: entry.productCount,
        }))
      : buildTopStoresFromProducts(products, 48),
    (count) => t('topStoresProductCount', { count }),
  )

  return (
    <div className='min-h-screen bg-bg-weak-50 text-text-strong-950'>
      <CartIconButton variant='fixed' />
      <header className='border-b border-stroke-soft-200 bg-bg-white-0'>
        <div className='mx-auto flex w-full max-w-screen-2xl flex-col gap-4 px-4 py-8 sm:px-5 lg:px-6'>
          <p className='text-label-sm uppercase tracking-[0.12em] text-primary-base'>
            {t('storesDirectoryEyebrow')}
          </p>
          <div className='flex flex-wrap items-end justify-between gap-4'>
            <div className='max-w-2xl space-y-2'>
              <h1 className='text-title-h4 text-text-strong-950 sm:text-title-h3'>
                {t('storesDirectoryTitle')}
              </h1>
              <p className='text-paragraph-sm text-text-sub-600 sm:text-paragraph-md'>
                {t('storesDirectoryDescription')}
              </p>
            </div>
            <Button.Root asChild variant='primary' mode='filled' className='rounded-full'>
              <Link href='/shop'>{t('browseAllProducts')}</Link>
            </Button.Root>
          </div>
        </div>
      </header>

      <main className='mx-auto w-full max-w-screen-2xl px-4 py-8 sm:px-5 lg:px-6'>
        {stores.length === 0 ? (
          <div className='flex flex-col items-center justify-center gap-3 rounded-20 border border-stroke-soft-200 bg-bg-white-0 px-6 py-16 text-center shadow-regular-xs'>
            <RiStore2Line className='size-10 text-text-soft-400' aria-hidden />
            <p className='text-label-md text-text-strong-950'>{t('storesDirectoryEmpty')}</p>
            <Button.Root asChild variant='neutral' mode='stroke' className='rounded-full'>
              <Link href='/'>{t('homeLink')}</Link>
            </Button.Root>
          </div>
        ) : (
          <ul className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
            {stores.map(({ store, productCountLabel }) => (
              <li key={store.id}>
                <Link
                  href={`/stores/${encodeURIComponent(store.subdomain)}`}
                  prefetch={false}
                  className='block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-base/40'
                >
                  <Card className='flex h-full flex-col overflow-hidden border-stroke-soft-200 shadow-soft-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-soft-card-hover'>
                    <div className='relative aspect-[16/10] bg-bg-soft-200'>
                      {store.logoUrl ? (
                        <img
                          src={store.logoUrl}
                          alt=''
                          className='size-full object-cover'
                          loading='lazy'
                        />
                      ) : (
                        <div className='flex size-full items-center justify-center'>
                          <RiStore2Line className='size-12 text-primary-base' aria-hidden />
                        </div>
                      )}
                    </div>
                    <div className='flex flex-1 flex-col gap-2 p-4'>
                      <h2 className='text-label-lg text-text-strong-950'>{store.displayName}</h2>
                      {store.description ? (
                        <p className='line-clamp-2 text-paragraph-sm text-text-sub-600'>
                          {store.description}
                        </p>
                      ) : null}
                      <p className='mt-auto text-label-sm text-text-soft-400'>{productCountLabel}</p>
                    </div>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
      <SiteFooter />
    </div>
  )
}
