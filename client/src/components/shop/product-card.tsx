import { Package, Truck } from 'lucide-react'

import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/utils'
import {
  discountPercent,
  formatRwf,
  isNewListing,
  pseudoRating,
} from '@/lib/product-display'
import type { CatalogProductPublic } from '@/services/catalog.service'

import { QuickAddButton } from './quick-add-button'
import { StarRating } from './star-rating'
import { WishlistButton } from './wishlist-button'

export interface ProductCardLabels {
  storeLabel: string
  addToCartAria: string
  addedLabel: string
  toastAdded: string
  wishlistAria: string
  wishlistSavedToast: string
  wishlistRemovedToast: string
  newBadge: string
  /** Returns the localized "-{percent}%" badge text. */
  offBadge: (percent: number) => string
  /** Returns localized "{count} ratings" or similar. */
  reviewsLabel: (count: number) => string
  ratingAria: (rating: string) => string
  inStockTag: (count: number) => string
  lowStockTag: (count: number) => string
  outOfStockTag: string
  deliveryAvailable: string
}

function availableStock(product: CatalogProductPublic): number {
  return product.variants.reduce(
    (sum, variant) => sum + (variant.inventory?.available ?? 0),
    0,
  )
}

function primaryVariant(product: CatalogProductPublic) {
  return product.variants[0]
}

interface ProductCardProps {
  product: CatalogProductPublic
  labels: ProductCardLabels
  className?: string
}

export function ProductCard({ product, labels, className }: ProductCardProps) {
  const img = product.primaryImage ?? product.images[0]
  const off = discountPercent(product.priceFrom, product.compareAtFrom)
  const showNew = isNewListing(product.createdAt)
  const stock = availableStock(product)
  const variant = primaryVariant(product)
  const hasPrice = product.priceFrom != null
  const { rating, reviews } = pseudoRating(product.id)

  const stockPill = (() => {
    if (stock <= 0) return { text: labels.outOfStockTag, tone: 'sold' as const }
    if (stock <= 5) return { text: labels.lowStockTag(stock), tone: 'low' as const }
    return { text: labels.inStockTag(stock), tone: 'ok' as const }
  })()

  return (
    <article
      className={cn(
        'group/card relative isolate flex h-full flex-col overflow-hidden rounded-[1.6rem] border border-[rgba(43,43,43,0.08)] bg-white/60 shadow-[0_1px_2px_rgba(43,43,43,0.03),0_8px_24px_rgba(43,43,43,0.05)] backdrop-blur-md transition-all duration-500 ease-out hover:-translate-y-1.5 hover:border-[#B76E5D]/30 hover:shadow-[0_2px_4px_rgba(43,43,43,0.04),0_24px_48px_rgba(43,43,43,0.10)]',
        className,
      )}
    >
      <Link
        href={`/shop/${product.id}`}
        prefetch={false}
        className='relative m-2 block overflow-hidden rounded-[1.25rem] bg-[#EAE4DC]'
      >
        <div className='relative aspect-[4/5] w-full overflow-hidden'>
          {img ? (
            <img
              src={img}
              alt={product.name}
              loading='lazy'
              className='size-full object-cover transition-all duration-[900ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover/card:scale-[1.06]'
            />
          ) : (
            <div className='flex size-full items-center justify-center bg-[#EAE4DC] text-[#6E6A66]'>
              <Package className='size-12' aria-hidden strokeWidth={1.25} />
            </div>
          )}

          <span
            aria-hidden
            className='pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/10 via-black/0 to-transparent'
          />

          <div
            aria-hidden
            className='pointer-events-none absolute inset-x-3 bottom-3 translate-y-3 rounded-2xl border border-[rgba(43,43,43,0.08)] bg-white/75 px-3 py-2 opacity-0 shadow-[0_8px_20px_rgba(43,43,43,0.10)] backdrop-blur-md transition-all duration-500 ease-out group-hover/card:translate-y-0 group-hover/card:opacity-100'
          >
            <div className='flex items-center justify-between gap-3'>
              <div className='min-w-0'>
                <p className='truncate text-[10px] font-medium uppercase tracking-[0.12em] text-[#6E6A66]'>
                  {labels.storeLabel}
                </p>
                <p className='truncate text-xs font-semibold text-[#2B2B2B]'>
                  {product.store.displayName}
                </p>
              </div>
              {product.deliveryEnabled ? (
                <span className='inline-flex items-center gap-1.5 rounded-full border border-[rgba(43,43,43,0.08)] bg-white/70 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#2B2B2B] backdrop-blur'>
                  <Truck className='size-3 text-[#7D8F69]' aria-hidden strokeWidth={2.5} />
                  {labels.deliveryAvailable}
                </span>
              ) : null}
            </div>
          </div>
        </div>

        <div className='pointer-events-none absolute left-3 top-3 flex items-center gap-2'>
          {off != null ? (
            <span className='inline-flex items-center rounded-full bg-[#B76E5D] px-2.5 py-1 text-[11px] font-semibold tracking-tight text-white shadow-[0_4px_12px_rgba(183,110,93,0.32)]'>
              {labels.offBadge(off)}
            </span>
          ) : showNew ? (
            <span className='inline-flex items-center gap-1.5 rounded-full border border-[rgba(43,43,43,0.08)] bg-white/85 px-2.5 py-1 text-[11px] font-semibold tracking-tight text-[#2B2B2B] shadow-[0_4px_12px_rgba(43,43,43,0.08)] backdrop-blur'>
              <span aria-hidden className='size-1.5 rounded-full bg-[#7D8F69]' />
              {labels.newBadge}
            </span>
          ) : null}
        </div>
      </Link>

      <div className='absolute right-5 top-5'>
        <WishlistButton
          label={labels.wishlistAria}
          toastSavedLabel={labels.wishlistSavedToast}
          toastRemovedLabel={labels.wishlistRemovedToast}
          item={{
            productId: product.id,
            name: product.name,
            image: img ?? null,
            price: product.priceFrom,
            storeName: product.store.displayName,
          }}
        />
      </div>

      <div className='flex flex-1 flex-col gap-3 px-5 pb-5 pt-1'>
        <div className='flex items-center justify-between gap-2'>
          <StarRating
            rating={rating}
            reviewsLabel={labels.reviewsLabel(reviews)}
            ariaLabel={labels.ratingAria(rating.toFixed(1))}
            size={13}
          />
          <span
            className={cn(
              'inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em]',
              stockPill.tone === 'sold' &&
                'border-[#B76E5D]/25 bg-[#B76E5D]/12 text-[#B76E5D]',
              stockPill.tone === 'low' &&
                'border-[#7D8F69]/30 bg-[#7D8F69]/12 text-[#5C6E4D]',
              stockPill.tone === 'ok' &&
                'border-[rgba(43,43,43,0.08)] bg-[#EAE4DC]/70 text-[#6E6A66]',
            )}
          >
            {stockPill.text}
          </span>
        </div>

        <div className='space-y-1'>
          <p className='text-[10px] font-semibold uppercase tracking-[0.14em] text-[#6E6A66]'>
            {product.category}
          </p>
          <Link href={`/shop/${product.id}`} prefetch={false} className='block'>
            <h3 className='line-clamp-2 text-[15px] font-semibold leading-tight tracking-tight text-[#2B2B2B] transition-colors duration-300 group-hover/card:text-[#B76E5D]'>
              {product.name}
            </h3>
          </Link>
        </div>

        <div className='mt-auto flex items-end justify-between gap-3 pt-1'>
          <div className='min-w-0'>
            {hasPrice && product.priceFrom != null ? (
              <div className='flex items-baseline gap-2'>
                <p className='text-lg font-bold leading-none tracking-tight tabular-nums text-[#2B2B2B]'>
                  {formatRwf(product.priceFrom)}
                  <span className='ml-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#6E6A66]'>
                    RWF
                  </span>
                </p>
                {product.compareAtFrom && product.compareAtFrom > product.priceFrom ? (
                  <p className='text-xs font-medium tabular-nums text-[#6E6A66] line-through'>
                    {formatRwf(product.compareAtFrom)}
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>

          {variant ? (
            <QuickAddButton
              label={labels.addToCartAria}
              addedLabel={labels.addedLabel}
              toastTitle={labels.toastAdded}
              item={{
                productId: product.id,
                variantId: variant.id,
                storeId: product.store.id,
                storeName: product.store.displayName,
                name: product.name,
                sku: variant.sku,
                title: variant.title,
                price: variant.price,
                image: img ?? null,
              }}
            />
          ) : null}
        </div>
      </div>
    </article>
  )
}
