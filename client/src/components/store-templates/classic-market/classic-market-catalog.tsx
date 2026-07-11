'use client'

import type { ShopCatalogFiltersLabels } from '@/components/shop/shop-catalog-filters'
import { ShopCatalogFilters } from '@/components/shop/shop-catalog-filters'
import type { ShopProductCell } from '@/components/shop/shop-product-grids-with-quick-view'
import { ProductQuickViewSheet } from '@/components/shop/product-quick-view-sheet'
import { useProductQuickView } from '@/components/shop/use-product-quick-view'
import { catalogProductGridClass } from '@/lib/catalog-grid'
// constant grid class
import type { CatalogFilterParams } from '@/lib/catalog-query'
import { CLASSIC_MARKET_COLORS } from '@/lib/store-templates'
import {
  ClassicMarketProductCard,
  type ClassicMarketListingLabels,
} from './classic-market-product-card'

export type ClassicMarketCatalogSections = {
  allProducts: {
    title: string
    emptyMessage: string
    items: ShopProductCell[]
  }
}

type Props = {
  filters: CatalogFilterParams
  categories: Array<{ name: string; total: number }>
  filterLabels: ShopCatalogFiltersLabels
  listingLabels: ClassicMarketListingLabels
  sections: ClassicMarketCatalogSections
}

export function ClassicMarketCatalog({
  filters,
  categories,
  filterLabels,
  listingLabels,
  sections,
}: Props) {
  const { open, active, openQuickView, handleOpenChange } = useProductQuickView()

  return (
    <>
      <section id="products" className="mx-auto max-w-screen-2xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
        <div className="mb-6 space-y-5">
          <h2 className="text-2xl font-semibold tracking-tight text-[var(--kc-ink)] sm:text-3xl">
            {sections.allProducts.title}
          </h2>
          <ShopCatalogFilters
            categories={categories}
            filters={filters}
            labels={filterLabels}
            compactSearch
          />
        </div>

        {sections.allProducts.items.length === 0 ? (
          <p className="rounded-20 border border-dashed border-[var(--kc-border)] bg-[var(--kc-surface)] px-6 py-16 text-center text-sm text-[var(--kc-muted)]">
            {sections.allProducts.emptyMessage}
          </p>
        ) : (
          <ul className={catalogProductGridClass}>
            {sections.allProducts.items.map((cell) => (
              <li key={cell.product.id}>
                <ClassicMarketProductCard
                  product={cell.product}
                  labels={cell.labels}
                  listingLabels={listingLabels}
                  onOpenQuickView={openQuickView}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      <ProductQuickViewSheet
        open={open}
        onOpenChange={handleOpenChange}
        product={active?.product ?? null}
        labels={active?.labels ?? null}
        accentColor={CLASSIC_MARKET_COLORS.secondary}
        template="default"
        showFullPageLink={false}
      />
    </>
  )
}
