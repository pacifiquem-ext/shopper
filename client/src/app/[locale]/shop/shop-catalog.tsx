import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import { ArrowRight, LogIn, Package, Sparkles, Store as StoreIcon } from 'lucide-react'

import { Link } from '@/i18n/navigation'
import { fetchCatalogGroups } from '@/services/catalog.service'
import type { CatalogProductPublic } from '@/services/catalog.service'
import { Button } from '@/components/ui/button'
import { BecomeSellerShopButton } from '@/components/shop/become-seller-shop-button'
import { ShopCatalogFilters } from '@/components/shop/shop-catalog-filters'
import { CartIconButton } from '@/components/shop/cart-icon-button'
import { SiteFooter } from '@/components/shop/site-footer'
import type { ProductCardLabels } from '@/components/shop/product-card'
import { ShopProductGridsWithQuickView } from '@/components/shop/shop-product-grids-with-quick-view'
import { buildCatalogQueryString, catalogFiltersActive } from '@/lib/catalog-query'
import { normalizeStoreSubdomain } from '@/lib/host'
import { marketplaceShopAbsoluteUrl } from '@/lib/marketplace-url'
import { discountPercent, formatRwf, pseudoRating } from '@/lib/product-display'
import { merchantSignupHref } from '@/lib/auth-return-url'
import { buildSiteFooterStoreContext } from '@/lib/store-footer-context'
import { cn } from '@/lib/utils'
import { IshushoCraftsStorefront } from '@/components/store-templates/ishusho-crafts/ishusho-crafts-storefront'
import { VibrantMarketStorefront } from '@/components/store-templates/vibrant-market/vibrant-market-storefront'
import { ClassicMarketStorefront } from '@/components/store-templates/classic-market/classic-market-storefront'
import {
  isIshushoCraftsTemplate,
  isVibrantMarketTemplate,
  resolveStoreTemplate,
} from '@/lib/store-templates'
import { hasCatalogSectionItems, hasTopStoresSectionItems } from '@/lib/catalog-grid'
import { buildTopStoresFromProducts, withTopStoreProductCountLabels } from '@/lib/catalog-stores'
import { storeCartPath } from '@/lib/store-navigation'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'marketplace' })

  return {
    title: `${t('brandTitle')}${t('brandSuffix')}`,
    description: t('compactMetaDescription'),
  }
}

function availableStock(product: CatalogProductPublic): number {
  return product.variants.reduce((sum, variant) => sum + (variant.inventory?.available ?? 0), 0)
}

function filterAndSortProducts({
  products,
  category,
  sort,
}: {
  products: CatalogProductPublic[]
  category?: string
  sort?: string
}) {
  const filtered = category
    ? products.filter((product) => product.category.toLowerCase() === category.toLowerCase())
    : products

  return [...filtered].sort((a, b) => {
    if (sort === 'price-asc') return (a.priceFrom ?? 0) - (b.priceFrom ?? 0)
    if (sort === 'price-desc') return (b.priceFrom ?? 0) - (a.priceFrom ?? 0)
    if (sort === 'trending') return availableStock(b) - availableStock(a)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })
}

function buildProductCardLabels(
  t: Awaited<ReturnType<typeof getTranslations<'marketplace'>>>,
  product: CatalogProductPublic,
): ProductCardLabels {
  const stock = availableStock(product)
  const off = discountPercent(product.priceFrom, product.compareAtFrom)
  const { rating } = pseudoRating(product.id)

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
    ratingAriaLabel: t('ratingValue', { rating: rating.toFixed(1) }),
    stockTagText,
    deliveryAvailable: t('deliveryAvailable'),
  }
}

export async function ShopPage({
  params,
  searchParams,
  compactHero = false,
  catalogBasePath = '/shop',
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ q?: string; category?: string; sort?: string; store?: string }>
  compactHero?: boolean
  catalogBasePath?: string
}) {
  const { locale } = await params
  const { q, category, sort, store } = await searchParams
  const t = await getTranslations('marketplace')
  const subdomain = normalizeStoreSubdomain(store)
  const { data, devHint } = await fetchCatalogGroups({
    search: q,
    subdomain,
    cache: 'no-store',
  })

  if (!data) {
    return (
      <div className='mx-auto max-w-3xl px-4 py-16'>
        <p className='text-destructive text-center'>{t('error')}</p>
        {process.env.NODE_ENV === 'development' && devHint ? (
          <pre className='bg-muted text-muted-foreground mt-4 overflow-x-auto rounded-md p-3 text-left text-xs break-words whitespace-pre-wrap'>
            {devHint}
          </pre>
        ) : null}
        <p className='text-muted-foreground mt-4 text-center text-sm'>{t('errorConfigHint')}</p>
        <div className='mt-6 flex justify-center'>
          <Button asChild variant='outline'>
            <Link href='/'>{t('homeLink')}</Link>
          </Button>
        </div>
      </div>
    )
  }

  const { groups } = data
  const products = groups.flatMap((g) => g.products)
  const categories = groups
    .filter((group) => group.total > 0)
    .map((group) => ({ name: group.category, total: group.total }))
  const visibleProducts = filterAndSortProducts({ products, category, sort })
  const filtersActive = catalogFiltersActive({ q, category, sort })
  const newProducts = filtersActive
    ? []
    : filterAndSortProducts({ products, category }).slice(0, 4)
  const catalogStore = data.store ?? null

  // Invalid / unknown store slug — do not fake a storefront from the query param alone.
  if (subdomain && !catalogStore) {
    return (
      <div className='mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center gap-4 px-4 py-20 text-center'>
        <p className='text-label-sm uppercase tracking-wide text-text-soft-400'>
          {t('storeNotFoundEyebrow')}
        </p>
        <h1 className='text-title-h5 text-text-strong-950'>{t('storeNotFoundTitle')}</h1>
        <p className='text-paragraph-sm text-text-sub-600'>
          {t('storeNotFoundBody', { store: subdomain })}
        </p>
        <Button asChild variant='outline' className='mt-2 rounded-full'>
          <Link href='/'>{t('homeLink')}</Link>
        </Button>
      </div>
    )
  }

  const storeContext = subdomain && catalogStore
    ? {
        subdomain: catalogStore.subdomain || subdomain,
        displayName: catalogStore.displayName,
      }
    : null

  const storeFooter =
    storeContext != null && catalogStore
      ? buildSiteFooterStoreContext({
          store: catalogStore,
          isSubdomainHost: false,
          marketplaceShopAbsoluteHref: null,
          listingSearch: `store=${encodeURIComponent(storeContext.subdomain)}`,
        })
      : undefined

  const toCells = (list: CatalogProductPublic[]) =>
    list.map((p) => ({ product: p, labels: buildProductCardLabels(t, p) }))

  const persistStore = store?.trim() ? normalizeStoreSubdomain(store) ?? store.trim() : undefined
  const catalogFilters = { q, category, sort, store: persistStore }

  const buildShopHref = (
    overrides: Partial<Record<'q' | 'category' | 'sort' | 'store', string | null | undefined>> = {},
  ) => {
    const qs = buildCatalogQueryString(catalogFilters, overrides)
    if (!qs) return catalogBasePath
    return `${catalogBasePath}?${qs}`
  }

  const shopPageGutter = 'mx-auto w-full max-w-screen-2xl px-3 sm:px-4 lg:px-5'

  const filterLabels = {
    searchLabel: t('searchLabel'),
    searchPlaceholder: t('searchPlaceholder'),
    sortLabel: t('sortLabel'),
    sortNewest: t('sortNewest'),
    sortTrending: t('sortTrending'),
    sortPriceLow: t('sortPriceLow'),
    sortPriceHigh: t('sortPriceHigh'),
    applyFilters: t('applyFilters'),
    allCategories: t('allCategories'),
  }

  if (
    storeContext &&
    catalogStore &&
    isIshushoCraftsTemplate(resolveStoreTemplate(catalogStore))
  ) {
    const tIc = await getTranslations('storeTemplates.ishushoCrafts')
    return (
      <IshushoCraftsStorefront
        store={catalogStore}
        categories={categories}
        filters={catalogFilters}
        filterLabels={filterLabels}
        marketplaceHref={null}
        catalogSections={{
          allProducts: {
            title: tIc('productsTitle'),
            emptyMessage: t('storeEmpty', { store: catalogStore.displayName }),
            items: toCells(visibleProducts),
          },
        }}
        texts={{
          heroFallback: tIc('heroFallback', { store: catalogStore.displayName }),
          heroStorefrontLabel: tIc('heroStorefrontLabel'),
          heroBrowse: tIc('heroBrowse'),
          ctaShop: tIc('ctaShop'),
          searchAria: tIc('searchAria'),
          navShopLabel: tIc('navShopLabel'),
          addToCart: tIc('addToCart'),
          productsTitle: tIc('productsTitle'),
          productsSubtitle: tIc('productsSubtitle'),
          chipFilterAria: tIc('chipFilterAria'),
          chipAll: t('allCategories'),
          itemsCountLabel: tIc('itemsAvailable', { count: visibleProducts.length }),
          promoMessages: [tIc('promo1'), tIc('promo2')],
          tickerAria: tIc('tickerAria'),
          footerTagline: tIc('footerTagline', { store: catalogStore.displayName }),
          poweredBy: tIc('poweredBy'),
          marketplaceLabel: tIc('marketplaceLabel'),
          contactLabel: tIc('contactLabel'),
        }}
      />
    )
  }

  if (
    storeContext &&
    catalogStore &&
    isVibrantMarketTemplate(resolveStoreTemplate(catalogStore))
  ) {
    const tVm = await getTranslations('storeTemplates.vibrantMarket')
    const vmFiltersActive = catalogFiltersActive(catalogFilters)
    const vmTopStores =
      !vmFiltersActive && !storeContext
        ? withTopStoreProductCountLabels(
            data.stores?.length
              ? data.stores.map((entry) => ({
                  store: entry.store,
                  productCount: entry.productCount,
                }))
              : buildTopStoresFromProducts(products),
            (count) => t('topStoresProductCount', { count }),
          )
        : []

    const storeCartHref = storeCartPath(catalogStore.subdomain, false)
    return (
      <VibrantMarketStorefront
        store={catalogStore}
        items={toCells(visibleProducts)}
        categories={categories}
        filters={catalogFilters}
        filterLabels={filterLabels}
        marketplaceHref={null}
        cartHref={storeCartHref}
        catalogSections={{
          newArrivals:
            vmFiltersActive || !hasCatalogSectionItems(newProducts.length)
              ? undefined
              : {
                  title: t('newArrivalTitle'),
                  eyebrow: t('newArrivalEyebrow'),
                  items: toCells(newProducts),
                },
          topStores: hasTopStoresSectionItems(vmTopStores.length)
            ? {
                eyebrow: t('topStoresEyebrow'),
                title: t('topStoresTitle'),
                visitStoreLabel: t('topStoresVisitLabel'),
                stores: vmTopStores,
              }
            : undefined,
          allProducts: {
            title: tVm('productsTitle'),
            subtitle: t('allProductsSubtitle'),
            emptyMessage: t('storeEmpty', { store: catalogStore.displayName }),
            items: toCells(visibleProducts),
          },
        }}
        texts={{
          eyebrow: tVm('eyebrow'),
          promoMessages: [tVm('promo2'), tVm('promo3')],
          productsTitle: tVm('productsTitle'),
          categoriesLabel: tVm('categoriesLabel'),
          emptyMessage: t('storeEmpty', { store: catalogStore.displayName }),
          searchAria: tVm('searchAria'),
          defaultTagline: tVm('defaultTagline'),
          ctaStartShopping: tVm('ctaStartShopping'),
          ctaTrendingNow: tVm('ctaTrendingNow'),
          tickerAria: tVm('tickerAria'),
          flashSaleBadge: tVm('flashSaleBadge'),
          addToCart: tVm('addToCart'),
          footerTagline: tVm('footerTagline'),
          poweredBy: tVm('poweredBy'),
          marketplaceLabel: tVm('marketplaceLabel'),
        }}
      />
    )
  }

  if (storeContext && catalogStore) {
    const template = resolveStoreTemplate(catalogStore)
    if (!isIshushoCraftsTemplate(template) && !isVibrantMarketTemplate(template)) {
      const tKc = await getTranslations('storeTemplates.classicMarket')
      const storeCartHref = storeCartPath(catalogStore.subdomain, false)
      return (
        <ClassicMarketStorefront
          store={catalogStore}
          categories={categories}
          filters={catalogFilters}
          filterLabels={filterLabels}
          marketplaceHref={null}
          cartHref={storeCartHref}
          isSubdomainHost={false}
          catalogSections={{
            allProducts: {
              title: tKc('productsTitle'),
              emptyMessage: t('storeEmpty', { store: catalogStore.displayName }),
              items: toCells(visibleProducts),
            },
          }}
          texts={{
            eyebrow: tKc('eyebrow'),
            defaultTagline: tKc('defaultTagline'),
            ctaShop: tKc('ctaShop'),
            ctaBrowse: tKc('ctaBrowse'),
            searchAria: tKc('searchAria'),
            addToCart: tKc('addToCart'),
            productsTitle: tKc('productsTitle'),
            footerTagline: tKc('footerTagline', { store: catalogStore.displayName }),
            poweredBy: tKc('poweredBy'),
            marketplaceLabel: tKc('marketplaceLabel'),
          }}
        />
      )
    }
  }

  return (
    <div className='min-h-screen bg-bg-weak-50 text-text-strong-950'>
      {!(compactHero && !storeContext) ? <CartIconButton variant='fixed' /> : null}
      {!storeContext && !compactHero ? <BecomeSellerShopButton label={t('becomeSeller')} /> : null}
      {compactHero && !storeContext ? (
        <header className='relative'>
          <div
            className={cn(
              shopPageGutter,
              'flex flex-col gap-3 pt-4 pb-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-x-4 sm:gap-y-2 sm:pt-5 sm:pb-4',
            )}
          >
            <div className='min-w-0 flex-1'>
              <p className='mb-0.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-primary-base sm:text-[11px]'>
                <Sparkles className='size-3 shrink-0' aria-hidden />
                <span className='truncate'>{t('heroEyebrow')}</span>
              </p>
              <h1 className='text-xl font-black tracking-[-0.04em] text-text-strong-950 sm:text-2xl md:text-3xl'>
                {t('brandTitle')}
                <span className='text-primary-base'>{t('brandSuffix')}</span>
              </h1>
            </div>
            <div className='flex w-full shrink-0 items-center justify-end gap-1.5 sm:w-auto sm:gap-2'>
              <Link
                href='/login'
                prefetch={false}
                aria-label={t('login')}
                className='group inline-flex h-9 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-full border border-stroke-soft-200 bg-bg-white-0 px-3 text-xs font-semibold leading-none text-text-strong-950 shadow-regular-xs transition-colors hover:border-primary-base/45 hover:bg-bg-weak-50 hover:text-text-strong-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-base/40 sm:h-10 sm:px-4 sm:text-sm'
              >
                <LogIn
                  className='size-3.5 shrink-0 text-text-strong-950 transition-colors group-hover:text-text-strong-950 sm:size-4'
                  aria-hidden
                  strokeWidth={2.25}
                />
                <span className='hidden sm:inline'>{t('login')}</span>
              </Link>
              <Link
                href={merchantSignupHref() as '/signup'}
                prefetch={false}
                aria-label={t('becomeSeller')}
                className='group inline-flex h-9 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-full bg-primary-base px-3 text-xs font-semibold leading-none text-static-white shadow-regular-xs transition-colors hover:bg-primary-darker hover:text-static-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-base/50 sm:h-10 sm:px-4 sm:text-sm'
              >
                <StoreIcon
                  className='size-3.5 shrink-0 text-white transition-colors group-hover:text-white sm:size-4'
                  aria-hidden
                  strokeWidth={2.25}
                />
                <span className='hidden lg:inline'>{t('becomeSeller')}</span>
              </Link>
              <CartIconButton variant='inline' />
            </div>
          </div>
        </header>
      ) : null}

      {!(compactHero && !storeContext) ? (
      <section className='relative isolate overflow-hidden border-b border-stroke-soft-200 bg-bg-weak-50'>
        <div aria-hidden className='pointer-events-none absolute -left-32 top-12 size-[420px] rounded-full bg-primary-base/10 blur-3xl' />
        <div aria-hidden className='pointer-events-none absolute -right-24 bottom-0 size-[460px] rounded-full bg-primary-alpha-10 blur-3xl' />

        <div
          className={cn(
            shopPageGutter,
            'grid min-h-[560px] grid-cols-1 items-center gap-10 py-14 md:grid-cols-[1.05fr_0.95fr] md:py-20',
          )}
        >
          <div className='os-fade-up relative z-10 max-w-3xl'>
            {storeContext ? (
              <span className='mb-5 inline-flex items-center gap-2 rounded-full border border-[#1daf61]/30 bg-primary-base/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-primary-base backdrop-blur-md'>
                <StoreIcon className='size-3.5' aria-hidden strokeWidth={2.25} />
                {t('storeEyebrow')}
              </span>
            ) : (
              <span className='mb-5 inline-flex items-center gap-2 rounded-full border border-stroke-soft-200 bg-white/60 px-3 py-1.5 text-xs font-medium text-text-strong-950 shadow-regular-xs backdrop-blur-md'>
                <Sparkles className='size-3.5 text-primary-base' aria-hidden />
                {t('heroEyebrow')}
              </span>
            )}
            <h1 className='max-w-4xl text-5xl font-black tracking-[-0.055em] text-text-strong-950 md:text-7xl'>
              {storeContext ? storeContext.displayName : t('heroTitle')}
            </h1>
            <p className='mt-6 max-w-2xl text-base leading-8 text-[#5c5c5c] md:text-lg'>
              {storeContext
                ? t('storeHeroSubtitle', { store: storeContext.displayName })
                : t('heroSubtitle')}
            </p>
            <div className='mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap'>
              <Button asChild size='lg' className='h-13 rounded-full bg-primary-base px-8 text-static-white shadow-regular-xs transition-transform hover:-translate-y-0.5 hover:bg-primary-darker'>
                <a href='#products'>
                  {t('heroCta')}
                  <ArrowRight className='size-4' aria-hidden />
                </a>
              </Button>
              <Button asChild size='lg' variant='outline' className='h-13 rounded-full border-stroke-soft-200 bg-bg-white-0 px-8 text-text-strong-950 shadow-regular-xs hover:border-primary-base/25 hover:bg-bg-weak-50 hover:text-text-strong-950'>
                <a href='#new-arrivals'>{t('heroSecondaryCta')}</a>
              </Button>
              {!storeContext ? (
                <Button asChild size='lg' variant='outline' className='h-13 rounded-full border-stroke-soft-200 bg-bg-white-0 px-8 text-primary-base shadow-regular-xs hover:border-primary-base/35 hover:bg-primary-alpha-10'>
                  <Link href={merchantSignupHref() as '/signup'} prefetch={false}>
                    {t('becomeSeller')}
                  </Link>
                </Button>
              ) : null}
            </div>
            <div className='mt-8 grid max-w-xl grid-cols-3 gap-3 text-sm'>
              <div className='rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-4 shadow-regular-xs'>
                <p className='text-2xl font-bold text-text-strong-950'>{products.length}</p>
                <p className='text-text-sub-600'>{t('statProducts')}</p>
              </div>
              <div className='rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-4 shadow-regular-xs'>
                <p className='text-2xl font-bold text-text-strong-950'>{categories.length}</p>
                <p className='text-text-sub-600'>{t('statCategories')}</p>
              </div>
              <div className='rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-4 shadow-regular-xs'>
                <p className='text-2xl font-bold text-text-strong-950'>{products.reduce((sum, p) => sum + availableStock(p), 0)}</p>
                <p className='text-text-sub-600'>{t('statStock')}</p>
              </div>
            </div>
          </div>

          <div className='os-soft-pop relative z-10 hidden min-h-[520px] md:block'>
            {newProducts.slice(0, 3).map((product, index) => {
              const img = product.primaryImage ?? product.images[0]
              const positions = [
                'left-10 top-6 rotate-[-7deg]',
                'right-6 top-36 rotate-[6deg]',
                'left-24 bottom-8 rotate-[3deg]',
              ]
              return (
                <Link
                  href={`/shop/${product.id}`}
                  key={product.id}
                  className={`absolute w-56 overflow-hidden rounded-20 border border-stroke-soft-200 bg-bg-white-0 p-2 shadow-regular-md transition-transform hover:scale-[1.02] hover:border-primary-base/30 ${positions[index]}`}
                >
                  <div className='aspect-square overflow-hidden rounded-[1.25rem] bg-bg-soft-200'>
                    {img ? (
                      <img src={img} alt={product.name} className='size-full object-cover' />
                    ) : (
                      <div className='flex size-full items-center justify-center'>
                        <Package className='size-8 text-text-soft-400' aria-hidden />
                      </div>
                    )}
                  </div>
                  <div className='px-2 py-3'>
                    <p className='line-clamp-1 text-sm font-semibold text-text-strong-950'>{product.name}</p>
                    <p className='text-xs text-text-sub-600'>{formatRwf(product.priceFrom ?? 0)} RWF</p>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>
      ) : null}

      <main
        id='products'
        className={cn(
          shopPageGutter,
          compactHero && !storeContext ? 'pt-3 pb-6 sm:pt-6' : 'py-8 sm:py-10',
        )}
      >
        <ShopCatalogFilters
          key={[q ?? '', category ?? '', sort ?? '', persistStore ?? ''].join('|')}
          filters={catalogFilters}
          categories={categories}
          labels={filterLabels}
          resetPath='/'
          compactSearch={compactHero && !storeContext}
        />

        <ShopProductGridsWithQuickView
          quickViewEnabled
          showFullPageLink={!storeContext}
          accentColor='#1daf61'
          newArrivals={
            hasCatalogSectionItems(newProducts.length)
              ? {
                  title: t('newArrivalTitle'),
                  eyebrow: t('newArrivalEyebrow'),
                  items: toCells(newProducts),
                }
              : undefined
          }
          topStores={(() => {
            if (storeContext || filtersActive) return undefined
            const stores = withTopStoreProductCountLabels(
              data.stores?.length
                ? data.stores.map((entry) => ({
                    store: entry.store,
                    productCount: entry.productCount,
                  }))
                : buildTopStoresFromProducts(products),
              (count) => t('topStoresProductCount', { count }),
            )
            if (!hasTopStoresSectionItems(stores.length)) return undefined
            return {
              eyebrow: t('topStoresEyebrow'),
              title: t('topStoresTitle'),
              visitStoreLabel: t('topStoresVisitLabel'),
              stores,
            }
          })()}
          allProducts={{
            title: t('allProductsTitle'),
            subtitle: t('allProductsSubtitle'),
            emptyMessage: storeContext
              ? t('storeEmpty', { store: storeContext.displayName })
              : t('empty'),
            items: toCells(visibleProducts),
          }}
        />
      </main>

      <SiteFooter store={storeFooter} />
    </div>
  )
}
