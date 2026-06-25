import { Store } from 'lucide-react'

import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/utils'

import type { TopStoreEntry } from '@/components/shop/top-stores-section'

type VibrantMarketTopStoreCardProps = {
  entry: TopStoreEntry
  visitStoreLabel: string
  className?: string
}

export function VibrantMarketTopStoreCard({
  entry,
  visitStoreLabel,
  className,
}: VibrantMarketTopStoreCardProps) {
  const { store, productCountLabel } = entry
  const href = `/?store=${encodeURIComponent(store.subdomain)}`

  return (
    <article
      className={cn(
        'group/card flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--vm-border)]/80 bg-[var(--vm-surface)] shadow-[0_1px_3px_rgba(15,23,42,0.05),0_6px_16px_rgba(15,23,42,0.04)] transition-[transform,box-shadow,border-color] hover:-translate-y-0.5 hover:border-[var(--vm-border)] hover:shadow-[0_4px_12px_rgba(15,23,42,0.07),0_12px_24px_rgba(15,23,42,0.05)]',
        className,
      )}
    >
      <Link
        href={href}
        prefetch={false}
        className='relative mx-1.5 block overflow-hidden rounded-xl bg-gradient-to-br from-[var(--vm-primary-light)] to-[var(--vm-bg)] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--vm-primary)] sm:mx-2'
      >
        <div className='relative aspect-[4/5] w-full overflow-hidden bg-gradient-to-br from-[var(--vm-primary-light)] to-[var(--vm-bg)]'>
          {store.logoUrl ? (
            <img
              src={store.logoUrl}
              alt={store.displayName}
              loading='lazy'
              className='absolute inset-0 size-full object-cover object-center transition-transform duration-500 group-hover/card:scale-[1.03]'
            />
          ) : (
            <div className='absolute inset-0 flex items-center justify-center'>
              <div className='flex size-24 items-center justify-center rounded-2xl bg-[var(--vm-surface)] shadow-[0_8px_24px_rgba(0,0,0,0.22)] ring-1 ring-[var(--vm-secondary)]/18 sm:size-28'>
                <Store
                  className='size-14 text-[var(--vm-secondary)]'
                  aria-hidden
                  strokeWidth={1.25}
                />
              </div>
            </div>
          )}
          <div
            aria-hidden
            className='pointer-events-none absolute inset-0 bg-gradient-to-t from-[rgba(15,23,42,0.22)] via-[rgba(15,23,42,0.04)] to-transparent'
          />
        </div>
      </Link>

      <div className='flex flex-1 flex-col gap-2 px-3 pb-3 pt-1 sm:px-4 sm:pb-4'>
        <h3 className='line-clamp-2 text-sm font-black text-[var(--vm-ink)] sm:text-base'>
          {store.displayName}
        </h3>
        <p className='text-xs font-medium text-[var(--vm-muted)]'>{productCountLabel}</p>
        <Link
          href={href}
          prefetch={false}
          className='mt-auto inline-flex h-10 items-center justify-center rounded-xl bg-[var(--vm-secondary)] px-4 text-xs font-bold text-[var(--vm-on-primary)] shadow-[0_6px_18px_color-mix(in_srgb,var(--vm-secondary)_28%,transparent)] transition-colors hover:brightness-105'
        >
          {visitStoreLabel}
        </Link>
      </div>
    </article>
  )
}
