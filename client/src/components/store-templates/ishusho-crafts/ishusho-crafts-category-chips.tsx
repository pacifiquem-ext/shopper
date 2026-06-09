'use client'

import { Link } from '@/i18n/navigation'
import { buildCatalogQueryString, type CatalogFilterParams } from '@/lib/catalog-query'
import { cn } from '@/lib/utils'

type IshushoCraftsCategoryChipsProps = {
  filters: CatalogFilterParams
  categories: Array<{ name: string; total: number }>
  allLabel: string
  filterAria: string
}

const chipClass =
  'inline-flex items-center justify-center rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ic-secondary)]/40'

export function IshushoCraftsCategoryChips({
  filters,
  categories,
  allLabel,
  filterAria,
}: IshushoCraftsCategoryChipsProps) {
  const activeCategory = filters.category?.trim() ?? ''

  const hrefFor = (category: string | null) => {
    const qs = buildCatalogQueryString(filters, { category })
    return qs ? `?${qs}` : '?'
  }

  return (
    <nav className='flex flex-wrap gap-2' aria-label={filterAria}>
      <Link
        href={hrefFor(null)}
        prefetch={false}
        className={cn(
          chipClass,
          !activeCategory
            ? 'ic-cta-primary border border-transparent'
            : 'border border-[var(--ic-border)] bg-[var(--ic-primary-light)]/70 text-[var(--ic-muted)] hover:border-[color-mix(in_srgb,var(--ic-secondary)_30%,transparent)] hover:text-[var(--ic-ink)]',
        )}
        aria-current={!activeCategory ? 'page' : undefined}
      >
        {allLabel}
      </Link>
      {categories.map(({ name, total }) => {
        const isActive = activeCategory === name
        return (
          <Link
            key={name}
            href={hrefFor(name)}
            prefetch={false}
            className={cn(
              chipClass,
              isActive
                ? 'ic-cta-primary border border-transparent'
                : 'border border-[var(--ic-border)] bg-[var(--ic-primary-light)]/70 text-[var(--ic-muted)] hover:border-[color-mix(in_srgb,var(--ic-secondary)_30%,transparent)] hover:text-[var(--ic-ink)]',
            )}
            aria-current={isActive ? 'page' : undefined}
          >
            {name}
            <span className='ml-1.5 tabular-nums opacity-70'>({total})</span>
          </Link>
        )
      })}
    </nav>
  )
}
