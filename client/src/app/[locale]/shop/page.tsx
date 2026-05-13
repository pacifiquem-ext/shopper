import { headers } from 'next/headers'
import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import {
  ArrowRight,
  Package,
  Search,
  SlidersHorizontal,
  Sparkles,
  Store as StoreIcon,
  TrendingUp,
} from 'lucide-react'

import { Link } from '@/i18n/navigation'
import { fetchCatalogGroups } from '@/services/catalog.service'
import type { CatalogProductPublic } from '@/services/catalog.service'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CartIconButton } from '@/components/shop/cart-icon-button'
import { ProductCard, type ProductCardLabels } from '@/components/shop/product-card'
import { extractSubdomain, normalizeStoreSubdomain } from '@/lib/host'
import { formatRwf } from '@/lib/product-display'
import { cn } from '@/lib/utils'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'marketplace' })
  const headersList = await headers()
  const subdomain = extractSubdomain(headersList.get('host'))

  if (subdomain) {
    return {
      title: t('storeMetaTitle', { store: subdomain }),
      description: t('storeMetaDescription', { store: subdomain }),
    }
  }

  return {
    title: t('title'),
    description: t('subtitle'),
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
  return {
    storeLabel: t('storeLabel', { name: product.store.displayName }),
    addToCartAria: t('addToCartAria'),
    addedLabel: t('addedToCart'),
    toastAdded: t('addToCartAria'),
    wishlistAria: t('wishlistAria'),
    wishlistSavedToast: t('savedToWishlist'),
    wishlistRemovedToast: t('removedFromWishlist'),
    newBadge: t('newBadge'),
    offBadge: (percent: number) => t('offBadge', { percent }),
    reviewsLabel: (count: number) => t('reviewsCount', { count }),
    ratingAria: (rating: string) => t('ratingValue', { rating }),
    inStockTag: (count: number) => t('inStockTag', { count }),
    lowStockTag: (count: number) => t('lowStockTag', { count }),
    outOfStockTag: t('outOfStockTag'),
    deliveryAvailable: t('deliveryAvailable'),
  }
}

export default async function ShopPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ q?: string; category?: string; sort?: string; store?: string }>
}) {
  await params
  const { q, category, sort, store } = await searchParams
  const t = await getTranslations('marketplace')
  const headersList = await headers()
  const subdomain = extractSubdomain(headersList.get('host')) ?? normalizeStoreSubdomain(store)
  const { data, devHint } = await fetchCatalogGroups({ search: q, subdomain })

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
  const trendingProducts = filterAndSortProducts({ products, sort: 'trending' }).slice(0, 4)
  const newProducts = filterAndSortProducts({ products }).slice(0, 4)
  const hasAny = visibleProducts.length > 0
  const storeContext = subdomain
    ? {
        subdomain,
        displayName: products[0]?.store.displayName ?? subdomain,
      }
    : null

  return (
    <div className='min-h-screen bg-[#F5F1EB] text-[#2B2B2B]'>
      <CartIconButton />
      <section className='relative isolate overflow-hidden border-b border-[rgba(43,43,43,0.08)] bg-[#F5F1EB]'>
        <div aria-hidden className='pointer-events-none absolute -left-32 top-12 size-[420px] rounded-full bg-[#B76E5D]/10 blur-3xl' />
        <div aria-hidden className='pointer-events-none absolute -right-24 bottom-0 size-[460px] rounded-full bg-[#7D8F69]/12 blur-3xl' />

        <div className='mx-auto grid min-h-[560px] max-w-7xl grid-cols-1 items-center gap-10 px-4 py-14 md:grid-cols-[1.05fr_0.95fr] md:py-20'>
          <div className='os-fade-up relative z-10 max-w-3xl'>
            {storeContext ? (
              <span className='mb-5 inline-flex items-center gap-2 rounded-full border border-[#B76E5D]/30 bg-[#B76E5D]/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-[#B76E5D] backdrop-blur-md'>
                <StoreIcon className='size-3.5' aria-hidden strokeWidth={2.25} />
                {t('storeEyebrow')}
              </span>
            ) : (
              <span className='mb-5 inline-flex items-center gap-2 rounded-full border border-[rgba(43,43,43,0.08)] bg-white/60 px-3 py-1.5 text-xs font-medium text-[#2B2B2B] shadow-[0_2px_6px_rgba(43,43,43,0.04)] backdrop-blur-md'>
                <Sparkles className='size-3.5 text-[#7D8F69]' aria-hidden />
                {t('heroEyebrow')}
              </span>
            )}
            <h1 className='max-w-4xl text-5xl font-black tracking-[-0.055em] text-[#2B2B2B] md:text-7xl'>
              {storeContext ? storeContext.displayName : t('heroTitle')}
            </h1>
            <p className='mt-6 max-w-2xl text-base leading-8 text-[#6E6A66] md:text-lg'>
              {storeContext
                ? t('storeHeroSubtitle', { store: storeContext.displayName })
                : t('heroSubtitle')}
            </p>
            <div className='mt-8 flex flex-col gap-3 sm:flex-row'>
              <Button asChild size='lg' className='h-13 rounded-full bg-[#B76E5D] px-8 text-white shadow-[0_12px_32px_rgba(183,110,93,0.28)] transition-transform hover:-translate-y-0.5 hover:bg-[#A66250]'>
                <a href='#products'>
                  {t('heroCta')}
                  <ArrowRight className='size-4' aria-hidden />
                </a>
              </Button>
              <Button asChild size='lg' variant='outline' className='h-13 rounded-full border-[rgba(43,43,43,0.08)] bg-white/60 px-8 text-[#2B2B2B] backdrop-blur-md hover:border-[#B76E5D]/30 hover:bg-white/80 hover:text-[#2B2B2B]'>
                <a href='#trending'>{t('heroSecondaryCta')}</a>
              </Button>
            </div>
            <div className='mt-8 grid max-w-xl grid-cols-3 gap-3 text-sm'>
              <div className='rounded-2xl border border-[rgba(43,43,43,0.08)] bg-white/60 p-4 shadow-[0_1px_2px_rgba(43,43,43,0.03)] backdrop-blur-md'>
                <p className='text-2xl font-bold text-[#2B2B2B]'>{products.length}</p>
                <p className='text-[#6E6A66]'>{t('statProducts')}</p>
              </div>
              <div className='rounded-2xl border border-[rgba(43,43,43,0.08)] bg-white/60 p-4 shadow-[0_1px_2px_rgba(43,43,43,0.03)] backdrop-blur-md'>
                <p className='text-2xl font-bold text-[#2B2B2B]'>{categories.length}</p>
                <p className='text-[#6E6A66]'>{t('statCategories')}</p>
              </div>
              <div className='rounded-2xl border border-[rgba(43,43,43,0.08)] bg-white/60 p-4 shadow-[0_1px_2px_rgba(43,43,43,0.03)] backdrop-blur-md'>
                <p className='text-2xl font-bold text-[#2B2B2B]'>{products.reduce((sum, p) => sum + availableStock(p), 0)}</p>
                <p className='text-[#6E6A66]'>{t('statStock')}</p>
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
                  className={`absolute w-56 overflow-hidden rounded-[2rem] border border-[rgba(43,43,43,0.08)] bg-white/65 p-2 shadow-[0_24px_60px_rgba(43,43,43,0.12)] backdrop-blur-md transition-transform hover:scale-[1.025] hover:border-[#B76E5D]/40 ${positions[index]}`}
                >
                  <div className='aspect-square overflow-hidden rounded-[1.45rem] bg-[#EAE4DC]'>
                    {img ? (
                      <img src={img} alt={product.name} className='size-full object-cover' />
                    ) : (
                      <div className='flex size-full items-center justify-center'>
                        <Package className='size-8 text-[#6E6A66]' aria-hidden />
                      </div>
                    )}
                  </div>
                  <div className='px-2 py-3'>
                    <p className='line-clamp-1 text-sm font-semibold text-[#2B2B2B]'>{product.name}</p>
                    <p className='text-xs text-[#6E6A66]'>{formatRwf(product.priceFrom ?? 0)} RWF</p>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      <main id='products' className='mx-auto max-w-7xl px-4 py-10'>
        <section className='rounded-[2rem] border border-[rgba(43,43,43,0.08)] bg-white/60 p-4 shadow-[0_1px_2px_rgba(43,43,43,0.03)] backdrop-blur-md'>
          <form method='get' className='grid gap-3 lg:grid-cols-[1fr_auto_auto] lg:items-end'>
            <div className='space-y-2'>
              <Label htmlFor='catalog-q' className='flex items-center gap-2 text-[#2B2B2B]'>
                <Search className='size-4 text-[#6E6A66]' aria-hidden />
                {t('searchLabel')}
              </Label>
              <Input id='catalog-q' name='q' type='search' placeholder={t('searchPlaceholder')} defaultValue={q ?? ''} autoComplete='off' className='h-12 rounded-2xl border-[rgba(43,43,43,0.08)] bg-[#EAE4DC]/60 text-[#2B2B2B] placeholder:text-[#6E6A66]' />
              {category ? <input type='hidden' name='category' value={category} /> : null}
            </div>
            <div className='space-y-2'>
              <Label htmlFor='catalog-sort' className='flex items-center gap-2 text-[#2B2B2B]'>
                <SlidersHorizontal className='size-4 text-[#6E6A66]' aria-hidden />
                {t('sortLabel')}
              </Label>
              <select id='catalog-sort' name='sort' defaultValue={sort ?? 'newest'} className='h-12 rounded-2xl border border-[rgba(43,43,43,0.08)] bg-[#EAE4DC]/60 px-4 text-sm text-[#2B2B2B]'>
                <option value='newest'>{t('sortNewest')}</option>
                <option value='trending'>{t('sortTrending')}</option>
                <option value='price-asc'>{t('sortPriceLow')}</option>
                <option value='price-desc'>{t('sortPriceHigh')}</option>
              </select>
            </div>
            <Button type='submit' className='h-12 rounded-2xl bg-[#B76E5D] px-7 text-white shadow-[0_8px_22px_rgba(183,110,93,0.25)] hover:bg-[#A66250]'>
              {t('applyFilters')}
            </Button>
          </form>

          <div className='mt-5 flex gap-2 overflow-x-auto pb-1'>
            <Button
              asChild
              variant={!category ? 'default' : 'outline'}
              className={cn(
                'shrink-0 rounded-full',
                !category
                  ? 'bg-[#B76E5D] text-white shadow-[0_4px_14px_rgba(183,110,93,0.25)] hover:bg-[#A66250]'
                  : 'border-[rgba(43,43,43,0.08)] bg-white/60 text-[#2B2B2B] backdrop-blur-md hover:bg-white/85 hover:text-[#2B2B2B]',
              )}
            >
              <Link href='/shop'>{t('allCategories')}</Link>
            </Button>
            {categories.map((item) => (
              <Button
                key={item.name}
                asChild
                variant={category === item.name ? 'default' : 'outline'}
                className={cn(
                  'shrink-0 rounded-full',
                  category === item.name
                    ? 'bg-[#B76E5D] text-white shadow-[0_4px_14px_rgba(183,110,93,0.25)] hover:bg-[#A66250]'
                    : 'border-[rgba(43,43,43,0.08)] bg-white/60 text-[#2B2B2B] backdrop-blur-md hover:bg-white/85 hover:text-[#2B2B2B]',
                )}
              >
                <Link href={`/shop?category=${encodeURIComponent(item.name)}`}>
                  {item.name} <span className='ml-1 text-[#6E6A66]'>({item.total})</span>
                </Link>
              </Button>
            ))}
          </div>
        </section>

        {trendingProducts.length ? (
          <section id='trending' className='py-12'>
            <div className='mb-5 flex items-end justify-between gap-4'>
              <div>
                <span className='mb-2 inline-flex items-center gap-1.5 rounded-full border border-[rgba(43,43,43,0.08)] bg-white/60 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#2B2B2B] backdrop-blur-md'>
                  <TrendingUp className='size-3.5 text-[#7D8F69]' aria-hidden />
                  {t('trendingEyebrow')}
                </span>
                <h2 className='text-2xl font-bold tracking-tight text-[#2B2B2B]'>{t('trendingTitle')}</h2>
              </div>
              <Button asChild variant='ghost' className='rounded-full text-[#2B2B2B] hover:bg-white/60 hover:text-[#2B2B2B]'>
                <Link href='/shop?sort=trending'>{t('viewAll')}</Link>
              </Button>
            </div>
            <ul className='grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4'>
              {trendingProducts.map((product, index) => (
                <li key={product.id} className='os-fade-up' style={{ animationDelay: `${index * 45}ms` }}>
                  <ProductCard product={product} labels={buildProductCardLabels(t, product)} />
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {newProducts.length ? (
          <section className='pb-12'>
            <div className='mb-5 flex items-end justify-between gap-4'>
              <div>
                <span className='mb-2 inline-flex items-center gap-1.5 rounded-full border border-[rgba(43,43,43,0.08)] bg-white/60 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#2B2B2B] backdrop-blur-md'>
                  <Sparkles className='size-3.5 text-[#7D8F69]' aria-hidden />
                  {t('newArrivalEyebrow')}
                </span>
                <h2 className='text-2xl font-bold tracking-tight text-[#2B2B2B]'>{t('newArrivalTitle')}</h2>
              </div>
            </div>
            <ul className='grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4'>
              {newProducts.map((product, index) => (
                <li key={product.id} className='os-fade-up' style={{ animationDelay: `${index * 45}ms` }}>
                  <ProductCard product={product} labels={buildProductCardLabels(t, product)} />
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section className='pb-14'>
          <div className='mb-5'>
            <h2 className='text-2xl font-bold tracking-tight text-[#2B2B2B]'>{t('allProductsTitle')}</h2>
            <p className='mt-1 text-sm text-[#6E6A66]'>{t('allProductsSubtitle')}</p>
          </div>
          {!hasAny ? (
            <p className='text-center text-[#6E6A66]'>
              {storeContext
                ? t('storeEmpty', { store: storeContext.displayName })
                : t('empty')}
            </p>
          ) : (
            <ul className='grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4'>
              {visibleProducts.map((product, index) => (
                <li key={product.id}>
                  <div className='os-fade-up' style={{ animationDelay: `${Math.min(index * 22, 420)}ms` }}>
                    <ProductCard product={product} labels={buildProductCardLabels(t, product)} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  )
}
