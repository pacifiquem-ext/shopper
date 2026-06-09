'use client'

import { Search } from 'lucide-react'
import { useCallback, useEffect, useRef, useTransition } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { usePathname, useRouter } from '@/i18n/navigation'
import { buildCatalogQueryString, type CatalogFilterParams } from '@/lib/catalog-query'
import { cn } from '@/lib/utils'
import type { ShopCatalogFiltersLabels } from '@/components/shop/shop-catalog-filters'

type CategoryOption = { name: string; total: number }

type VibrantMarketCatalogFiltersProps = {
  filters: CatalogFilterParams
  categories: CategoryOption[]
  labels: ShopCatalogFiltersLabels
  categoriesLabel: string
  resetPath?: string
  /** Hide "Search" / "Sort" labels above fields; placeholder only on search input. */
  compactLabels?: boolean
}

export function VibrantMarketCatalogFilters({
  filters,
  categories,
  labels,
  categoriesLabel,
  resetPath = '/',
  compactLabels = false,
}: VibrantMarketCatalogFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()
  const searchInputRef = useRef<HTMLInputElement>(null)

  const navigate = useCallback(
    (overrides: Partial<Record<keyof CatalogFilterParams, string | null | undefined>>) => {
      const qs = buildCatalogQueryString(filters, overrides)
      const href = qs ? `${pathname}?${qs}` : pathname
      startTransition(() => {
        router.push(href as Parameters<typeof router.push>[0])
        router.refresh()
      })
    },
    [filters, pathname, router],
  )

  const clearSearchAndGoHome = useCallback(() => {
    if (!filters.q?.trim()) return
    const qs = buildCatalogQueryString(
      { store: filters.store },
      { q: null, category: null, sort: null },
    )
    const href = qs ? `${resetPath}?${qs}` : resetPath
    startTransition(() => {
      router.push(href as Parameters<typeof router.push>[0])
      router.refresh()
    })
  }, [filters.q, filters.store, resetPath, router])

  useEffect(() => {
    const el = searchInputRef.current
    if (!el) return
    const onNativeSearch = () => {
      if (el.value === '') clearSearchAndGoHome()
    }
    el.addEventListener('search', onNativeSearch)
    return () => el.removeEventListener('search', onNativeSearch)
  }, [clearSearchAndGoHome])

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    const q = (form.elements.namedItem('q') as HTMLInputElement).value
    const sort = (form.elements.namedItem('sort') as HTMLSelectElement).value
    navigate({ q: q.trim() || null, sort: sort || null })
  }

  const activeCategory = filters.category?.trim().toLowerCase() ?? ''

  const categoryButtonClass = (active: boolean) =>
    cn(
      'relative h-auto min-h-10 w-full justify-start rounded-xl border px-3 py-2.5 text-left text-sm font-semibold transition-colors',
      active
        ? 'border-[var(--vm-secondary)]/40 bg-[color-mix(in_srgb,var(--vm-secondary)_14%,var(--vm-surface))] pl-3.5 text-[var(--vm-secondary)] shadow-none ring-1 ring-[var(--vm-secondary)]/20 before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:rounded-full before:bg-[var(--vm-secondary)]'
        : 'border-[var(--vm-border)] bg-[var(--vm-surface)] text-[var(--vm-ink)] hover:border-[var(--vm-secondary)]/30 hover:bg-[var(--vm-primary-light)]',
    )

  return (
    <div className={cn('space-y-6', isPending && 'opacity-80')} aria-busy={isPending}>
      <form onSubmit={handleSubmit} className='space-y-4'>
        <div className='space-y-2'>
          <Label
            htmlFor='vm-catalog-q'
            className={cn(
              'flex items-center gap-2 text-sm font-semibold text-[var(--vm-ink)]',
              compactLabels && 'sr-only',
            )}
          >
            <Search className='size-4 text-[var(--vm-secondary)]' aria-hidden />
            {labels.searchLabel}
          </Label>
          <Input
            ref={searchInputRef}
            id='vm-catalog-q'
            name='q'
            type='search'
            placeholder={labels.searchPlaceholder}
            defaultValue={filters.q ?? ''}
            autoComplete='off'
            onChange={(event) => {
              if (event.target.value === '') clearSearchAndGoHome()
            }}
            className='h-11 rounded-xl border-[var(--vm-border)] bg-[var(--vm-bg)] text-[var(--vm-ink)] placeholder:text-[var(--vm-muted)] focus-visible:border-[var(--vm-secondary)] focus-visible:ring-[var(--vm-secondary)]/25'
          />
        </div>

        <div className='space-y-2'>
          <select
            id='vm-catalog-sort'
            name='sort'
            aria-label={labels.sortLabel}
            defaultValue={filters.sort ?? 'newest'}
            className='h-11 w-full rounded-xl border border-[var(--vm-border)] bg-[var(--vm-bg)] px-3 text-sm font-medium text-[var(--vm-ink)]'
          >
            <option value='newest'>{labels.sortNewest}</option>
            <option value='trending'>{labels.sortTrending}</option>
            <option value='price-asc'>{labels.sortPriceLow}</option>
            <option value='price-desc'>{labels.sortPriceHigh}</option>
          </select>
        </div>

        <Button
          type='submit'
          disabled={isPending}
          className='h-11 w-full rounded-xl bg-[var(--vm-secondary)] font-bold text-[var(--vm-on-primary)] shadow-[0_8px_22px_color-mix(in_srgb,var(--vm-secondary)_28%,transparent)] hover:brightness-105 disabled:opacity-70'
        >
          {labels.applyFilters}
        </Button>
      </form>

      <div className='space-y-3 border-t border-[var(--vm-border)] pt-5'>
        <p className='text-xs font-bold uppercase tracking-[0.14em] text-[var(--vm-secondary)]'>{categoriesLabel}</p>
        <div className='flex max-h-[min(24rem,50vh)] flex-col gap-2 overflow-y-auto pr-0.5'>
          <Button
            type='button'
            variant='ghost'
            disabled={isPending}
            onClick={() => navigate({ category: null })}
            className={categoryButtonClass(!activeCategory)}
          >
            {labels.allCategories}
          </Button>
          {categories.map((item) => {
            const isActive = activeCategory === item.name.toLowerCase()
            return (
              <Button
                key={item.name}
                type='button'
                variant='ghost'
                disabled={isPending}
                onClick={() => navigate({ category: item.name })}
                className={categoryButtonClass(isActive)}
              >
                <span className='flex w-full items-center justify-between gap-2'>
                  <span className='truncate'>{item.name}</span>
                  <span
                    className={cn(
                      'shrink-0 tabular-nums text-xs',
                      isActive
                        ? 'rounded-md bg-[var(--vm-secondary)]/15 px-1.5 py-0.5 font-bold text-[var(--vm-secondary)]'
                        : 'text-[var(--vm-muted)]',
                    )}
                  >
                    {item.total}
                  </span>
                </span>
              </Button>
            )
          })}
        </div>
      </div>

      {isPending ? (
        <span className='sr-only' aria-live='polite'>
          Loading
        </span>
      ) : null}
    </div>
  )
}
