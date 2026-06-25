/** Trending / New arrivals hide when fewer than this many items (avoids a lone card in a wide grid). */
export const catalogSectionMinItems = 2

export function hasCatalogSectionItems(count: number): boolean {
  return count >= catalogSectionMinItems
}

/** Top stores always show when at least one store exists. */
export function hasTopStoresSectionItems(count: number): boolean {
  return count >= 1
}

/** Product grids — four columns on large screens when the row fills evenly. */
export const catalogProductGridClass =
  'grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4'

/** Curated homepage sections — four columns at lg when the row fills evenly. */
export const catalogSectionGridClass =
  'grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4'

const catalogGridGap = 'grid gap-3 sm:gap-4 md:gap-5'

const GRID_COLS = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
} as const

const LG_GRID_COLS = {
  1: 'lg:grid-cols-1',
  2: 'lg:grid-cols-2',
  3: 'lg:grid-cols-3',
  4: 'lg:grid-cols-4',
} as const

type GridColCount = keyof typeof GRID_COLS

/**
 * Picks a column count (≤ item count) so the last row never has exactly one card.
 * e.g. 5 items → 3 cols (3+2), 4 items → 4 cols (one full row).
 */
export function columnsAvoidingOrphan(count: number, maxCols: number): GridColCount {
  const cappedMax = Math.min(4, Math.max(1, maxCols), count) as GridColCount
  if (count <= 1) return 1
  if (count <= cappedMax) return count as GridColCount

  const candidates = [cappedMax, 4, 3, 2].filter(
    (cols, index, all) => cols >= 2 && cols <= count && all.indexOf(cols) === index,
  )

  for (const cols of candidates) {
    const remainder = count % cols
    if (remainder === 0 || remainder >= 2) {
      return cols as GridColCount
    }
  }

  return 2
}

function catalogGridClassesForCount(count: number): string {
  if (count === 1) {
    return `${catalogGridGap} ${GRID_COLS[1]} max-w-xs sm:max-w-sm`
  }
  if (count === 2) {
    return `${catalogGridGap} ${GRID_COLS[2]} max-w-3xl`
  }
  if (count === 3) {
    return `${catalogGridGap} ${GRID_COLS[2]} ${LG_GRID_COLS[3]}`
  }
  if (count === 4) {
    return `${catalogGridGap} ${GRID_COLS[2]} ${LG_GRID_COLS[4]}`
  }
  if (count === 6) {
    return `${catalogGridGap} ${GRID_COLS[2]} ${LG_GRID_COLS[3]}`
  }

  const lgCols = columnsAvoidingOrphan(count, 4)
  const narrowCols = columnsAvoidingOrphan(count, 3)

  if (narrowCols === lgCols) {
    return `${catalogGridGap} ${GRID_COLS[narrowCols]}`
  }

  return `${catalogGridGap} ${GRID_COLS[narrowCols]} ${LG_GRID_COLS[lgCols]}`
}

/** Column count follows item count so the last row is never a single orphan card. */
export function catalogSectionGridClassForCount(count: number): string {
  return catalogGridClassesForCount(count)
}

export function catalogProductGridClassForCount(count: number): string {
  if (count === 1) {
    return `${catalogGridGap} ${GRID_COLS[1]} max-w-sm sm:max-w-md`
  }
  return catalogGridClassesForCount(count)
}
