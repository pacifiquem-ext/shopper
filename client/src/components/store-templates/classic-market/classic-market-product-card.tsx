'use client'

import { RiImageLine } from '@remixicon/react'
import { Link } from '@/i18n/navigation'
import { QuickAddButton } from '@/components/shop/quick-add-button'
import type { ProductCardLabels } from '@/components/shop/product-card'
import { discountPercent, formatRwf } from '@/lib/product-display'
import type { CatalogProductPublic } from '@/services/catalog.service'
import { cn } from '@/lib/utils'

function availableStock(product: CatalogProductPublic): number {
  return product.variants.reduce((sum, v) => sum + (v.inventory?.available ?? 0), 0)
}

export type ClassicMarketListingLabels = { addToCart: string }

type Props = {
  product: CatalogProductPublic
  labels: ProductCardLabels
  listingLabels: ClassicMarketListingLabels
  onOpenQuickView?: (product: CatalogProductPublic, labels: ProductCardLabels) => void
}

export function ClassicMarketProductCard({ product, labels, listingLabels, onOpenQuickView }: Props) {
  const img = product.primaryImage ?? product.images[0]
  const variant = product.variants[0]
  const stock = availableStock(product)
  const soldOut = stock <= 0
  const off = discountPercent(product.priceFrom, product.compareAtFrom)
  const openQuickView = onOpenQuickView ? () => onOpenQuickView(product, labels) : undefined

  const media = (
    <>
      {img ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={img}
          alt={product.name}
          loading="lazy"
          className="size-full object-cover transition duration-500 group-hover:scale-[1.03]"
        />
      ) : (
        <div className="flex size-full flex-col items-center justify-center gap-2 bg-[var(--kc-primary-light)] text-[var(--kc-muted)]">
          <RiImageLine className="size-8 opacity-50" />
        </div>
      )}
      {off != null ? (
        <span className="absolute left-3 top-3 rounded-full bg-[var(--kc-secondary)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
          −{off}%
        </span>
      ) : null}
      {soldOut ? (
        <span className="absolute right-3 top-3 rounded-full bg-[var(--kc-primary)]/90 px-2.5 py-1 text-[10px] font-semibold text-white">
          {labels.stockTagText}
        </span>
      ) : null}
    </>
  )

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-20 border border-[var(--kc-border)] bg-[var(--kc-surface)] shadow-[0_1px_2px_rgba(23,23,23,0.04)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(23,23,23,0.08)]">
      {openQuickView ? (
        <button
          type="button"
          onClick={openQuickView}
          className="relative aspect-[4/5] w-full cursor-pointer overflow-hidden text-left"
        >
          {media}
        </button>
      ) : (
        <Link
          href={`/shop/${product.id}`}
          prefetch={false}
          className="relative block aspect-[4/5] w-full overflow-hidden"
        >
          {media}
        </Link>
      )}
      <div className="flex flex-1 flex-col gap-2 p-4">
        {product.category ? (
          <p className="text-[11px] font-medium uppercase tracking-wide text-[var(--kc-muted)]">
            {product.category}
          </p>
        ) : null}
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-[var(--kc-ink)] transition-colors group-hover:text-[var(--kc-secondary)]">
          {product.name}
        </h3>
        {product.priceFrom != null ? (
          <p className="text-lg font-bold tabular-nums text-[var(--kc-ink)]">
            {formatRwf(product.priceFrom)}
          </p>
        ) : null}
        {variant && !soldOut ? (
          <QuickAddButton
            fullWidth
            label={listingLabels.addToCart}
            addedLabel={labels.addedLabel}
            toastTitle={labels.toastAdded}
            className={cn(
              'mt-auto !h-11 !rounded-10 !bg-[var(--kc-secondary)] !text-[var(--kc-on-primary)] hover:!brightness-105',
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
          <p className="mt-auto text-xs font-medium text-[var(--kc-muted)]">{labels.stockTagText}</p>
        )}
      </div>
    </article>
  )
}
