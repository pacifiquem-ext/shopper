'use client'

import { Search } from 'lucide-react'
import { useCallback, useEffect, useRef, useTransition } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { usePathname, useRouter } from '@/i18n/navigation'
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

  return (
    <section
      className={cn(
        'rounded-2xl border border-[rgba(43,43,43,0.08)] bg-white/60 p-3 shadow-[0_1px_2px_rgba(43,43,43,0.03)] backdrop-blur-md sm:rounded-[2rem] sm:p-4',
        isPending && 'opacity-80',
      )}
      aria-busy={isPending}
    >
      <form onSubmit={handleSubmit} className='grid gap-3 lg:grid-cols-[1fr_auto_auto] lg:items-end'>
        <div className='space-y-2'>
          <Label
            htmlFor='catalog-q'
            className={cn(
              'flex items-center gap-2 text-[#2B2B2B]',
              compactSearch && 'sr-only',
            )}
          >
            <Search className='size-4 text-[#6E6A66]' aria-hidden />
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
            className='h-11 rounded-2xl border-[rgba(43,43,43,0.08)] bg-[#EAE4DC]/60 text-[#2B2B2B] placeholder:text-[#6E6A66] sm:h-12'
          />
        </div>
        <div className='grid grid-cols-1 gap-3 min-[480px]:grid-cols-[1fr_auto] lg:contents'>
          <div className='space-y-2 lg:contents'>
            <select
              id='catalog-sort'
              name='sort'
              aria-label={labels.sortLabel}
              defaultValue={filters.sort ?? 'newest'}
              className='h-11 w-full min-w-0 rounded-2xl border border-[rgba(43,43,43,0.08)] bg-[#EAE4DC]/60 px-4 text-sm text-[#2B2B2B] sm:h-12'
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
            className='h-11 w-full rounded-2xl bg-[#B76E5D] px-7 text-white shadow-[0_8px_22px_rgba(183,110,93,0.25)] hover:bg-[#A66250] disabled:opacity-70 min-[480px]:w-auto sm:h-12 lg:w-auto'
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
          onClick={() => navigate({ category: null })}
          className={cn(
            'shrink-0 rounded-full',
            !activeCategory
              ? 'bg-[#B76E5D] text-white shadow-[0_4px_14px_rgba(183,110,93,0.25)] hover:bg-[#A66250]'
              : 'border-[rgba(43,43,43,0.08)] bg-white/60 text-[#2B2B2B] backdrop-blur-md hover:bg-white/85 hover:text-[#2B2B2B]',
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
              onClick={() => navigate({ category: item.name })}
              className={cn(
                'shrink-0 rounded-full',
                isActive
                  ? 'bg-[#B76E5D] text-white shadow-[0_4px_14px_rgba(183,110,93,0.25)] hover:bg-[#A66250]'
                  : 'border-[rgba(43,43,43,0.08)] bg-white/60 text-[#2B2B2B] backdrop-blur-md hover:bg-white/85 hover:text-[#2B2B2B]',
              )}
            >
              {item.name} <span className='ml-1 text-[#6E6A66]'>({item.total})</span>
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
