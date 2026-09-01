import { getTranslations } from 'next-intl/server'
import {
  RiArrowRightLine,
  RiSparklingLine,
  RiStore2Line,
  RiShoppingBag3Line,
} from '@remixicon/react'

import { Link } from '@/i18n/navigation'
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
import { cn } from '@/lib/utils'

function btnClass(
  opts: {
    variant?: 'primary' | 'neutral' | 'error'
    mode?: 'filled' | 'stroke' | 'lighter' | 'ghost'
    size?: 'medium' | 'small' | 'xsmall' | 'xxsmall'
  } = {},
  className?: string,
) {
  const size =
    opts.size === 'small'
      ? 'h-9 gap-3 rounded-lg px-3 text-label-sm'
      : 'h-10 gap-3 rounded-10 px-3.5 text-label-sm'
  const base =
    'group relative inline-flex items-center justify-center whitespace-nowrap outline-none transition duration-200 ease-out'
  if ((opts.variant ?? 'primary') === 'primary' && (opts.mode ?? 'filled') === 'filled') {
    return cn(base, size, 'bg-primary-base text-static-white shadow-regular-xs hover:bg-primary-darker', className)
  }
  if (opts.mode === 'lighter') {
    return cn(
      base,
      size,
      'bg-bg-weak-50 text-text-sub-600 ring-1 ring-inset ring-transparent hover:bg-bg-white-0 hover:text-text-strong-950',
      className,
    )
  }
  if (opts.mode === 'ghost') {
    return cn(base, size, 'text-text-sub-600 hover:bg-bg-weak-50 hover:text-text-strong-950', className)
  }
  return cn(
    base,
    size,
    'bg-bg-white-0 text-text-sub-600 shadow-regular-xs ring-1 ring-inset ring-stroke-soft-200 hover:bg-bg-weak-50 hover:text-text-strong-950',
    className,
  )
}

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
    <Card className="group flex flex-col gap-4 p-4 transition duration-200 hover:-translate-y-0.5 hover:shadow-regular-md motion-reduce:transform-none">
      <div className="flex items-center gap-3">
        <span className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-2xl bg-bg-weak-50 ring-1 ring-stroke-soft-200 transition group-hover:ring-primary-base/30">
          {entry.store.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={entry.store.logoUrl}
              alt={entry.store.displayName}
              className="size-full object-cover"
            />
          ) : (
            <RiStore2Line className="size-5 text-primary-base" aria-hidden />
          )}
        </span>
        <div className="min-w-0">
          <p className="truncate text-label-md text-text-strong-950">{entry.store.displayName}</p>
          <p className="text-paragraph-xs text-text-sub-600">{productCountLabel}</p>
        </div>
      </div>
      <Link
        href={`/stores/${encodeURIComponent(slug)}`}
        className={cn(btnClass({ variant: 'neutral', mode: 'stroke', size: 'small' }), 'w-full')}
      >
        {visitLabel}
      </Link>
    </Card>
  )
}

function SectionHeader({
  eyebrow,
  title,
  href,
  viewAllLabel,
}: {
  eyebrow: string
  title: string
  href: string
  viewAllLabel: string
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <p className="text-label-xs uppercase tracking-[0.14em] text-primary-base">{eyebrow}</p>
        <h2 className="mt-1 text-title-h5 text-text-strong-950">{title}</h2>
      </div>
      <Link href={href} className={btnClass({ variant: 'neutral', mode: 'lighter', size: 'small' })}>
        {viewAllLabel}
        <RiArrowRightLine className="size-4" aria-hidden />
      </Link>
    </div>
  )
}

export async function MarketplaceHome() {
  const t = await getTranslations('marketplace')
  const { data, devHint } = await fetchCatalogHome({ cache: 'no-store' })

  if (!data) {
    return (
      <div className="min-h-screen bg-bg-weak-50">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center">
          <p className="text-error-base">{t('error')}</p>
          {process.env.NODE_ENV === 'development' && devHint ? (
            <pre className="mt-4 overflow-x-auto rounded-10 bg-bg-white-0 p-3 text-left text-xs text-text-sub-600 ring-1 ring-stroke-soft-200">
              {devHint}
            </pre>
          ) : null}
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/shop" className={btnClass({ variant: 'primary' })}>
              {t('browseAllProducts')}
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const pickedForYou = toCardItems(t, data.pickedForYou ?? [])
  const topRated = toCardItems(t, data.topRated)
  const newArrivals = toCardItems(t, data.newArrivals)
  const onPromotion = toCardItems(t, data.onPromotion)
  const productSurface =
    data.topRated.length + data.newArrivals.length + data.onPromotion.length

  return (
    <div className="min-h-screen bg-bg-weak-50 text-text-strong-950">
      <CartIconButton variant="fixed" />

      <header className="sticky top-0 z-30 border-b border-stroke-soft-200/80 bg-bg-white-0/85 backdrop-blur-md">
        <div className="mx-auto flex h-14 w-full max-w-screen-2xl items-center justify-between gap-4 px-4 sm:px-5 lg:px-6">
          <Link href="/" className="flex min-w-0 items-center gap-2">
            <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary-base text-static-white">
              <RiShoppingBag3Line className="size-4" aria-hidden />
            </span>
            <span className="truncate text-label-md text-text-strong-950">
              {t('brandTitle')}
              <span className="text-primary-base">{t('brandSuffix')}</span>
            </span>
          </Link>
          <nav className="flex min-w-0 flex-1 items-center justify-end gap-1 sm:justify-center" aria-label={t('title')}>
            <Link
              href="/shop"
              className={cn(btnClass({ mode: 'ghost', size: 'small' }), 'max-sm:px-2')}
            >
              <span className="sm:hidden">{t('title')}</span>
              <span className="hidden sm:inline">{t('browseAllProducts')}</span>
            </Link>
            <Link
              href="/stores"
              className={cn(btnClass({ mode: 'ghost', size: 'small' }), 'max-sm:px-2')}
            >
              <span className="sm:hidden">{t('storesDirectoryEyebrow')}</span>
              <span className="hidden sm:inline">{t('storesDirectoryTitle')}</span>
            </Link>
          </nav>
          <div className="flex shrink-0 items-center gap-2">
            <Link
              href="/login"
              className={btnClass({ variant: 'neutral', mode: 'stroke', size: 'small' })}
            >
              {t('login')}
            </Link>
            <Link
              href={merchantSignupHref() as '/signup'}
              className={cn(btnClass({ variant: 'primary', size: 'small' }), 'max-sm:hidden')}
            >
              {t('becomeSeller')}
            </Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-stroke-soft-200 bg-bg-white-0">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, var(--color-stroke-soft-200) 1px, transparent 0)',
            backgroundSize: '24px 24px',
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-24 top-0 size-[420px] rounded-full bg-primary-alpha-10 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 bottom-0 size-[360px] rounded-full bg-information-alpha-10 blur-3xl"
        />
        <div className="relative mx-auto flex w-full max-w-screen-2xl flex-col gap-10 px-4 py-14 sm:px-5 lg:flex-row lg:items-end lg:justify-between lg:px-6 lg:py-20">
          <div className="max-w-2xl space-y-5">
            <p className="inline-flex items-center gap-2 rounded-full border border-stroke-soft-200 bg-bg-weak-50 px-3 py-1 text-label-xs uppercase tracking-[0.12em] text-primary-base">
              <RiSparklingLine className="size-3.5" aria-hidden />
              {t('heroEyebrow')}
            </p>
            <h1 className="text-balance text-title-h3 text-text-strong-950 sm:text-title-h2">
              {t('heroTitle')}
            </h1>
            <p className="max-w-xl text-pretty text-paragraph-md text-text-sub-600 sm:text-paragraph-lg">
              {t('heroSubtitle')}
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/shop"
                className={cn(btnClass({ variant: 'primary', size: 'medium' }), 'inline-flex items-center gap-2')}
              >
                {t('heroCta')}
                <RiArrowRightLine className="size-4" aria-hidden />
              </Link>
              <Link href="/stores" className={btnClass({ variant: 'neutral', mode: 'stroke', size: 'medium' })}>
                {t('storesDirectoryTitle')}
              </Link>
              <Link
                href={merchantSignupHref() as '/signup'}
                className={btnClass({ variant: 'neutral', mode: 'lighter', size: 'medium' })}
              >
                {t('becomeSeller')}
              </Link>
            </div>
          </div>
          <div className="grid w-full max-w-md grid-cols-2 gap-3">
            <Card className="relative overflow-hidden p-5">
              <div
                aria-hidden
                className="absolute -right-4 -top-4 size-16 rounded-full bg-primary-alpha-10"
              />
              <p className="text-label-xs uppercase tracking-[0.1em] text-text-sub-600">
                {t('statProducts')}
              </p>
              <p className="mt-2 text-title-h5 text-text-strong-950">{productSurface}</p>
            </Card>
            <Card className="relative overflow-hidden p-5">
              <div
                aria-hidden
                className="absolute -right-4 -top-4 size-16 rounded-full bg-information-alpha-10"
              />
              <p className="text-label-xs uppercase tracking-[0.1em] text-text-sub-600">
                {t('storesDirectoryEyebrow')}
              </p>
              <p className="mt-2 text-title-h5 text-text-strong-950">{data.risingStores.length}</p>
            </Card>
          </div>
        </div>
      </section>

      {pickedForYou.length ? (
        <section className="mx-auto w-full max-w-screen-2xl px-4 py-12 sm:px-5 lg:px-6">
          <SectionHeader
            eyebrow={t('homePickedForYouEyebrow')}
            title={t('homePickedForYouTitle')}
            href="/shop?sort=for-you"
            viewAllLabel={t('viewAll')}
          />
          <ShopProductGridsWithQuickView
            quickViewEnabled
            newArrivals={{
              eyebrow: t('homePickedForYouEyebrow'),
              title: t('homePickedForYouTitle'),
              items: pickedForYou,
              hideHeader: true,
            }}
          />
        </section>
      ) : null}

      {topRated.length ? (
        <section className="mx-auto w-full max-w-screen-2xl px-4 py-12 sm:px-5 lg:px-6">
          <SectionHeader
            eyebrow={t('homeTopRatedEyebrow')}
            title={t('homeTopRatedTitle')}
            href="/shop?sort=trending"
            viewAllLabel={t('viewAll')}
          />
          <ShopProductGridsWithQuickView
            quickViewEnabled
            newArrivals={{
              eyebrow: t('homeTopRatedEyebrow'),
              title: t('homeTopRatedTitle'),
              items: topRated,
              hideHeader: true,
            }}
          />
        </section>
      ) : null}

      {newArrivals.length ? (
        <section className="mx-auto w-full max-w-screen-2xl border-t border-stroke-soft-200 px-4 py-12 sm:px-5 lg:px-6">
          <SectionHeader
            eyebrow={t('homeNewArrivalsEyebrow')}
            title={t('homeNewArrivalsTitle')}
            href="/shop?sort=newest"
            viewAllLabel={t('viewAll')}
          />
          <ShopProductGridsWithQuickView
            quickViewEnabled
            newArrivals={{
              eyebrow: t('homeNewArrivalsEyebrow'),
              title: t('homeNewArrivalsTitle'),
              items: newArrivals,
              hideHeader: true,
            }}
          />
        </section>
      ) : null}

      {data.risingStores.length ? (
        <section className="mx-auto w-full max-w-screen-2xl border-t border-stroke-soft-200 px-4 py-12 sm:px-5 lg:px-6">
          <SectionHeader
            eyebrow={t('homeRisingStoresEyebrow')}
            title={t('homeRisingStoresTitle')}
            href="/stores"
            viewAllLabel={t('viewAll')}
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
        <section className="mx-auto w-full max-w-screen-2xl border-t border-stroke-soft-200 px-4 py-12 sm:px-5 lg:px-6">
          <SectionHeader
            eyebrow={t('homeOnPromotionEyebrow')}
            title={t('homeOnPromotionTitle')}
            href="/shop"
            viewAllLabel={t('viewAll')}
          />
          <ShopProductGridsWithQuickView
            quickViewEnabled
            newArrivals={{
              eyebrow: t('homeOnPromotionEyebrow'),
              title: t('homeOnPromotionTitle'),
              items: onPromotion,
              hideHeader: true,
            }}
          />
        </section>
      ) : null}

      <section className="border-t border-stroke-soft-200 bg-bg-white-0 px-4 py-14 sm:px-5 lg:px-6">
        <div className="mx-auto flex w-full max-w-screen-2xl flex-col items-start justify-between gap-6 rounded-20 border border-stroke-soft-200 bg-gradient-to-br from-primary-alpha-10 via-bg-white-0 to-bg-weak-50 p-6 sm:flex-row sm:items-center sm:p-8">
          <div className="max-w-xl">
            <h2 className="text-title-h5 text-text-strong-950">{t('homeCtaTitle')}</h2>
            <p className="mt-1 text-paragraph-sm text-text-sub-600">{t('homeCtaSubtitle')}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/shop" className={btnClass({ variant: 'primary' })}>
              {t('browseAllProducts')}
            </Link>
            <Link
              href={merchantSignupHref() as '/signup'}
              className={btnClass({ variant: 'neutral', mode: 'stroke' })}
            >
              {t('becomeSeller')}
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
