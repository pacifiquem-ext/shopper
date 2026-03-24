'use client'

import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { ProductStatusBadge } from '@/components/dashboard/shared/status-badges'
import type { ProductDetailsExtended } from '@/types'
import { Download, Package, Plus, ZoomIn, Badge as BadgeIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface ProductViewSheetProps {
  product: ProductDetailsExtended | null
  onZoomImage: (url: string) => void
  onAddStock: (product: ProductDetailsExtended) => void
  onDownloadPdf: () => void
  statusLabel: (status: any) => string
  translations: {
    title: string
    subtitle: (params: { vendor: string; category: string }) => string
    empty: string
    na: string
    yes: string
    no: string
    addStock: string
    downloadPdf: string
    zoom: string
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
}

export function ProductViewSheet({
  product,
  onZoomImage,
  onAddStock,
  onDownloadPdf,
  statusLabel,
  translations: t,
}: ProductViewSheetProps) {
  return (
    <SheetContent
      side="right"
      className="flex h-full w-full flex-col gap-0 border-gray-200 bg-white p-0 sm:max-w-[1000px]"
    >
      <SheetHeader className="border-b border-gray-100 px-6 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <SheetTitle className="truncate text-lg font-semibold text-gray-900">
              {product ? product.name : t.title}
            </SheetTitle>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-gray-600">
              <span className="inline-flex items-center gap-2">
                <Package className="h-4 w-4 text-gray-500" />
                <span className="truncate">{product?.category ?? t.na}</span>
              </span>
              <span className="text-gray-300">•</span>
              <span className="truncate">{product?.vendor ?? t.na}</span>
            </div>
          </div>

          <div className="flex items-center gap-2" data-hide-print>
            <Button
              type="button"
              variant="outline"
              onClick={() => product && onAddStock(product)}
              disabled={!product}
              className="h-9 rounded-lg border-gray-200 bg-white text-gray-700 hover:bg-brand-50 hover:text-brand-900"
            >
              <Plus className="mr-2 h-4 w-4" />
              {t.addStock}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onDownloadPdf}
              className="h-9 rounded-lg border-gray-200 bg-white text-gray-700 hover:bg-brand-50 hover:text-brand-900"
            >
              <Download className="mr-2 h-4 w-4" />
              {t.downloadPdf}
            </Button>
          </div>
        </div>
      </SheetHeader>

      <ScrollArea className="h-full">
        <div className="px-6 py-6" data-product-print>
          {!product ? (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-6 text-sm text-gray-600">
              {t.empty}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row">
                  <div className="w-full lg:w-[340px]">
                    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-gray-50">
                      {product.images[0] ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="h-[220px] w-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-[220px] w-full items-center justify-center text-gray-500">
                          <Package className="h-5 w-5" />
                        </div>
                      )}
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-2" data-hide-print>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => product.images[0] && onZoomImage(product.images[0])}
                        disabled={!product.images[0]}
                        className="h-9 rounded-lg border-gray-200 bg-white text-gray-700 hover:bg-brand-50 hover:text-brand-900"
                      >
                        <ZoomIn className="mr-2 h-4 w-4" />
                        {t.zoom}
                      </Button>
                    </div>

                    <div className="mt-4">
                      <div className="text-xs font-semibold text-gray-500">{t.sections.gallery}</div>
                      <div className="mt-2 grid grid-cols-3 gap-2" data-hide-print>
                        {product.images.slice(0, 6).map((url) => (
                          <button
                            key={url}
                            type="button"
                            onClick={() => onZoomImage(url)}
                            className="overflow-hidden rounded-xl border border-gray-200 bg-gray-50"
                          >
                            <img
                              src={url}
                              alt={product.name}
                              className="h-16 w-full object-cover"
                              loading="lazy"
                            />
                          </button>
                        ))}
                      </div>
                    </div>
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
                            <span className="font-medium text-gray-900">
                              {product.pricing.cost || t.na}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-gray-500">{t.fields.margin}</span>
                            <span className="font-medium text-gray-900">
                              {product.pricing.margin || t.na}
                            </span>
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
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-semibold text-gray-500">{t.sections.description}</div>
                    <div className="mt-2 text-sm text-gray-800">{product.description}</div>
                  </div>
                </div>
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
                    {product.variants.map((v) => (
                      <div key={v.id} className="grid grid-cols-12 px-3 py-3 text-sm">
                        <div className="col-span-5 flex min-w-0 items-center gap-2">
                          {v.color ? (
                            <span
                              className="h-2.5 w-2.5 shrink-0 rounded-full border border-gray-200"
                              style={{ backgroundColor: v.color.hex }}
                              title={v.color.name}
                            />
                          ) : null}
                          <div className="truncate font-medium text-gray-900">{v.title}</div>
                        </div>
                        <div className="col-span-3 truncate text-gray-700">{v.sku}</div>
                        <div className="col-span-2 text-right font-semibold text-gray-900">{v.stock}</div>
                        <div className="col-span-2 text-right font-semibold text-gray-900">{v.price}</div>
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
          )}
        </div>
      </ScrollArea>
    </SheetContent>
  )
}
