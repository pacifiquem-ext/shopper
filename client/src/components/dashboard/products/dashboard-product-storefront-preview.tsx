'use client'

import type { CSSProperties } from 'react'

import {
  ProductDetailsBody,
  ProductDetailsTopBar,
} from '@/components/shop/product-details-body'
import { ishushoCraftsFontClassName } from '@/components/store-templates/ishusho-crafts/ishusho-crafts-fonts'
import {
  ishushoCraftsThemeStyle,
  isIshushoCraftsTemplate,
  isVibrantMarketTemplate,
  resolveStoreTemplate,
  vibrantMarketThemeStyle,
} from '@/lib/store-templates'
import { cn } from '@/lib/utils'
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
  const resolvedTemplate = resolveStoreTemplate(product.store)

  if (isIshushoCraftsTemplate(resolvedTemplate)) {
    const themeStyle = ishushoCraftsThemeStyle() as CSSProperties
    return (
      <div className="overflow-hidden rounded-2xl border border-stroke-soft-200 shadow-sm">
        <p className="border-b border-stroke-soft-200 bg-bg-weak-50 px-4 py-2 text-xs font-medium text-text-sub-600">
          {previewHint}
        </p>
        <div
          className={cn(
            'ic-storefront',
            ishushoCraftsFontClassName,
            'bg-[var(--ic-bg)] font-[family-name:var(--font-ic-sans)] text-[var(--ic-ink)]',
          )}
          style={themeStyle}
        >
          <ProductDetailsTopBar
            theme="ishusho-crafts"
            backLabel={backLabel}
            approvedLabel={approvedLabel}
            backHref={backHref}
          />
          <ProductDetailsBody product={product} theme="ishusho-crafts" preview />
        </div>
      </div>
    )
  }

  if (isVibrantMarketTemplate(resolvedTemplate)) {
    const themeStyle = vibrantMarketThemeStyle() as CSSProperties
    return (
      <div className="overflow-hidden rounded-2xl border border-stroke-soft-200 shadow-sm">
        <p className="border-b border-stroke-soft-200 bg-bg-weak-50 px-4 py-2 text-xs font-medium text-text-sub-600">
          {previewHint}
        </p>
        <div className="vm-storefront min-h-0 bg-[var(--vm-bg)] text-[var(--vm-ink)] antialiased" style={themeStyle}>
          <ProductDetailsTopBar
            theme="vibrant-market"
            backLabel={backLabel}
            approvedLabel={approvedLabel}
            backHref={backHref}
          />
          <ProductDetailsBody product={product} theme="vibrant-market" preview />
        </div>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-stroke-soft-200 shadow-sm">
      <p className="border-b border-stroke-soft-200 bg-bg-weak-50 px-4 py-2 text-xs font-medium text-text-sub-600">
        {previewHint}
      </p>
      <div className="bg-[#f7f7f7] text-[#171717]">
        <ProductDetailsTopBar
          theme="default"
          backLabel={backLabel}
          approvedLabel={approvedLabel}
          backHref={backHref}
        />
        <ProductDetailsBody product={product} theme="default" preview />
      </div>
    </div>
  )
}
