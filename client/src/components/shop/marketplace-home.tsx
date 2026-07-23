import { getTranslations } from 'next-intl/server'
import { ArrowRight, Sparkles, Store as StoreIcon, Tag, Trophy } from 'lucide-react'

import { Link } from '@/i18n/navigation'
import * as Button from '@/components/alignui/button'
import { Card } from '@/components/alignui/card'
import { SiteFooter } from '@/components/shop/site-footer'
import { CartIconButton } from '@/components/shop/cart-icon-button'
import type { ProductCardLabels } from '@/components/shop/product-card'
import { ShopProductGridsWithQuickView } from '@/components/shop/shop-product-grids-with-quick-view'
import {
  fetchCatalogHome,
  storePublicSlug,
  type CatalogProductPublic,
  type CatalogStoreWithProductCount,
} from '@/services/catalog.service'
import { discountPercent } from '@/lib/product-display'
import { merchantSignupHref } from '@/lib/auth-return-url'

function availableStock(product: CatalogProductPublic): number {
  return product.variants.reduce((sum, variant) => sum + (variant.inventory?.available ?? 0), 0)
}

function buildProductCardLabels(
  t: Awaited<ReturnType<typeof getTranslations<'marketplace'>>>,
  product: CatalogProductPublic,
): ProductCardLabels {
  const stock = availableStock(product)
  const off = discountPercent(product.priceFrom, product.compareAtFrom)
  const stockTagText =
    stock <= 0
      ? t('outOfStockTag')
      : stock <= 5
        ? t('lowStockTag', { count: stock })
        : t('inStockTag', { count: stock })

  return {
    storeLabel: t('storeLabel', { name: product.store.displayName }),
    addToCartAria: t('addToCartAria'),
    addedLabel: t('addedToCart'),
    toastAdded: t('toastAddedToCart'),
    wishlistAria: t('wishlistAria'),
    wishlistSavedToast: t('savedToWishlist'),
    wishlistRemovedToast: t('removedFromWishlist'),
    newBadge: t('newBadge'),
    discountBadge: off != null ? t('offBadge', { percent: off }) : null,
    ratingAriaLabel: t('ratingValue', {
      rating: product.averageRating != null ? product.averageRating.toFixed(1) : '—',
    }),
    stockTagText,
    deliveryAvailable: t('deliveryAvailable'),
  }
}

function toCardItems(
  t: Awaited<ReturnType<typeof getTranslations<'marketplace'>>>,
  products: CatalogProductPublic[],
) {
  return products.map((product) => ({
    product,
    labels: buildProductCardLabels(t, product),
  }))
}

function StoreMiniCard({
  entry,
  visitLabel,
  productCountLabel,
}: {
  entry: CatalogStoreWithProductCount
  visitLabel: string
  productCountLabel: string
}) {
  const slug = storePublicSlug(entry.store)
  return (
    <Card className='flex flex-col gap-3 p-4'>
      <div className='flex items-center gap-3'>
        <span className='grid size-12 shrink-0 place-items-center overflow-hidden rounded-2xl bg-bg-weak-50 ring-1 ring-stroke-soft-200'>
          {entry.store.logoUrl ? (
            <img
              src={entry.store.logoUrl}
              alt={entry.store.displayName}
              className='size-full object-cover'
            />
          ) : (
            <StoreIcon className='size-5 text-primary-base' aria-hidden />
          )}
        </span>
        <div className='min-w-0'>
          <p className='truncate text-label-md text-text-strong-950'>{entry.store.displayName}</p>
          <p className='text-paragraph-xs text-text-sub-600'>{productCountLabel}</p>
        </div>
      </div>
      <Button.Root asChild variant='neutral' mode='stroke' size='small' className='w-full'>
        <Link href={`/stores/${encodeURIComponent(slug)}`}>{visitLabel}</Link>
      </Button.Root>
    </Card>
  )
}

export async function MarketplaceHome() {
  const t = await getTranslations('marketplace')
  const { data, devHint } = await fetchCatalogHome({ cache: 'no-store' })

  if (!data) {
    return (
      <div className='mx-auto max-w-3xl px-4 py-16 text-center'>
        <p className='text-error-base'>{t('error')}</p>
        {process.env.NODE_ENV === 'development' && devHint ? (
          <pre className='mt-4 overflow-x-auto rounded-10 bg-bg-weak-50 p-3 text-left text-xs text-text-sub-600'>
            {devHint}
          </pre>
        ) : null}
        <div className='mt-6 flex justify-center gap-3'>
          <Button.Root asChild variant='primary'>
            <Link href='/shop'>{t('browseAllProducts')}</Link>
          </Button.Root>
        </div>
      </div>
    )
  }

  const topRated = toCardItems(t, data.topRated)
  const newArrivals = toCardItems(t, data.newArrivals)
  const onPromotion = toCardItems(t, data.onPromotion)

  return (
    <div className='min-h-screen bg-bg-weak-50 text-text-strong-950'>
      <CartIconButton variant='fixed' />

      <section className='relative overflow-hidden border-b border-stroke-soft-200 bg-bg-white-0'>
        <div
          aria-hidden
          className='pointer-events-none absolute -left-24 top-0 size-[420px] rounded-full bg-primary-alpha-10 blur-3xl'
        />
        <div
          aria-hidden
          className='pointer-events-none absolute -right-16 bottom-0 size-[360px] rounded-full bg-information-alpha-10 blur-3xl'
        />
        <div className='relative mx-auto flex w-full max-w-screen-2xl flex-col gap-8 px-4 py-14 sm:px-5 lg:flex-row lg:items-end lg:justify-between lg:px-6 lg:py-20'>
          <div className='max-w-2xl space-y-5'>
            <p className='inline-flex items-center gap-2 rounded-full border border-stroke-soft-200 bg-bg-weak-50 px-3 py-1 text-label-xs uppercase tracking-[0.12em] text-primary-base'>
              <Sparkles className='size-3.5' aria-hidden />
              {t('heroEyebrow')}
            </p>
            <h1 className='text-title-h3 text-text-strong-950 sm:text-title-h2'>{t('heroTitle')}</h1>
            <p className='text-paragraph-md text-text-sub-600 sm:text-paragraph-lg'>{t('heroSubtitle')}</p>
            <div className='flex flex-wrap items-center gap-3'>
              <Button.Root asChild variant='primary' size='medium'>
                <Link href='/shop' className='inline-flex items-center gap-2'>
                  {t('heroCta')}
                  <ArrowRight className='size-4' aria-hidden />
                </Link>
              </Button.Root>
              <Button.Root asChild variant='neutral' mode='stroke' size='medium'>
                <Link href='/stores'>{t('storesDirectoryTitle')}</Link>
              </Button.Root>
              <Button.Root asChild variant='neutral' mode='stroke' size='medium'>
                <Link href={merchantSignupHref() as '/signup'}>{t('becomeSeller')}</Link>
              </Button.Root>
            </div>
          </div>
          <div className='grid w-full max-w-md grid-cols-2 gap-3'>
            <Card className='p-4'>
              <p className='text-label-xs uppercase tracking-[0.1em] text-text-sub-600'>
                {t('statProducts')}
              </p>
              <p className='mt-2 text-title-h5 text-text-strong-950'>
                {data.topRated.length + data.newArrivals.length + data.onPromotion.length}
              </p>
            </Card>
            <Card className='p-4'>
              <p className='text-label-xs uppercase tracking-[0.1em] text-text-sub-600'>
                {t('storesDirectoryEyebrow')}
              </p>
              <p className='mt-2 text-title-h5 text-text-strong-950'>{data.risingStores.length}</p>
            </Card>
          </div>
        </div>
      </section>

      {topRated.length ? (
        <section className='mx-auto w-full max-w-screen-2xl px-4 py-12 sm:px-5 lg:px-6'>
          <div className='mb-2 flex justify-end'>
            <Button.Root asChild variant='neutral' mode='lighter' size='small'>
              <Link href='/shop?sort=trending'>{t('viewAll')}</Link>
            </Button.Root>
          </div>
          <ShopProductGridsWithQuickView
            quickViewEnabled
            newArrivals={{
              eyebrow: t('homeTopRatedEyebrow'),
              title: t('homeTopRatedTitle'),
              items: topRated,
            }}
          />
        </section>
      ) : null}

      {newArrivals.length ? (
        <section className='mx-auto w-full max-w-screen-2xl border-t border-stroke-soft-200 px-4 py-12 sm:px-5 lg:px-6'>
          <div className='mb-2 flex justify-end'>
            <Button.Root asChild variant='neutral' mode='lighter' size='small'>
              <Link href='/shop?sort=newest'>{t('viewAll')}</Link>
            </Button.Root>
          </div>
          <ShopProductGridsWithQuickView
            quickViewEnabled
            newArrivals={{
              eyebrow: t('homeNewArrivalsEyebrow'),
              title: t('homeNewArrivalsTitle'),
              items: newArrivals,
            }}
          />
        </section>
      ) : null}

      {data.risingStores.length ? (
        <section className='mx-auto w-full max-w-screen-2xl border-t border-stroke-soft-200 px-4 py-12 sm:px-5 lg:px-6'>
          <div className='mb-6 flex flex-wrap items-end justify-between gap-3'>
            <div>
              <p className='text-label-xs uppercase tracking-[0.12em] text-primary-base'>
                {t('homeRisingStoresEyebrow')}
              </p>
              <h2 className='mt-1 text-title-h5 text-text-strong-950'>{t('homeRisingStoresTitle')}</h2>
            </div>
            <Button.Root asChild variant='neutral' mode='lighter' size='small'>
              <Link href='/stores'>{t('viewAll')}</Link>
            </Button.Root>
          </div>
          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
            {data.risingStores.slice(0, 8).map((entry) => (
              <StoreMiniCard
                key={entry.store.id}
                entry={entry}
                visitLabel={t('topStoresVisitLabel')}
                productCountLabel={t('topStoresProductCount', { count: entry.productCount })}
              />
            ))}
          </div>
        </section>
      ) : null}

      {onPromotion.length ? (
        <section className='mx-auto w-full max-w-screen-2xl border-t border-stroke-soft-200 px-4 py-12 sm:px-5 lg:px-6'>
          <div className='mb-2 flex justify-end'>
            <Button.Root asChild variant='neutral' mode='lighter' size='small'>
              <Link href='/shop'>{t('viewAll')}</Link>
            </Button.Root>
          </div>
          <ShopProductGridsWithQuickView
            quickViewEnabled
            newArrivals={{
              eyebrow: t('homeOnPromotionEyebrow'),
              title: t('homeOnPromotionTitle'),
              items: onPromotion,
            }}
          />
        </section>
      ) : null}

      <section className='border-t border-stroke-soft-200 bg-bg-white-0 px-4 py-12 sm:px-5 lg:px-6'>
        <div className='mx-auto flex w-full max-w-screen-2xl flex-col items-start justify-between gap-4 sm:flex-row sm:items-center'>
          <div>
            <h2 className='text-title-h5 text-text-strong-950'>{t('homeCtaTitle')}</h2>
            <p className='mt-1 text-paragraph-sm text-text-sub-600'>{t('homeCtaSubtitle')}</p>
          </div>
          <div className='flex flex-wrap gap-3'>
            <Button.Root asChild variant='primary'>
              <Link href='/shop'>{t('browseAllProducts')}</Link>
            </Button.Root>
            <Button.Root asChild variant='neutral' mode='stroke'>
              <Link href={merchantSignupHref() as '/signup'}>{t('becomeSeller')}</Link>
            </Button.Root>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
