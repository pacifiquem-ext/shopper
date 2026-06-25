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
        'group/card relative isolate flex h-full flex-col overflow-hidden rounded-2xl border border-[rgba(43,43,43,0.08)] bg-white/60 shadow-[0_1px_2px_rgba(43,43,43,0.03),0_8px_24px_rgba(43,43,43,0.05)] backdrop-blur-md transition-all duration-500 ease-out hover:-translate-y-1.5 hover:shadow-[0_2px_4px_rgba(43,43,43,0.04),0_24px_48px_rgba(43,43,43,0.10)] sm:rounded-[1.6rem]',
        className,
      )}
    >
      <Link
        href={href}
        prefetch={false}
        className='relative mx-1.5 block overflow-hidden rounded-xl bg-[#EAE4DC] text-left ring-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B76E5D]/50 sm:mx-2 sm:rounded-[1.25rem]'
      >
        <div className='relative aspect-[4/5] w-full overflow-hidden bg-gradient-to-b from-white via-[#FAF7F3] to-[#F0EBE3]'>
          {store.logoUrl ? (
            <img
              src={store.logoUrl}
              alt={store.displayName}
              loading='lazy'
              className='absolute inset-0 size-full object-cover object-center transition-transform duration-500 group-hover/card:scale-[1.03]'
            />
          ) : (
            <div className='absolute inset-0 flex items-center justify-center'>
              <div className='flex size-24 items-center justify-center rounded-2xl bg-white/90 shadow-[0_8px_24px_rgba(43,43,43,0.06)] ring-1 ring-[rgba(43,43,43,0.08)] sm:size-28'>
                <Store className='size-14' aria-hidden strokeWidth={1.25} style={{ color: accentColor }} />
              </div>
            </div>
          )}
          <div
            aria-hidden
            className='pointer-events-none absolute inset-0 bg-gradient-to-t from-[rgba(43,43,43,0.18)] via-[rgba(43,43,43,0.02)] to-transparent'
          />
          <span
            className='pointer-events-none absolute left-2 top-2 z-[1] inline-flex max-w-[calc(100%-1rem)] items-center gap-1 rounded-full border border-[rgba(43,43,43,0.08)] bg-white/90 px-2 py-0.5 text-[10px] font-semibold tracking-tight text-[#2B2B2B] shadow-sm sm:left-3 sm:top-3 sm:gap-1.5 sm:px-2.5 sm:py-1 sm:text-[11px]'
          >
            <span aria-hidden className='size-1.5 shrink-0 rounded-full' style={{ backgroundColor: accentColor }} />
            <span className='truncate'>{visitStoreLabel}</span>
          </span>
        </div>

        <div className='flex items-center justify-between gap-2 border-t border-[rgba(43,43,43,0.06)] bg-[#F5F1EB] px-2.5 py-1.5 sm:px-3 sm:py-2'>
          <p className='min-w-0 flex-1 truncate text-[11px] font-semibold text-[#2B2B2B] sm:text-xs'>{store.displayName}</p>
          <span className='inline-flex max-w-[45%] shrink-0 items-center truncate rounded-full border border-[rgba(43,43,43,0.08)] bg-white px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.06em] text-[#6E6A66] sm:max-w-none sm:px-2 sm:py-1 sm:text-[10px] sm:tracking-[0.08em]'>
            {productCountLabel}
          </span>
        </div>
      </Link>

      <div className='hidden flex-1 flex-col gap-2 px-4 pb-4 pt-1 sm:flex sm:gap-3 sm:px-5 sm:pb-5'>
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
