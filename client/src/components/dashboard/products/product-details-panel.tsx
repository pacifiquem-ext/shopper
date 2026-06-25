'use client'

import { useEffect, useState } from 'react'
import { Package, ZoomIn } from 'lucide-react'

import { ProductStatusBadge } from '@/components/dashboard/shared/status-badges'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import type { ProductDetailsExtended } from '@/types'

export type ProductDetailsPanelTranslations = {
  na: string
  yes: string
  no: string
  zoom: string
  photoThumbAria: (params: { index: number }) => string
  subtitle: (params: { vendor: string; category: string }) => string
  variantsCount: (params: { count: number }) => string
  sections: {
    gallery: string
    pricing: string
    delivery: string
    description: string
    variants: string
    staff: string
  }
  fields: {
    cost: string
    margin: string
    compareAt: string
    deliveryEnabled: string
    deliveryLocation: string
    deliveryPrice: string
    createdBy: string
    updatedBy: string
  }
  table: {
    variant: string
    sku: string
    stock: string
    price: string
  }
}

type ProductDetailsPanelProps = {
  product: ProductDetailsExtended
  onZoomImage: (url: string) => void
  statusLabel: (status: ProductDetailsExtended['status']) => string
  translations: ProductDetailsPanelTranslations
  className?: string
}

export function ProductDetailsPanel({
  product,
  onZoomImage,
  statusLabel,
  translations: t,
  className,
}: ProductDetailsPanelProps) {
  const [activeImage, setActiveImage] = useState(0)

  useEffect(() => {
    setActiveImage(0)
  }, [product.id])

  const gallery = product.images
  const mainImage = gallery[activeImage] ?? gallery[0]

  return (
    <div className={cn('space-y-4', className)} data-product-print>
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row">
          <div className="w-full lg:w-[340px]">
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-gray-50">
              {mainImage ? (
                <img
                  src={mainImage}
                  alt={product.name}
                  className="h-[220px] w-full object-cover sm:h-[280px]"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-[220px] w-full items-center justify-center text-gray-500 sm:h-[280px]">
                  <Package className="h-5 w-5" />
                </div>
              )}
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2" data-hide-print>
              <Button
                type="button"
                variant="outline"
                onClick={() => mainImage && onZoomImage(mainImage)}
                disabled={!mainImage}
                className="h-9 rounded-lg border-gray-200 bg-white text-gray-700 hover:bg-brand-50 hover:text-brand-900"
              >
                <ZoomIn className="mr-2 h-4 w-4" />
                {t.zoom}
              </Button>
            </div>

            {gallery.length > 1 ? (
              <div className="mt-4">
                <div className="text-xs font-semibold text-gray-500">{t.sections.gallery}</div>
                <div className="mt-2 flex gap-2 overflow-x-auto pb-1" data-hide-print>
                  {gallery.map((url, index) => (
                    <button
                      key={`${url}-${index}`}
                      type="button"
                      onClick={() => setActiveImage(index)}
                      className={cn(
                        'relative size-16 shrink-0 overflow-hidden rounded-xl border-2 transition-opacity sm:size-20',
                        index === activeImage
                          ? 'border-brand-900 opacity-100 ring-2 ring-brand-900/20'
                          : 'border-gray-200 opacity-80 hover:opacity-100',
                      )}
                      aria-label={t.photoThumbAria({ index: index + 1 })}
                      aria-current={index === activeImage ? 'true' : undefined}
                    >
                      <img src={url} alt="" className="size-full object-cover" loading="lazy" />
                    </button>
                  ))}
                </div>
              </div>
            ) : gallery.length === 1 ? (
              <div className="mt-4">
                <div className="text-xs font-semibold text-gray-500">{t.sections.gallery}</div>
                <div className="mt-2 grid grid-cols-3 gap-2" data-hide-print>
                  <button
                    type="button"
                    onClick={() => onZoomImage(gallery[0])}
                    className="overflow-hidden rounded-xl border border-gray-200 bg-gray-50"
                  >
                    <img
                      src={gallery[0]}
                      alt={product.name}
                      className="h-16 w-full object-cover"
                      loading="lazy"
                    />
                  </button>
                </div>
              </div>
            ) : null}
          </div>

          <div className="flex-1">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-xl font-semibold text-gray-900">{product.name}</div>
                <div className="mt-1 text-sm text-gray-600">
                  {t.subtitle({
                    vendor: product.vendor,
                    category: product.category,
                  })}
                </div>
              </div>
              <div>
                <ProductStatusBadge status={product.status} label={statusLabel(product.status)} />
              </div>
            </div>

            <Separator className="my-4" />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="text-xs font-semibold text-gray-500">{t.sections.pricing}</div>
                <div className="mt-2 text-lg font-semibold text-gray-900">
                  {product.pricing.priceFrom} - {product.pricing.priceTo}
                </div>
                <div className="mt-3 space-y-2 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-gray-500">{t.fields.cost}</span>
                    <span className="font-medium text-gray-900">{product.pricing.cost || t.na}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-gray-500">{t.fields.margin}</span>
                    <span className="font-medium text-gray-900">{product.pricing.margin || t.na}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-gray-500">{t.fields.compareAt}</span>
                    <span className="font-medium text-gray-900">
                      {product.pricing.compareAt || t.na}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="text-xs font-semibold text-gray-500">{t.sections.delivery}</div>
                <div className="mt-3 space-y-2 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-gray-500">{t.fields.deliveryEnabled}</span>
                    <span className="font-medium text-gray-900">
                      {product.delivery.enabled ? t.yes : t.no}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-gray-500">{t.fields.deliveryLocation}</span>
                    <span className="font-medium text-gray-900">
                      {product.delivery.location || t.na}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-gray-500">{t.fields.deliveryPrice}</span>
                    <span className="font-medium text-gray-900">
                      {product.delivery.price || t.na}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="text-xs font-semibold text-gray-500">{t.sections.description}</div>
        <div className="mt-2 text-sm text-gray-800">
          {product.description || t.na}
        </div>
        {product.tags.length > 0 ? (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {product.tags.map((tag) => (
              <Badge
                key={tag}
                className="rounded-full border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-50"
              >
                {tag}
              </Badge>
            ))}
          </div>
        ) : null}
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div className="text-xs font-semibold text-gray-500">{t.sections.variants}</div>
          <div className="text-xs font-semibold text-gray-700">
            {t.variantsCount({ count: product.variants.length })}
          </div>
        </div>

        <div className="mt-4 overflow-hidden rounded-xl border border-gray-200">
          <div className="grid grid-cols-12 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-600">
            <div className="col-span-5">{t.table.variant}</div>
            <div className="col-span-3">{t.table.sku}</div>
            <div className="col-span-2 text-right">{t.table.stock}</div>
            <div className="col-span-2 text-right">{t.table.price}</div>
          </div>
          <div className="divide-y divide-gray-100">
            {product.variants.map((variant) => (
              <div key={variant.id} className="grid grid-cols-12 px-3 py-3 text-sm">
                <div className="col-span-5 flex min-w-0 items-center gap-2">
                  {variant.color ? (
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full border border-gray-200"
                      style={{ backgroundColor: variant.color.hex }}
                      title={variant.color.name}
                    />
                  ) : null}
                  <div className="truncate font-medium text-gray-900">{variant.title}</div>
                </div>
                <div className="col-span-3 truncate text-gray-700">{variant.sku}</div>
                <div className="col-span-2 text-right font-semibold text-gray-900">
                  {variant.stock}
                </div>
                <div className="col-span-2 text-right font-semibold text-gray-900">
                  {variant.price}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="text-xs font-semibold text-gray-500">{t.sections.staff}</div>
        <div className="mt-3 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
          <div className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
            <span className="text-gray-500">{t.fields.createdBy}</span>
            <span className="font-medium text-gray-900">{product.staff.createdBy}</span>
          </div>
          <div className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
            <span className="text-gray-500">{t.fields.updatedBy}</span>
            <span className="font-medium text-gray-900">{product.staff.updatedBy}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
