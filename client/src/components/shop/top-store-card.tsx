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
  accentColor = '#1daf61',
  className,
}: TopStoreCardProps) {
  const { store, productCountLabel } = entry
  // Marketplace store profile (same site chrome — not a subdomain tenant website).
  const href = `/stores/${encodeURIComponent(store.subdomain)}`

  return (
    <article
      style={{ ['--store-accent' as string]: accentColor }}
      className={cn(
        'group/card relative isolate flex h-full flex-col overflow-hidden rounded-20 border border-stroke-soft-200 bg-bg-white-0 shadow-soft-card transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-soft-card-hover sm:rounded-[1.25rem]',
        className,
      )}
    >
      <Link
        href={href}
        prefetch={false}
        className='relative mx-1.5 block overflow-hidden rounded-xl bg-bg-soft-200 text-left ring-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-base/40 sm:mx-2 sm:rounded-[1.25rem]'
      >
        <div className='relative aspect-[4/5] w-full overflow-hidden bg-gradient-to-b from-bg-white-0 via-bg-weak-50 to-bg-soft-200'>
          {store.logoUrl ? (
            <img
              src={store.logoUrl}
              alt={store.displayName}
              loading='lazy'
              className='absolute inset-0 size-full object-cover object-center transition-transform duration-500 group-hover/card:scale-[1.03]'
            />
          ) : (
            <div className='absolute inset-0 flex items-center justify-center'>
              <div className='flex size-24 items-center justify-center rounded-2xl border border-stroke-soft-200 bg-bg-white-0 shadow-regular-xs sm:size-28'>
                <Store className='size-14' aria-hidden strokeWidth={1.25} style={{ color: accentColor }} />
              </div>
            </div>
          )}
          <div
            aria-hidden
            className='pointer-events-none absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent'
          />
          <span
            className='pointer-events-none absolute left-2 top-2 z-[1] inline-flex max-w-[calc(100%-1rem)] items-center gap-1 rounded-full border border-stroke-soft-200 bg-bg-white-0/95 px-2 py-0.5 text-[10px] font-semibold tracking-tight text-text-strong-950 shadow-regular-xs sm:left-3 sm:top-3 sm:gap-1.5 sm:px-2.5 sm:py-1 sm:text-[11px]'
          >
            <span aria-hidden className='size-1.5 shrink-0 rounded-full' style={{ backgroundColor: accentColor }} />
            <span className='truncate'>{visitStoreLabel}</span>
          </span>
        </div>

        <div className='flex items-center justify-between gap-2 border-t border-stroke-soft-200 bg-bg-weak-50 px-2.5 py-1.5 sm:px-3 sm:py-2'>
          <p className='min-w-0 flex-1 truncate text-[11px] font-semibold text-text-strong-950 sm:text-xs'>{store.displayName}</p>
          <span className='inline-flex max-w-[45%] shrink-0 items-center truncate rounded-full border border-stroke-soft-200 bg-bg-white-0 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.06em] text-text-sub-600 sm:max-w-none sm:px-2 sm:py-1 sm:text-[10px] sm:tracking-[0.08em]'>
            {productCountLabel}
          </span>
        </div>
      </Link>

      <div className='hidden flex-1 flex-col gap-2 px-4 pb-4 pt-1 sm:flex sm:gap-3 sm:px-5 sm:pb-5'>
        <div className='space-y-1'>
          <p className='text-[10px] font-semibold uppercase tracking-[0.14em] text-[#5c5c5c]'>
            {visitStoreLabel}
          </p>
          <Link href={href} prefetch={false} className='block'>
            <h3 className='line-clamp-2 text-[15px] font-semibold leading-tight tracking-tight text-[#171717] transition-colors duration-300 group-hover/card:[color:var(--store-accent)]'>
              {store.displayName}
            </h3>
          </Link>
        </div>

        <p className='mt-auto text-sm font-medium tabular-nums text-[#5c5c5c]'>{productCountLabel}</p>
      </div>
    </article>
  )
}
