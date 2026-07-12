'use client'

import { Search } from 'lucide-react'
import { useLocale } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useTransition } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { usePathname } from '@/i18n/navigation'
import { buildCatalogQueryString, type CatalogFilterParams } from '@/lib/catalog-query'
import { cn } from '@/lib/utils'

export type ShopCatalogFiltersLabels = {
  searchLabel: string
  searchPlaceholder: string
  sortLabel: string
  sortNewest: string
  sortTrending: string
  sortPriceLow: string
  sortPriceHigh: string
  applyFilters: string
  allCategories: string
}

type CategoryOption = { name: string; total: number }

interface ShopCatalogFiltersProps {
  filters: CatalogFilterParams
  categories: CategoryOption[]
  labels: ShopCatalogFiltersLabels
  /** Where to navigate when the search field is cleared (e.g. home `/`). */
  resetPath?: string
  /** Hide visible search/sort labels; search uses placeholder only. */
  compactSearch?: boolean
}

export function ShopCatalogFilters({
  filters,
  categories,
  labels,
  resetPath = '/',
  compactSearch = false,
}: ShopCatalogFiltersProps) {
  /** next/navigation preserves query strings; next-intl router can drop them. */
  const router = useRouter()
  const pathname = usePathname()
  const locale = useLocale()
  const [isPending, startTransition] = useTransition()
  const searchInputRef = useRef<HTMLInputElement>(null)

  const toLocaleHref = useCallback(
    (path: string, qs: string) => {
      const bare = path.startsWith('/') ? path : `/${path}`
      const withLocale =
        bare === '/'
          ? `/${locale}`
          : bare.startsWith(`/${locale}`) || bare.startsWith(`/${locale}/`)
            ? bare
            : `/${locale}${bare}`
      return qs ? `${withLocale}?${qs}` : withLocale
    },
    [locale],
  )

  const navigate = useCallback(
    (overrides: Partial<Record<keyof CatalogFilterParams, string | null | undefined>>) => {
      const qs = buildCatalogQueryString(filters, overrides)
      const href = toLocaleHref(pathname || '/', qs)
      startTransition(() => {
        // Typed routes don't model dynamic query strings; cast is intentional.
        router.push(href as never)
        router.refresh()
      })
    },
    [filters, pathname, router, toLocaleHref],
  )

  const clearSearchAndGoHome = useCallback(() => {
    if (!filters.q?.trim()) return
    const qs = buildCatalogQueryString(
      { store: filters.store },
      { q: null, category: null, sort: null },
    )
    const href = toLocaleHref(resetPath || '/', qs)
    startTransition(() => {
      router.push(href as never)
      router.refresh()
    })
  }, [filters.q, filters.store, resetPath, router, toLocaleHref])

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

  return (
    <section
      className={cn(
        'rounded-20 border border-stroke-soft-200 bg-bg-white-0 p-3 shadow-regular-xs sm:rounded-[1.25rem] sm:p-4',
        isPending && 'opacity-80',
      )}
      aria-busy={isPending}
    >
      <form
        method='get'
        onSubmit={handleSubmit}
        className='grid gap-3 lg:grid-cols-[1fr_auto_auto] lg:items-end'
      >
        <div className='space-y-2'>
          <Label
            htmlFor='catalog-q'
            className={cn(
              'flex items-center gap-2 text-[#171717]',
              compactSearch && 'sr-only',
            )}
          >
            <Search className='size-4 text-[#5c5c5c]' aria-hidden />
            {labels.searchLabel}
          </Label>
          <Input
            ref={searchInputRef}
            id='catalog-q'
            name='q'
            type='search'
            placeholder={labels.searchPlaceholder}
            defaultValue={filters.q ?? ''}
            autoComplete='off'
            onChange={(event) => {
              if (event.target.value === '') clearSearchAndGoHome()
            }}
            className='h-11 rounded-2xl border-stroke-soft-200 bg-bg-weak-50 text-text-strong-950 placeholder:text-text-soft-400 shadow-none sm:h-12'
          />
        </div>
        <div className='grid grid-cols-1 gap-3 min-[480px]:grid-cols-[1fr_auto] lg:contents'>
          <div className='space-y-2 lg:contents'>
            <select
              id='catalog-sort'
              name='sort'
              aria-label={labels.sortLabel}
              defaultValue={filters.sort ?? 'newest'}
              className='h-11 w-full min-w-0 rounded-2xl border border-stroke-soft-200 bg-bg-weak-50 px-4 text-sm text-text-strong-950 sm:h-12'
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
            className='h-11 w-full rounded-2xl bg-primary-base px-7 text-static-white shadow-regular-xs hover:bg-primary-darker disabled:opacity-70 min-[480px]:w-auto sm:h-12 lg:w-auto'
          >
            {labels.applyFilters}
          </Button>
        </div>
      </form>

      <div className='mt-4 flex gap-2 overflow-x-auto pb-1 sm:mt-5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'>
        <Button
          type='button'
          variant={!activeCategory ? 'default' : 'outline'}
          disabled={isPending}
          aria-pressed={!activeCategory}
          onClick={() => navigate({ category: null })}
          className={cn(
            'shrink-0 rounded-full shadow-none',
            !activeCategory
              ? 'bg-primary-base text-static-white hover:bg-primary-darker'
              : 'border-stroke-soft-200 bg-bg-white-0 text-text-sub-600 hover:bg-bg-weak-50 hover:text-text-strong-950',
          )}
        >
          {labels.allCategories}
        </Button>
        {categories.map((item) => {
          const isActive = activeCategory === item.name.toLowerCase()
          return (
            <Button
              key={item.name}
              type='button'
              variant={isActive ? 'default' : 'outline'}
              disabled={isPending}
              aria-pressed={isActive}
              onClick={() => navigate({ category: item.name })}
              className={cn(
                'shrink-0 rounded-full shadow-none',
                isActive
                  ? 'bg-primary-base text-static-white hover:bg-primary-darker'
                  : 'border-stroke-soft-200 bg-bg-white-0 text-text-sub-600 hover:bg-bg-weak-50 hover:text-text-strong-950',
              )}
            >
              {item.name} <span className='ml-1 text-text-soft-400'>({item.total})</span>
            </Button>
          )
        })}
      </div>
      {isPending ? (
        <span className='sr-only' aria-live='polite'>
          Loading
        </span>
      ) : null}
    </section>
  )
}
