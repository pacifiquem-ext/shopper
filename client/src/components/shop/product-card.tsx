import { Package, ShoppingBag, Truck } from 'lucide-react'

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
  discountBadge: string | null
  ratingAriaLabel: string
  stockTagText: string
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

function firstInStockVariant(product: CatalogProductPublic) {
  return product.variants.find((variant) => (variant.inventory?.available ?? 0) > 0)
}

interface ProductCardProps {
  product: CatalogProductPublic
  labels: ProductCardLabels
  className?: string
  ratingColor?: string
  onOpenQuickView?: (product: CatalogProductPublic, labels: ProductCardLabels) => void
}

function ProductCardMedia({
  product,
  labels,
  img,
  off,
  showNew,
  accentColor,
}: {
  product: CatalogProductPublic
  labels: ProductCardLabels
  img: string | undefined
  off: number | null
  showNew: boolean
  accentColor: string
}) {
  return (
    <>
      <div className='relative aspect-[4/5] w-full overflow-hidden bg-[#EAE4DC]'>
        {img ? (
          <img
            src={img}
            alt={product.name}
            loading='lazy'
            className='size-full object-cover transition-transform duration-500 group-hover/card:scale-[1.04]'
          />
        ) : (
          <div className='flex size-full items-center justify-center text-[#6E6A66]'>
            <Package className='size-12' aria-hidden strokeWidth={1.25} />
          </div>
        )}

        <div className='pointer-events-none absolute left-3 top-3 flex items-center gap-2'>
          {off != null && labels.discountBadge ? (
            <span
              className='inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-tight text-white shadow-[0_4px_12px_rgba(43,43,43,0.18)]'
              style={{ backgroundColor: accentColor }}
            >
              {labels.discountBadge}
            </span>
          ) : showNew ? (
            <span className='inline-flex items-center gap-1.5 rounded-full border border-[rgba(43,43,43,0.08)] bg-white/90 px-2.5 py-1 text-[11px] font-semibold tracking-tight text-[#2B2B2B] shadow-sm'>
              <span aria-hidden className='size-1.5 rounded-full' style={{ backgroundColor: accentColor }} />
              {labels.newBadge}
            </span>
          ) : null}
        </div>
      </div>

      <div className='flex items-center justify-between gap-2 border-t border-[rgba(43,43,43,0.06)] bg-[#F5F1EB] px-3 py-2'>
        <div className='min-w-0 flex-1'>
          <p className='truncate text-[10px] font-medium uppercase tracking-[0.12em] text-[#6E6A66]'>
            {labels.storeLabel}
          </p>
          <p className='truncate text-xs font-semibold text-[#2B2B2B]'>{product.store.displayName}</p>
        </div>
        {product.deliveryEnabled ? (
          <span className='inline-flex shrink-0 items-center gap-1 rounded-full border border-[rgba(43,43,43,0.08)] bg-white px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#2B2B2B]'>
            <Truck className='size-3' style={{ color: accentColor }} aria-hidden strokeWidth={2.5} />
            {labels.deliveryAvailable}
          </span>
        ) : null}
      </div>
    </>
  )
}

export function ProductCard({
  product,
  labels,
  className,
  ratingColor = '#B76E5D',
  onOpenQuickView,
}: ProductCardProps) {
  const img = product.primaryImage ?? product.images[0]
  const off = discountPercent(product.priceFrom, product.compareAtFrom)
  const showNew = isNewListing(product.createdAt)
  const stock = availableStock(product)
  const variant = firstInStockVariant(product) ?? primaryVariant(product)
  const hasPrice = product.priceFrom != null
  const { rating } = pseudoRating(product.id)

  const stockTone: 'sold' | 'low' | 'ok' = stock <= 0 ? 'sold' : stock <= 5 ? 'low' : 'ok'
  const stockPill = { text: labels.stockTagText, tone: stockTone }

  const openSheet = onOpenQuickView ? () => onOpenQuickView(product, labels) : undefined
  const hasVariantOptions = product.variants.length > 1
  const mediaClass =
    'relative mx-1.5 block overflow-hidden rounded-xl bg-[#EAE4DC] text-left ring-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B76E5D]/50 sm:mx-2 sm:rounded-[1.25rem]'

  return (
    <article
      className={cn(
        'group/card relative isolate flex h-full flex-col overflow-hidden rounded-2xl border border-[rgba(43,43,43,0.08)] bg-white/60 shadow-[0_1px_2px_rgba(43,43,43,0.03),0_8px_24px_rgba(43,43,43,0.05)] backdrop-blur-md transition-all duration-500 ease-out hover:-translate-y-1.5 hover:shadow-[0_2px_4px_rgba(43,43,43,0.04),0_24px_48px_rgba(43,43,43,0.10)] sm:rounded-[1.6rem]',
        className,
      )}
    >
      {onOpenQuickView ? (
        <button type='button' onClick={openSheet} className={mediaClass}>
          <ProductCardMedia
            product={product}
            labels={labels}
            img={img}
            off={off}
            showNew={showNew}
            accentColor={ratingColor}
          />
        </button>
      ) : (
        <Link href={`/shop/${product.id}`} prefetch={false} className={mediaClass}>
          <ProductCardMedia
            product={product}
            labels={labels}
            img={img}
            off={off}
            showNew={showNew}
            accentColor={ratingColor}
          />
        </Link>
      )}

      <div className='absolute right-3 top-3 z-10 sm:right-5 sm:top-5'>
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

      <div className='flex flex-1 flex-col gap-2 px-3 pb-4 pt-1 sm:gap-3 sm:px-5 sm:pb-5'>
        <div className='flex items-center justify-between gap-2'>
          <StarRating
            rating={rating}
            ariaLabel={labels.ratingAriaLabel}
            size={13}
          />
          <span
            className={cn(
              'inline-flex shrink-0 items-center whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] tabular-nums',
              stockPill.tone === 'sold' && 'border-[rgba(43,43,43,0.12)] bg-[#EAE4DC] text-[#6E6A66]',
              stockPill.tone === 'low' && 'border-[rgba(43,43,43,0.12)] bg-[#EAE4DC] text-[#6E6A66]',
              stockPill.tone === 'ok' && 'border-[rgba(43,43,43,0.08)] bg-[#EAE4DC]/70 text-[#6E6A66]',
            )}
          >
            {stockPill.text}
          </span>
        </div>

        <div className='space-y-1'>
          <p className='text-[10px] font-semibold uppercase tracking-[0.14em] text-[#6E6A66]'>
            {product.category}
          </p>
          {onOpenQuickView ? (
            <button type='button' onClick={openSheet} className='block w-full text-left'>
              <h3 className='line-clamp-2 text-[15px] font-semibold leading-tight tracking-tight text-[#2B2B2B] transition-colors duration-300 group-hover/card:text-[#B76E5D]'>
                {product.name}
              </h3>
            </button>
          ) : (
            <Link href={`/shop/${product.id}`} prefetch={false} className='block'>
              <h3 className='line-clamp-2 text-[15px] font-semibold leading-tight tracking-tight text-[#2B2B2B] transition-colors duration-300 group-hover/card:text-[#B76E5D]'>
                {product.name}
              </h3>
            </Link>
          )}
        </div>

        <div className='mt-auto flex flex-col gap-2 pt-1 min-[400px]:flex-row min-[400px]:items-end min-[400px]:justify-between min-[400px]:gap-3'>
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

          {variant && hasVariantOptions ? (
            onOpenQuickView ? (
              <button
                type='button'
                aria-label={labels.addToCartAria}
                title={labels.addToCartAria}
                onClick={(event) => {
                  event.preventDefault()
                  event.stopPropagation()
                  openSheet?.()
                }}
                className='inline-flex h-10 shrink-0 items-center gap-1.5 self-end rounded-full bg-[#B76E5D] px-3 text-[11px] font-semibold text-white shadow-[0_6px_18px_rgba(43,43,43,0.18)] transition-colors hover:bg-[#A66250] active:scale-[0.96] sm:h-11 sm:px-4 sm:text-xs'
              >
                <ShoppingBag className='size-4 shrink-0' aria-hidden strokeWidth={2} />
                <span>{labels.addToCartAria}</span>
              </button>
            ) : (
              <Link
                href={`/shop/${product.id}`}
                prefetch={false}
                aria-label={labels.addToCartAria}
                title={labels.addToCartAria}
                className='inline-flex h-10 shrink-0 items-center gap-1.5 self-end rounded-full bg-[#B76E5D] px-3 text-[11px] font-semibold text-white shadow-[0_6px_18px_rgba(43,43,43,0.18)] transition-colors hover:bg-[#A66250] active:scale-[0.96] sm:h-11 sm:px-4 sm:text-xs'
              >
                <ShoppingBag className='size-4 shrink-0' aria-hidden strokeWidth={2} />
                <span>{labels.addToCartAria}</span>
              </Link>
            )
          ) : variant ? (
            <QuickAddButton
              className='self-end'
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
