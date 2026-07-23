'use client'

import {
  ProductDetailsBody,
  ProductDetailsTopBar,
} from '@/components/shop/product-details-body'
import type { CatalogProductPublic } from '@/services/catalog.service'

type DashboardProductStorefrontPreviewProps = {
  product: CatalogProductPublic
  backHref?: string
  backLabel: string
  approvedLabel: string
  previewHint: string
}

export function DashboardProductStorefrontPreview({
  product,
  backHref = '/dashboard/products',
  backLabel,
  approvedLabel,
  previewHint,
}: DashboardProductStorefrontPreviewProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-stroke-soft-200 shadow-sm">
      <p className="border-b border-stroke-soft-200 bg-bg-weak-50 px-4 py-2 text-xs font-medium text-text-sub-600">
        {previewHint}
      </p>
      <div className="bg-bg-weak-50 text-text-strong-950">
        <ProductDetailsTopBar
          backLabel={backLabel}
          approvedLabel={approvedLabel}
          backHref={backHref}
        />
        <ProductDetailsBody product={product} preview />
      </div>
    </div>
  )
}
