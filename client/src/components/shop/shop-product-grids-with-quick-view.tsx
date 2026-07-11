'use client'

import { Sparkles } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'

import {
  catalogProductGridClassForCount,
  catalogSectionGridClassForCount,
  hasCatalogSectionItems,
  hasTopStoresSectionItems,
} from '@/lib/catalog-grid'
import type { CatalogProductPublic } from '@/services/catalog.service'

import { ProductCard, type ProductCardLabels } from './product-card'
import { ProductQuickViewSheet } from './product-quick-view-sheet'
import { TopStoresSection, type TopStoreEntry } from './top-stores-section'

export type ShopProductCell = { product: CatalogProductPublic; labels: ProductCardLabels }

interface NewArrivalsSection {
  title: string
  eyebrow: string
  items: ShopProductCell[]
}

interface TopStoresSectionConfig {
  eyebrow: string
  title: string
  visitStoreLabel: string
  stores: TopStoreEntry[]
}

interface AllProductsSection {
  title: string
  subtitle: string
  emptyMessage: string
  items: ShopProductCell[]
}

interface ShopProductGridsWithQuickViewProps {
  quickViewEnabled: boolean
  showFullPageLink?: boolean
  newArrivals?: NewArrivalsSection
  allProducts?: AllProductsSection
  topStores?: TopStoresSectionConfig
  accentColor?: string
}

export function ShopProductGridsWithQuickView({
  quickViewEnabled,
  showFullPageLink = true,
  newArrivals,
  allProducts,
  topStores,
  accentColor = '#1daf61',
}: ShopProductGridsWithQuickViewProps) {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState<ShopProductCell | null>(null)

  const openQuickView = useCallback(
    (product: CatalogProductPublic, labels: ProductCardLabels) => {
      if (!quickViewEnabled) return
      setActive({ product, labels })
      setOpen(true)
    },
    [quickViewEnabled],
  )

  const handleOpenChange = useCallback((next: boolean) => {
    setOpen(next)
    if (!next) setActive(null)
  }, [])

  const cardProps = useMemo(
    () => (quickViewEnabled ? { onOpenQuickView: openQuickView } : {}),
    [quickViewEnabled, openQuickView],
  )

  const renderCard = (cell: ShopProductCell) => (
    <ProductCard
      product={cell.product}
      labels={cell.labels}
      ratingColor={accentColor}
      {...cardProps}
    />
  )

  return (
    <>
      {newArrivals && hasCatalogSectionItems(newArrivals.items.length) ? (
        <section id='new-arrivals' className='py-8 sm:py-12'>
          <div className='mb-4 flex items-end justify-between gap-3 sm:mb-5 sm:gap-4'>
            <div className='min-w-0'>
              <span className='mb-2 inline-flex max-w-full items-center gap-1.5 rounded-full border border-stroke-soft-200 bg-bg-white-0 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-text-strong-950 shadow-regular-xs sm:text-[11px]'>
                <Sparkles className='size-3.5 shrink-0' style={{ color: accentColor }} aria-hidden />
                <span className='truncate'>{newArrivals.eyebrow}</span>
              </span>
              <h2 className='text-xl font-bold tracking-tight text-[#171717] sm:text-2xl'>{newArrivals.title}</h2>
            </div>
          </div>
          <ul className={catalogSectionGridClassForCount(newArrivals.items.length)}>
            {newArrivals.items.map(({ product, labels }, index) => (
              <li key={product.id} className='os-fade-up' style={{ animationDelay: `${index * 45}ms` }}>
                {renderCard({ product, labels })}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {topStores && hasTopStoresSectionItems(topStores.stores.length) ? (
        <TopStoresSection
          eyebrow={topStores.eyebrow}
          title={topStores.title}
          visitStoreLabel={topStores.visitStoreLabel}
          stores={topStores.stores}
          accentColor={accentColor}
        />
      ) : null}

      {allProducts ? (
        <section id='all-products' className='pb-10 sm:pb-14'>
          <div className='mb-4 sm:mb-5'>
            <h2 className='text-xl font-bold tracking-tight text-[#171717] sm:text-2xl'>{allProducts.title}</h2>
            <p className='mt-1 text-sm text-[#5c5c5c]'>{allProducts.subtitle}</p>
          </div>
          {allProducts.items.length === 0 ? (
            <p className='text-center text-[#5c5c5c]'>{allProducts.emptyMessage}</p>
          ) : (
            <ul className={catalogProductGridClassForCount(allProducts.items.length)}>
              {allProducts.items.map(({ product, labels }, index) => (
                <li key={product.id}>
                  <div className='os-fade-up' style={{ animationDelay: `${Math.min(index * 22, 420)}ms` }}>
                    {renderCard({ product, labels })}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}

      <ProductQuickViewSheet
        product={active?.product ?? null}
        labels={active?.labels ?? null}
        open={open}
        onOpenChange={handleOpenChange}
        accentColor={accentColor}
        showFullPageLink={showFullPageLink}
      />
    </>
  )
}
