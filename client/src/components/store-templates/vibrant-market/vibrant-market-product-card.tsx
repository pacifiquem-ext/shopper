'use client'

import { Flame, ImageIcon, Package } from 'lucide-react'

import { Link } from '@/i18n/navigation'
import { QuickAddButton } from '@/components/shop/quick-add-button'
import { StarRating } from '@/components/shop/star-rating'
import type { ProductCardLabels } from '@/components/shop/product-card'
import { discountPercent, formatRwf, pseudoRating } from '@/lib/product-display'
import type { CatalogProductPublic } from '@/services/catalog.service'
import { cn } from '@/lib/utils'

function availableStock(product: CatalogProductPublic): number {
  return product.variants.reduce((sum, v) => sum + (v.inventory?.available ?? 0), 0)
}

export type VibrantMarketListingLabels = {
  flashSaleBadge: string
  addToCart: string
}

type VibrantMarketProductCardProps = {
  product: CatalogProductPublic
  labels: ProductCardLabels
  listingLabels: VibrantMarketListingLabels
  onOpenQuickView?: (product: CatalogProductPublic, labels: ProductCardLabels) => void
}

export function VibrantMarketProductCard({
  product,
  labels,
  listingLabels,
  onOpenQuickView,
}: VibrantMarketProductCardProps) {
  const img = product.primaryImage ?? product.images[0]
  const variant = product.variants[0]
  const stock = availableStock(product)
  const off = discountPercent(product.priceFrom, product.compareAtFrom)
  const soldOut = stock <= 0
  const { rating } = pseudoRating(product.id)
  const onSale = off != null

  const openQuickView = onOpenQuickView
    ? () => onOpenQuickView(product, labels)
    : undefined

  const mediaClass =
    'relative block aspect-[4/5] w-full cursor-pointer overflow-hidden bg-[var(--vm-primary-light)] text-left'

  const mediaContent = (
    <>
      {img ? (
        <img
          src={img}
          alt={product.name}
          loading='lazy'
          className='size-full object-cover transition-transform duration-500 group-hover:scale-105'
        />
      ) : (
        <div className='flex size-full flex-col items-center justify-center gap-2 text-[var(--vm-muted)]'>
          <span className='flex size-14 items-center justify-center rounded-2xl bg-[var(--vm-surface)] shadow-sm ring-1 ring-white/10'>
            <ImageIcon className='size-7 text-[var(--vm-muted)]/70' aria-hidden strokeWidth={1.5} />
          </span>
          <Package className='size-6 opacity-40' aria-hidden />
        </div>
      )}

      {onSale ? (
        <span className='absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-[var(--vm-accent)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[var(--vm-on-primary)] shadow-regular-xs sm:text-[11px]'>
          <Flame className='size-3 shrink-0' aria-hidden fill='currentColor' />
          {listingLabels.flashSaleBadge}
          {labels.discountBadge ? (
            <span className='ml-0.5 border-l border-white/30 pl-1.5 font-black'>
              {labels.discountBadge}
            </span>
          ) : null}
        </span>
      ) : null}

      {soldOut ? (
        <span className='absolute right-3 top-3 rounded-full bg-[var(--vm-primary)]/90 px-2.5 py-1 text-[10px] font-semibold text-[var(--vm-on-primary)] sm:text-[11px]'>
          {labels.stockTagText}
        </span>
      ) : null}
    </>
  )

  return (
    <article className='group flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--vm-border)]/80 bg-[var(--vm-surface)] shadow-[0_1px_3px_rgba(15,23,42,0.05),0_6px_16px_rgba(15,23,42,0.04)] transition-[transform,box-shadow,border-color] hover:-translate-y-0.5 hover:border-[var(--vm-border)] hover:shadow-[0_4px_12px_rgba(15,23,42,0.07),0_12px_24px_rgba(15,23,42,0.05)]'>
      {openQuickView ? (
        <button type='button' onClick={openQuickView} className={mediaClass}>
          {mediaContent}
        </button>
      ) : (
        <Link href={`/shop/${product.id}`} prefetch={false} className={mediaClass}>
          {mediaContent}
        </Link>
      )}

      <div className='flex flex-1 flex-col gap-2.5 p-4'>
        {openQuickView ? (
          <button
            type='button'
            onClick={openQuickView}
            className='block w-full cursor-pointer text-left'
          >
            <h3 className='line-clamp-2 text-sm font-bold leading-snug text-[var(--vm-ink)] transition-colors group-hover:text-[var(--vm-secondary)] sm:text-[15px]'>
              {product.name}
            </h3>
          </button>
        ) : (
          <Link href={`/shop/${product.id}`} prefetch={false} className='block'>
            <h3 className='line-clamp-2 text-sm font-bold leading-snug text-[var(--vm-ink)] transition-colors group-hover:text-[var(--vm-secondary)] sm:text-[15px]'>
              {product.name}
            </h3>
          </Link>
        )}

        <StarRating
          rating={rating}
          ariaLabel={labels.ratingAriaLabel}
          size={13}
          filledClassName='text-[var(--vm-secondary)]'
        />

        {product.priceFrom != null ? (
          <p className='text-lg font-black tabular-nums leading-none text-[var(--vm-primary)]'>
            {formatRwf(product.priceFrom)}
            <span className='ml-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--vm-muted)]'>
              RWF
            </span>
          </p>
        ) : null}

        {variant && !soldOut ? (
          <QuickAddButton
            fullWidth
            label={listingLabels.addToCart}
            addedLabel={labels.addedLabel}
            toastTitle={labels.toastAdded}
            className={cn(
              'mt-auto !h-11 !rounded-xl !bg-[var(--vm-secondary)] !text-[var(--vm-on-primary)] !shadow-[0_6px_18px_color-mix(in_srgb,var(--vm-secondary)_30%,transparent)] hover:!brightness-105',
            )}
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
        ) : (
          <p className='mt-auto text-xs font-medium text-[var(--vm-muted)]'>{labels.stockTagText}</p>
        )}
      </div>
    </article>
  )
}
