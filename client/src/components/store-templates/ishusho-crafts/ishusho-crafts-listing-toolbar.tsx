'use client'

import { useCallback, useEffect, useRef, useTransition } from 'react'

import type { ShopCatalogFiltersLabels } from '@/components/shop/shop-catalog-filters'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { usePathname, useRouter } from '@/i18n/navigation'
import { buildCatalogQueryString, type CatalogFilterParams } from '@/lib/catalog-query'
import { cn } from '@/lib/utils'

const fieldClass =
  'h-11 rounded-lg border border-[var(--ic-border)] bg-[var(--ic-primary-light)] !text-[var(--ic-ink)] shadow-none ring-0 placeholder:!text-[var(--ic-muted)] focus-visible:border-[color-mix(in_srgb,var(--ic-secondary)_45%,transparent)] focus-visible:ring-2 focus-visible:ring-[var(--ic-secondary)]/30'

type IshushoCraftsListingToolbarProps = {
  filters: CatalogFilterParams
  labels: ShopCatalogFiltersLabels
  resetPath?: string
}

export function IshushoCraftsListingToolbar({
  filters,
  labels,
  resetPath = '/',
}: IshushoCraftsListingToolbarProps) {
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
    navigate({ q: q.trim() || null })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        'flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3',
        isPending && 'opacity-80',
      )}
      aria-busy={isPending}
    >
      <div className='min-w-0 flex-1'>
        <Label htmlFor='ic-listing-q' className='sr-only'>
          {labels.searchLabel}
        </Label>
        <Input
          ref={searchInputRef}
          id='ic-listing-q'
          name='q'
          type='search'
          placeholder={labels.searchPlaceholder}
          defaultValue={filters.q ?? ''}
          autoComplete='off'
          onChange={(event) => {
            if (event.target.value === '') clearSearchAndGoHome()
          }}
          className={fieldClass}
        />
      </div>
      <Button type='submit' disabled={isPending} className='ic-cta-primary h-11 shrink-0 rounded-lg border-0 px-5 text-sm font-semibold sm:w-auto'>
        {labels.applyFilters}
      </Button>
    </form>
  )
}
