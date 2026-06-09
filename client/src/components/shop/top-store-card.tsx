import { Store } from 'lucide-react'

import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/utils'

import type { TopStoreEntry } from './top-stores-section'

type TopStoreCardProps = {
  entry: TopStoreEntry
  visitStoreLabel: string
  accentColor?: string
  className?: string
}

export function TopStoreCard({
  entry,
  visitStoreLabel,
  accentColor = '#B76E5D',
  className,
}: TopStoreCardProps) {
  const { store, productCountLabel } = entry
  const href = `/?store=${encodeURIComponent(store.subdomain)}`

  return (
    <article
      style={{ ['--store-accent' as string]: accentColor }}
      className={cn(
        'group/card relative isolate flex h-full flex-col overflow-hidden rounded-[1.6rem] border border-[rgba(43,43,43,0.08)] bg-white/60 shadow-[0_1px_2px_rgba(43,43,43,0.03),0_8px_24px_rgba(43,43,43,0.05)] backdrop-blur-md transition-all duration-500 ease-out hover:-translate-y-1.5 hover:shadow-[0_2px_4px_rgba(43,43,43,0.04),0_24px_48px_rgba(43,43,43,0.10)]',
        className,
      )}
    >
      <Link
        href={href}
        prefetch={false}
        className='relative m-2 block w-full overflow-hidden rounded-[1.25rem] bg-[#EAE4DC] text-left ring-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B76E5D]/50'
      >
        <div className='relative aspect-[4/5] w-full overflow-hidden bg-gradient-to-b from-white via-[#FAF7F3] to-[#F0EBE3]'>
          <div className='absolute inset-0 flex items-center justify-center p-6 sm:p-8'>
            {store.logoUrl ? (
              <div className='flex h-[min(72%,11.5rem)] w-[min(88%,13rem)] items-center justify-center rounded-2xl bg-white p-4 shadow-[0_10px_28px_rgba(43,43,43,0.08)] ring-1 ring-[rgba(43,43,43,0.07)] transition-transform duration-500 group-hover/card:scale-[1.03]'>
                <img
                  src={store.logoUrl}
                  alt={store.displayName}
                  loading='lazy'
                  className='max-h-full max-w-full object-contain object-center'
                />
              </div>
            ) : (
              <div className='flex size-[min(55%,9rem)] items-center justify-center rounded-2xl bg-white/90 shadow-[0_8px_24px_rgba(43,43,43,0.06)] ring-1 ring-[rgba(43,43,43,0.08)]'>
                <Store className='size-14' aria-hidden strokeWidth={1.25} style={{ color: accentColor }} />
              </div>
            )}
          </div>
          <span
            className='pointer-events-none absolute left-3 top-3 z-[1] inline-flex items-center gap-1.5 rounded-full border border-[rgba(43,43,43,0.08)] bg-white/90 px-2.5 py-1 text-[11px] font-semibold tracking-tight text-[#2B2B2B] shadow-sm'
          >
            <span aria-hidden className='size-1.5 rounded-full' style={{ backgroundColor: accentColor }} />
            {visitStoreLabel}
          </span>
        </div>

        <div className='flex items-center justify-between gap-2 border-t border-[rgba(43,43,43,0.06)] bg-[#F5F1EB] px-3 py-2'>
          <p className='min-w-0 flex-1 truncate text-xs font-semibold text-[#2B2B2B]'>{store.displayName}</p>
          <span className='inline-flex shrink-0 items-center rounded-full border border-[rgba(43,43,43,0.08)] bg-white px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#6E6A66]'>
            {productCountLabel}
          </span>
        </div>
      </Link>

      <div className='flex flex-1 flex-col gap-3 px-5 pb-5 pt-1'>
        <div className='space-y-1'>
          <p className='text-[10px] font-semibold uppercase tracking-[0.14em] text-[#6E6A66]'>
            {visitStoreLabel}
          </p>
          <Link href={href} prefetch={false} className='block'>
            <h3 className='line-clamp-2 text-[15px] font-semibold leading-tight tracking-tight text-[#2B2B2B] transition-colors duration-300 group-hover/card:[color:var(--store-accent)]'>
              {store.displayName}
            </h3>
          </Link>
        </div>

        <p className='mt-auto text-sm font-medium tabular-nums text-[#6E6A66]'>{productCountLabel}</p>
      </div>
    </article>
  )
}
