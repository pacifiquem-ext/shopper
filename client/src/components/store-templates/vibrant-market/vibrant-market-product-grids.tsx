'use client'

import { Sparkles } from 'lucide-react'

import type { ProductCardLabels } from '@/components/shop/product-card'
import type { CatalogProductPublic } from '@/services/catalog.service'
import type { ShopProductCell } from '@/components/shop/shop-product-grids-with-quick-view'
import {
  catalogProductGridClassForCount,
  catalogSectionGridClassForCount,
  hasCatalogSectionItems,
  hasTopStoresSectionItems,
} from '@/lib/catalog-grid'

import type { TopStoreEntry } from '@/components/shop/top-stores-section'
import { VibrantMarketTopStoresSection } from './vibrant-market-top-stores-section'
import {
  VibrantMarketProductCard,
  type VibrantMarketListingLabels,
} from './vibrant-market-product-card'

type NewArrivalsSection = {
  title: string
  eyebrow: string
  items: ShopProductCell[]
}

type TopStoresSectionConfig = {
  eyebrow: string
  title: string
  visitStoreLabel: string
  stores: TopStoreEntry[]
}

type AllProductsSection = {
  title: string
  subtitle: string
  emptyMessage: string
  items: ShopProductCell[]
}

export type VibrantMarketProductGridsSections = {
  newArrivals?: NewArrivalsSection
  topStores?: TopStoresSectionConfig
  allProducts?: AllProductsSection
}

type VibrantMarketProductGridsProps = {
  sections: VibrantMarketProductGridsSections
  listingLabels: VibrantMarketListingLabels
  onOpenQuickView: (product: CatalogProductPublic, labels: ProductCardLabels) => void
}

export function VibrantMarketProductGrids({
  sections,
  listingLabels,
  onOpenQuickView,
}: VibrantMarketProductGridsProps) {
  const renderCard = (cell: ShopProductCell) => (
    <VibrantMarketProductCard
      product={cell.product}
      labels={cell.labels}
      listingLabels={listingLabels}
      onOpenQuickView={onOpenQuickView}
    />
  )

  return (
    <>
      {sections.newArrivals && hasCatalogSectionItems(sections.newArrivals.items.length) ? (
        <section id='new-arrivals' className='py-10 sm:py-12'>
          <div className='mb-5 flex items-end justify-between gap-4'>
            <div>
              <span className='mb-2 inline-flex items-center gap-1.5 rounded-full border border-[var(--vm-secondary)]/25 bg-[var(--vm-primary-light)] px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--vm-secondary)]'>
                <Sparkles className='size-3.5 text-[var(--vm-secondary)]' aria-hidden />
                {sections.newArrivals.eyebrow}
              </span>
              <h2 className='text-xl font-black text-[var(--vm-ink)] sm:text-2xl'>
                {sections.newArrivals.title}
              </h2>
            </div>
          </div>
          <ul className={catalogSectionGridClassForCount(sections.newArrivals.items.length)}>
            {sections.newArrivals.items.map((cell) => (
              <li key={cell.product.id}>{renderCard(cell)}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {sections.topStores && hasTopStoresSectionItems(sections.topStores.stores.length) ? (
        <VibrantMarketTopStoresSection
          eyebrow={sections.topStores.eyebrow}
          title={sections.topStores.title}
          visitStoreLabel={sections.topStores.visitStoreLabel}
          stores={sections.topStores.stores}
        />
      ) : null}

      {sections.allProducts ? (
        <section id='all-products' className='pb-12 sm:pb-14'>
          <div className='mb-5'>
            <h2 className='text-xl font-black text-[var(--vm-ink)] sm:text-2xl'>
              {sections.allProducts.title}
            </h2>
            <p className='mt-1 text-sm text-[var(--vm-muted)]'>{sections.allProducts.subtitle}</p>
          </div>
          {sections.allProducts.items.length === 0 ? (
            <p className='rounded-2xl border border-dashed border-[var(--vm-primary)]/25 bg-[var(--vm-surface)] px-6 py-12 text-center text-sm text-[var(--vm-muted)]'>
              {sections.allProducts.emptyMessage}
            </p>
          ) : (
            <ul className={catalogProductGridClassForCount(sections.allProducts.items.length)}>
              {sections.allProducts.items.map((cell) => (
                <li key={cell.product.id}>{renderCard(cell)}</li>
              ))}
            </ul>
          )}
        </section>
      ) : null}
    </>
  )
}
