import { Store } from 'lucide-react'

import {
  catalogSectionGridClassForCount,
  hasTopStoresSectionItems,
} from '@/lib/catalog-grid'
import { cn } from '@/lib/utils'

import type { TopStoreEntry } from '@/components/shop/top-stores-section'
import { VibrantMarketTopStoreCard } from './vibrant-market-top-store-card'

type VibrantMarketTopStoresSectionProps = {
  id?: string
  eyebrow: string
  title: string
  visitStoreLabel: string
  stores: TopStoreEntry[]
  className?: string
}

export function VibrantMarketTopStoresSection({
  id = 'top-stores',
  eyebrow,
  title,
  visitStoreLabel,
  stores,
  className,
}: VibrantMarketTopStoresSectionProps) {
  if (!hasTopStoresSectionItems(stores.length)) return null

  return (
    <section id={id} className={cn('py-8 sm:py-12', className)}>
      <div className='mb-4 flex items-end justify-between gap-3 sm:mb-5 sm:gap-4'>
        <div className='min-w-0'>
          <span className='mb-2 inline-flex max-w-full items-center gap-1.5 rounded-full border border-[var(--vm-secondary)]/25 bg-[var(--vm-primary-light)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--vm-secondary)] sm:text-[11px]'>
            <Store className='size-3.5 shrink-0 text-[var(--vm-secondary)]' aria-hidden strokeWidth={2.25} />
            <span className='truncate'>{eyebrow}</span>
          </span>
          <h2 className='text-lg font-black text-[var(--vm-ink)] sm:text-xl md:text-2xl'>{title}</h2>
        </div>
      </div>
      <ul className={catalogSectionGridClassForCount(stores.length)}>
        {stores.map((entry) => (
          <li key={entry.store.id}>
            <VibrantMarketTopStoreCard entry={entry} visitStoreLabel={visitStoreLabel} />
          </li>
        ))}
      </ul>
    </section>
  )
}
