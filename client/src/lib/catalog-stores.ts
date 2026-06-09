import type { CatalogProductPublic, CatalogStoreSummary } from '@/services/catalog.service'
import type { TopStoreEntry } from '@/components/shop/top-stores-section'

export function buildTopStoresFromProducts(
  products: CatalogProductPublic[],
  limit = 4,
): Omit<TopStoreEntry, 'productCountLabel'>[] {
  const counts = new Map<string, { store: CatalogStoreSummary; productCount: number }>()

  for (const product of products) {
    const existing = counts.get(product.store.id)
    if (existing) {
      existing.productCount += 1
    } else {
      counts.set(product.store.id, { store: product.store, productCount: 1 })
    }
  }

  return [...counts.values()]
    .sort((a, b) => b.productCount - a.productCount)
    .slice(0, limit)
}

export function withTopStoreProductCountLabels(
  entries: Omit<TopStoreEntry, 'productCountLabel'>[],
  formatLabel: (count: number) => string,
): TopStoreEntry[] {
  return entries.map((entry) => ({
    ...entry,
    productCountLabel: formatLabel(entry.productCount),
  }))
}
