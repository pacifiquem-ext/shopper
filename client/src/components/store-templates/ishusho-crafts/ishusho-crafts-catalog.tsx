'use client'

import type { ProductCardLabels } from '@/components/shop/product-card'
import { ProductQuickViewSheet } from '@/components/shop/product-quick-view-sheet'
import type { ShopCatalogFiltersLabels } from '@/components/shop/shop-catalog-filters'
import type { ShopProductCell } from '@/components/shop/shop-product-grids-with-quick-view'
import { useProductQuickView } from '@/components/shop/use-product-quick-view'
import type { CatalogFilterParams } from '@/lib/catalog-query'
import { catalogProductGridClass } from '@/lib/catalog-grid'
import { usePathname } from '@/i18n/navigation'
import { ISHUSHO_CRAFTS_COLORS } from '@/lib/store-templates'

import { IshushoCraftsCategoryChips } from './ishusho-crafts-category-chips'
import { IshushoCraftsListingToolbar } from './ishusho-crafts-listing-toolbar'
import {
  IshushoCraftsProductCard,
  type IshushoCraftsListingLabels,
} from './ishusho-crafts-product-card'

export type IshushoCraftsCatalogSections = {
  allProducts: {
    title: string
    emptyMessage: string
    items: ShopProductCell[]
  }
}

type IshushoCraftsCatalogProps = {
  filters: CatalogFilterParams
  categories: Array<{ name: string; total: number }>
  filterLabels: ShopCatalogFiltersLabels
  chipAllLabel: string
  chipFilterAria: string
  productsSubtitle: string
  listingLabels: IshushoCraftsListingLabels
  sections: IshushoCraftsCatalogSections
}

export function IshushoCraftsCatalog({
  filters,
  categories,
  filterLabels,
  chipAllLabel,
  chipFilterAria,
  productsSubtitle,
  listingLabels,
  sections,
}: IshushoCraftsCatalogProps) {
  const pathname = usePathname()
  const filterKey = [filters.q ?? '', filters.category ?? '', filters.sort ?? '', filters.store ?? ''].join('|')
  const { open, active, openQuickView, handleOpenChange } = useProductQuickView()

  const renderCard = (cell: ShopProductCell) => (
    <IshushoCraftsProductCard
      product={cell.product}
      labels={cell.labels}
      listingLabels={listingLabels}
      onOpenQuickView={openQuickView}
    />
  )

  return (
    <>
      <section id='products' className='bg-[var(--ic-bg)]'>
        <div className='mx-auto max-w-screen-2xl px-3 py-10 sm:px-4 lg:px-5 lg:py-14'>
          <div className='flex flex-wrap items-end justify-between gap-4 border-b border-[var(--ic-border)] pb-6'>
            <div>
              <h2 className='font-[family-name:var(--font-ic-display)] text-2xl font-semibold text-[var(--ic-ink)] sm:text-3xl'>
                {sections.allProducts.title}
              </h2>
              <p className='mt-2 max-w-xl text-sm leading-relaxed text-[var(--ic-muted)]'>
                {productsSubtitle}
              </p>
              <div
                className='mt-3 h-0.5 w-16 rounded-full bg-gradient-to-r from-[var(--ic-secondary)] to-[var(--ic-accent)]'
                aria-hidden
              />
            </div>
            <span className='rounded-lg border border-[var(--ic-border)] bg-[var(--ic-surface)] px-3 py-1.5 text-xs font-bold tabular-nums text-[var(--ic-secondary)]'>
              {sections.allProducts.items.length}
            </span>
          </div>

          <div className='mt-8 rounded-xl border border-[var(--ic-border)] bg-[var(--ic-surface)] p-4 sm:p-5'>
            <div className='space-y-4'>
              <IshushoCraftsListingToolbar
                key={`toolbar-${filterKey}`}
                filters={filters}
                labels={filterLabels}
                resetPath={pathname}
              />
              <IshushoCraftsCategoryChips
                filters={filters}
                categories={categories}
                allLabel={chipAllLabel}
                filterAria={chipFilterAria}
              />
            </div>
          </div>

          <div className='mt-10'>
            {sections.allProducts.items.length === 0 ? (
              <p className='rounded-xl border border-dashed border-[var(--ic-border)] bg-[var(--ic-surface)] px-6 py-16 text-center text-sm leading-relaxed text-[var(--ic-muted)]'>
                {sections.allProducts.emptyMessage}
              </p>
            ) : (
              <ul className={catalogProductGridClass}>
                {sections.allProducts.items.map((cell) => (
                  <li key={cell.product.id}>{renderCard(cell)}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      <ProductQuickViewSheet
        product={active?.product ?? null}
        labels={active?.labels ?? null}
        open={open}
        onOpenChange={handleOpenChange}
        accentColor={ISHUSHO_CRAFTS_COLORS.secondary}
        template='ishusho-crafts'
        showFullPageLink={false}
      />
    </>
  )
}
