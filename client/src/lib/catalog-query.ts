export type CatalogFilterParams = {
  q?: string
  category?: string
  sort?: string
  store?: string
}

/** Build a query string for shop catalog URLs, merging current params with overrides. */
export function buildCatalogQueryString(
  current: CatalogFilterParams,
  overrides: Partial<Record<keyof CatalogFilterParams, string | null | undefined>> = {},
): string {
  const merged: CatalogFilterParams = {
    store: 'store' in overrides ? (overrides.store ?? undefined) : current.store,
    q: 'q' in overrides ? (overrides.q ?? undefined) : current.q,
    category: 'category' in overrides ? (overrides.category ?? undefined) : current.category,
    sort: 'sort' in overrides ? (overrides.sort ?? undefined) : current.sort,
  }

  const params = new URLSearchParams()
  if (merged.store?.trim()) params.set('store', merged.store.trim())
  if (merged.q?.trim()) params.set('q', merged.q.trim())
  if (merged.category?.trim()) params.set('category', merged.category.trim())
  if (merged.sort?.trim() && merged.sort !== 'for-you') params.set('sort', merged.sort.trim())

  return params.toString()
}

export function catalogFiltersActive(filters: CatalogFilterParams): boolean {
  return Boolean(filters.q?.trim() || filters.category?.trim())
}
