import type { ProductDetailsExtended, ProductStatus } from '@/types'
import type { ProductApi } from '@/services/products.service'

function mapProductStatus(s: string): ProductStatus {
  if (s === 'DRAFT') return 'draft'
  if (s === 'ARCHIVED') return 'archived'
  return 'active'
}

function formatMoney(value: number): string {
  return value.toLocaleString(undefined, { maximumFractionDigits: 0 })
}

export function apiToProductDetails(product: ProductApi): ProductDetailsExtended {
  const prices = product.variants.map((v) => v.price).filter((x) => x > 0)
  const minPrice = prices.length ? Math.min(...prices) : 0
  const maxPrice = prices.length ? Math.max(...prices) : 0
  const priceFrom = prices.length === 0 ? '—' : formatMoney(minPrice)
  const priceTo = prices.length === 0 ? '—' : formatMoney(maxPrice)

  const firstVariant = product.variants[0]
  const firstCost = product.variants.find((v) => v.cost != null)?.cost
  const costStr = firstCost != null ? formatMoney(firstCost) : undefined
  const marginStr =
    firstCost != null && (firstVariant?.price ?? 0) > 0
      ? `${Math.round((((firstVariant?.price ?? 0) - firstCost) / (firstVariant?.price ?? 1)) * 100)}%`
      : undefined

  const compareAt = product.variants.find((v) => v.compareAt != null)?.compareAt
  const compareAtStr = compareAt != null ? formatMoney(compareAt) : undefined

  const images =
    product.images && product.images.length > 0
      ? product.images
      : product.primaryImage
        ? [product.primaryImage]
        : []

  return {
    id: product.id,
    name: product.name,
    vendor: product.vendor,
    category: product.category,
    status: mapProductStatus(product.status),
    description: product.description ?? '',
    tags: product.tags ?? [],
    images,
    variants: product.variants.map((variant) => ({
      id: variant.id,
      title: variant.title,
      sku: variant.sku,
      color: variant.colorName
        ? { name: variant.colorName, hex: variant.colorHex ?? '#000000' }
        : undefined,
      size: variant.size,
      stock: variant.inventory?.onHand ?? 0,
      price: formatMoney(variant.price),
    })),
    pricing: {
      priceFrom,
      priceTo,
      cost: costStr,
      margin: marginStr,
      compareAt: compareAtStr,
    },
    delivery: {
      enabled: product.deliveryEnabled,
      location: product.deliveryLocation,
      price: product.deliveryPrice != null ? formatMoney(product.deliveryPrice) : undefined,
    },
    staff: {
      createdBy: '—',
      updatedBy: '—',
    },
    notes: {},
    updatedAt: new Date(product.updatedAt).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }),
  }
}
