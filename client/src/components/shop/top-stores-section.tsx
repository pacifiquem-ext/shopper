import { Store } from 'lucide-react'

import {
  catalogSectionGridClassForCount,
  hasTopStoresSectionItems,
} from '@/lib/catalog-grid'
import { cn } from '@/lib/utils'
import type { CatalogStoreSummary } from '@/services/catalog.service'

import { TopStoreCard } from './top-store-card'

export type TopStoreEntry = {
  store: CatalogStoreSummary
  productCount: number
  productCountLabel: string
}

type TopStoresSectionProps = {
  id?: string
  eyebrow: string
  title: string
  visitStoreLabel: string
  stores: TopStoreEntry[]
  accentColor?: string
  className?: string
}

export function TopStoresSection({
  id = 'top-stores',
  eyebrow,
  title,
  visitStoreLabel,
  stores,
  accentColor = '#B76E5D',
  className,
}: TopStoresSectionProps) {
  if (!hasTopStoresSectionItems(stores.length)) return null

  return (
    <section id={id} className={cn('py-8 sm:py-12', className)}>
      <div className='mb-4 flex items-end justify-between gap-3 sm:mb-5 sm:gap-4'>
        <div className='min-w-0'>
          <span className='mb-2 inline-flex max-w-full items-center gap-1.5 rounded-full border border-[rgba(43,43,43,0.08)] bg-white/60 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#2B2B2B] backdrop-blur-md sm:text-[11px]'>
            <Store className='size-3.5 shrink-0' style={{ color: accentColor }} aria-hidden strokeWidth={2.25} />
            <span className='truncate'>{eyebrow}</span>
          </span>
          <h2 className='text-xl font-bold tracking-tight text-[#2B2B2B] sm:text-2xl'>{title}</h2>
        </div>
      </div>
      <ul className={catalogSectionGridClassForCount(stores.length)}>
        {stores.map((entry, index) => (
          <li key={entry.store.id} className='os-fade-up' style={{ animationDelay: `${index * 45}ms` }}>
            <TopStoreCard entry={entry} visitStoreLabel={visitStoreLabel} accentColor={accentColor} />
          </li>
        ))}
      </ul>
    </section>
  )
}
