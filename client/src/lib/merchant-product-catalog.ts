import type { CatalogProductPublic, CatalogStoreSummary } from '@/services/catalog.service'
import type { ProductApi } from '@/services/products.service'
import type { StoreSettingsApi } from '@/services/store-settings.service'

/** Map merchant API product + store settings into the public catalog shape for storefront UI. */
export function merchantProductToCatalog(
  product: ProductApi,
  store: StoreSettingsApi,
): CatalogProductPublic {
  const prices = product.variants.map((v) => v.price).filter((p) => p > 0)
  const compareAts = product.variants
    .map((v) => v.compareAt)
    .filter((c): c is number => c != null && c > 0)

  const storeSummary: CatalogStoreSummary = {
    id: store.id,
    displayName: store.displayName,
    logoUrl: store.logoUrl,
    subdomain: store.subdomain,
    storeTemplate: store.brandColors?.template,
    brandColors: store.brandColors,
    description: store.description,
    currency: 'RWF',
    contactEmail: store.contactEmail,
    contactPhone: store.contactPhone,
  }

  return {
    id: product.id,
    name: product.name,
    description: product.description ?? null,
    vendor: product.vendor,
    category: product.category,
    tags: product.tags ?? [],
    images: product.images ?? [],
    primaryImage: product.primaryImage ?? null,
    deliveryEnabled: product.deliveryEnabled,
    deliveryLocation: product.deliveryLocation ?? null,
    deliveryPrice: product.deliveryPrice ?? null,
    priceFrom: prices.length ? Math.min(...prices) : null,
    compareAtFrom: compareAts.length ? Math.min(...compareAts) : null,
    createdAt: product.createdAt,
    store: storeSummary,
    variants: product.variants.map((v) => ({
      id: v.id,
      sku: v.sku,
      title: v.title,
      colorName: v.colorName ?? null,
      colorHex: v.colorHex ?? null,
      size: v.size ?? null,
      price: v.price,
      compareAt: v.compareAt ?? null,
      inventory: v.inventory
        ? {
            available: v.inventory.available,
            status: v.inventory.status,
          }
        : undefined,
    })),
  }
}
