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
    <section id={id} className={cn('py-10 sm:py-12', className)}>
      <div className='mb-5 flex items-end justify-between gap-4'>
        <div>
          <span className='mb-2 inline-flex items-center gap-1.5 rounded-full border border-[var(--vm-secondary)]/25 bg-[var(--vm-primary-light)] px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--vm-secondary)]'>
            <Store className='size-3.5 text-[var(--vm-secondary)]' aria-hidden strokeWidth={2.25} />
            {eyebrow}
          </span>
          <h2 className='text-xl font-black text-[var(--vm-ink)] sm:text-2xl'>{title}</h2>
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
