'use client'

import { ImageIcon } from 'lucide-react'

import { Link } from '@/i18n/navigation'
import { QuickAddButton } from '@/components/shop/quick-add-button'
import type { ProductCardLabels } from '@/components/shop/product-card'
import { formatRwf } from '@/lib/product-display'
import type { CatalogProductPublic } from '@/services/catalog.service'

function availableStock(product: CatalogProductPublic): number {
  return product.variants.reduce((sum, v) => sum + (v.inventory?.available ?? 0), 0)
}

export type IshushoCraftsListingLabels = {
  addToCart: string
}

type IshushoCraftsProductCardProps = {
  product: CatalogProductPublic
  labels: ProductCardLabels
  listingLabels: IshushoCraftsListingLabels
  onOpenQuickView?: (product: CatalogProductPublic, labels: ProductCardLabels) => void
}

export function IshushoCraftsProductCard({
  product,
  labels,
  listingLabels,
  onOpenQuickView,
}: IshushoCraftsProductCardProps) {
  const img = product.primaryImage ?? product.images[0]
  const variant = product.variants[0]
  const stock = availableStock(product)
  const soldOut = stock <= 0
  const categoryLabel = product.category?.trim()

  const openQuickView = onOpenQuickView
    ? () => onOpenQuickView(product, labels)
    : undefined

  const mediaClass =
    'relative block aspect-[4/5] w-full cursor-pointer overflow-hidden bg-[var(--ic-primary-light)] text-left'

  const mediaContent = (
    <>
      {img ? (
        <img
          src={img}
          alt={product.name}
          loading='lazy'
          className='size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]'
        />
      ) : (
        <div
          className='flex size-full flex-col items-center justify-center gap-3 p-6 text-center'
          style={{
            background:
              'linear-gradient(155deg, color-mix(in srgb, var(--ic-secondary) 10%, var(--ic-primary-light)), var(--ic-surface))',
          }}
        >
          <span className='flex size-14 items-center justify-center rounded-xl bg-[var(--ic-surface)] font-[family-name:var(--font-ic-display)] text-lg font-semibold text-[var(--ic-secondary)] ring-1 ring-[var(--ic-border)]'>
            {product.name.trim().charAt(0).toUpperCase() || '?'}
          </span>
          <ImageIcon className='size-6 text-[var(--ic-muted)]/50' aria-hidden strokeWidth={1.25} />
          <p className='line-clamp-2 max-w-[12rem] text-xs font-medium text-[var(--ic-muted)]'>
            {product.name}
          </p>
        </div>
      )}
      {soldOut ? (
        <span className='absolute inset-x-3 bottom-3 rounded-lg bg-[var(--ic-primary)]/90 px-3 py-1.5 text-center text-[10px] font-semibold uppercase tracking-wider text-[var(--ic-ink)] backdrop-blur-sm'>
          {labels.stockTagText}
        </span>
      ) : null}
    </>
  )

  return (
    <article className='group relative flex h-full flex-col overflow-hidden rounded-xl border border-[var(--ic-border)] bg-[var(--ic-surface)] shadow-[0_4px_24px_rgba(0,0,0,0.28)] transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--ic-secondary)_35%,transparent)] hover:shadow-[0_16px_48px_rgba(0,0,0,0.42)]'>
      <div
        className='pointer-events-none absolute inset-x-0 top-0 h-0.5 scale-x-0 bg-gradient-to-r from-transparent via-[var(--ic-secondary)] to-transparent transition-transform duration-300 group-hover:scale-x-100'
        aria-hidden
      />

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
            <h3 className='line-clamp-2 font-[family-name:var(--font-ic-display)] text-[0.95rem] font-semibold leading-snug text-[var(--ic-ink)] transition-colors group-hover:text-[var(--ic-secondary)]'>
              {product.name}
            </h3>
          </button>
        ) : (
          <Link href={`/shop/${product.id}`} prefetch={false} className='block'>
            <h3 className='line-clamp-2 font-[family-name:var(--font-ic-display)] text-[0.95rem] font-semibold leading-snug text-[var(--ic-ink)] transition-colors group-hover:text-[var(--ic-secondary)]'>
              {product.name}
            </h3>
          </Link>
        )}

        {categoryLabel ? (
          <span className='inline-flex w-fit rounded-md border border-[var(--ic-border)] bg-[var(--ic-primary-light)]/80 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--ic-muted)]'>
            {categoryLabel}
          </span>
        ) : null}

        {product.priceFrom != null ? (
          <p className='text-lg font-bold tabular-nums tracking-tight text-[var(--ic-ink)]'>
            {formatRwf(product.priceFrom)}
            <span className='ml-1 text-[10px] font-bold uppercase tracking-wider text-[var(--ic-muted)]'>
              RWF
            </span>
          </p>
        ) : null}

        {variant && !soldOut ? (
          <QuickAddButton
            label={listingLabels.addToCart}
            addedLabel={labels.addedLabel}
            toastTitle={labels.toastAdded}
            fullWidth
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
            className='!mt-auto !h-10 !w-full !rounded-lg !border !border-[color-mix(in_srgb,var(--ic-secondary)_35%,transparent)] !bg-transparent !px-3 !text-xs !font-semibold !text-[var(--ic-secondary)] !shadow-none transition-colors hover:!border-transparent hover:!bg-[var(--ic-secondary)] hover:!text-[var(--ic-on-secondary)]'
          />
        ) : null}
      </div>
    </article>
  )
}
