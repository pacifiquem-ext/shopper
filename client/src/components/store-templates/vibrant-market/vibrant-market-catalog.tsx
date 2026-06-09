'use client'

import type { ShopCatalogFiltersLabels } from '@/components/shop/shop-catalog-filters'
import type { ShopProductCell } from '@/components/shop/shop-product-grids-with-quick-view'
import { ProductQuickViewSheet } from '@/components/shop/product-quick-view-sheet'
import { useProductQuickView } from '@/components/shop/use-product-quick-view'
import type { CatalogFilterParams } from '@/lib/catalog-query'
import { catalogFiltersActive } from '@/lib/catalog-query'
import { usePathname } from '@/i18n/navigation'
import type { TopStoreEntry } from '@/components/shop/top-stores-section'

import { VibrantMarketCatalogFilters } from './vibrant-market-catalog-filters'
import {
  VibrantMarketProductCard,
  type VibrantMarketListingLabels,
} from './vibrant-market-product-card'
import { VibrantMarketProductGrids } from './vibrant-market-product-grids'
import { catalogProductGridClassForCount } from '@/lib/catalog-grid'
import { VIBRANT_MARKET_COLORS } from '@/lib/store-templates'

type CategoryOption = { name: string; total: number }

export type VibrantMarketCatalogSections = {
  newArrivals?: {
    title: string
    eyebrow: string
    items: ShopProductCell[]
  }
  topStores?: {
    eyebrow: string
    title: string
    visitStoreLabel: string
    stores: TopStoreEntry[]
  }
  allProducts: {
    title: string
    subtitle: string
    emptyMessage: string
    items: ShopProductCell[]
  }
}

type VibrantMarketCatalogProps = {
  filters: CatalogFilterParams
  categories: CategoryOption[]
  filterLabels: ShopCatalogFiltersLabels
  categoriesLabel: string
  listingLabels: VibrantMarketListingLabels
  sections: VibrantMarketCatalogSections
}

export function VibrantMarketCatalog({
  filters,
  categories,
  filterLabels,
  categoriesLabel,
  listingLabels,
  sections,
}: VibrantMarketCatalogProps) {
  const pathname = usePathname()
  const filterKey = [filters.q ?? '', filters.category ?? '', filters.sort ?? '', filters.store ?? ''].join('|')
  const showSections = !catalogFiltersActive(filters)
  const { open, active, openQuickView, handleOpenChange } = useProductQuickView()

  const filteredListing = (
    <>
      <div className='flex items-end justify-between gap-4'>
        <h2 className='text-xl font-black text-[var(--vm-ink)] sm:text-2xl'>
          {sections.allProducts.title}
        </h2>
        <span className='rounded-full bg-[var(--vm-primary-light)] px-3 py-1 text-xs font-bold tabular-nums text-[var(--vm-primary)] sm:text-sm'>
          {sections.allProducts.items.length}
        </span>
      </div>

      {sections.allProducts.items.length === 0 ? (
        <p className='mt-10 rounded-2xl border border-dashed border-[var(--vm-border)] bg-[var(--vm-surface)] px-6 py-12 text-center text-sm text-[var(--vm-muted)]'>
          {sections.allProducts.emptyMessage}
        </p>
      ) : (
        <ul
          className={`mt-6 ${catalogProductGridClassForCount(sections.allProducts.items.length)}`}
        >
          {sections.allProducts.items.map((cell) => (
            <li key={cell.product.id}>
              <VibrantMarketProductCard
                product={cell.product}
                labels={cell.labels}
                listingLabels={listingLabels}
                onOpenQuickView={openQuickView}
              />
            </li>
          ))}
        </ul>
      )}

    </>
  )

  return (
    <section id='products' className='mx-auto max-w-screen-2xl px-3 py-8 sm:px-4 lg:px-5'>
      <div className='flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-8 xl:gap-10'>
        <aside className='w-full shrink-0 lg:sticky lg:top-28 lg:w-72 xl:w-80'>
          <div className='rounded-2xl border border-[var(--vm-border)]/80 bg-[var(--vm-surface)] p-4 shadow-[0_1px_3px_rgba(15,23,42,0.05),0_8px_20px_rgba(15,23,42,0.04)] sm:p-5'>
            <VibrantMarketCatalogFilters
              key={filterKey}
              filters={filters}
              categories={categories}
              labels={filterLabels}
              categoriesLabel={categoriesLabel}
              resetPath={pathname}
              compactLabels
            />
          </div>
        </aside>

        <div className='min-w-0 flex-1'>
          {showSections ? (
            <VibrantMarketProductGrids
              sections={sections}
              listingLabels={listingLabels}
              onOpenQuickView={openQuickView}
            />
          ) : (
            filteredListing
          )}
        </div>
      </div>

      <ProductQuickViewSheet
        product={active?.product ?? null}
        labels={active?.labels ?? null}
        open={open}
        onOpenChange={handleOpenChange}
        accentColor={VIBRANT_MARKET_COLORS.secondary}
        template='vibrant-market'
        showFullPageLink={false}
      />
    </section>
  )
}
