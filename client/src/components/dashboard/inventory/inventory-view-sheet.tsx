'use client'

import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { StockBadge } from '@/components/dashboard/shared/status-badges'
import { SheetDetailSkeleton } from '@/components/dashboard/shared/loading-placeholders'
import type { ProductDetails } from '@/types'
import { Download, Plus, Printer, ShieldCheck, Truck, Warehouse } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { printContent } from '@/utils/print'

interface InventoryViewSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: ProductDetails | null
  onOpenAdjust?: (id: string, mode: 'restock' | 'adjust') => void
  isLoading?: boolean
}

export function InventoryViewSheet({
  open,
  onOpenChange,
  product,
  onOpenAdjust,
  isLoading = false,
}: InventoryViewSheetProps) {
  const t = useTranslations('dashboard')

  const downloadAsPdf = () => {
    if (!product) return
    const el = document.querySelector('[data-product-print]')
    if (!el) return
    printContent(el as HTMLElement)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex h-full w-full flex-col gap-0 border-stroke-soft-200 bg-white p-0 sm:max-w-4xl"
      >
        <SheetHeader className="border-b border-stroke-soft-200 p-5 text-left">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <SheetTitle className="truncate text-lg font-semibold text-text-strong-950">
                {product
                  ? t('inventory.viewSheet.titleWithName', { name: product.name })
                  : t('inventory.viewSheet.title')}
              </SheetTitle>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-text-sub-600">
                <span>{product?.sku ?? t('inventory.table.na')}</span>
                <span className="text-gray-300">•</span>
                <span className="inline-flex items-center gap-1">
                  <Warehouse className="h-4 w-4 text-text-soft-400" />
                  <span className="truncate">{product?.vendor ?? t('inventory.table.na')}</span>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {onOpenAdjust && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => product && onOpenAdjust(product.id, 'restock')}
                  disabled={!product || isLoading}
                  className="h-9 rounded-lg border-stroke-soft-200 bg-white text-text-sub-600 hover:bg-primary-alpha-10 hover:text-primary-base"
                >
                  <Plus className="h-4 w-4" />
                  {t('inventory.viewSheet.addStock')}
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={downloadAsPdf}
                disabled={!product || isLoading}
                className="h-9 rounded-lg border-stroke-soft-200 bg-white text-text-sub-600 hover:bg-primary-alpha-10 hover:text-primary-base"
              >
                <Printer className="h-4 w-4" />
                {t('inventory.viewSheet.downloadPdf')}
              </Button>
            </div>
          </div>

          {product && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <div className="rounded-xl border border-stroke-soft-200 bg-bg-weak-50 px-3 py-2">
                <div className="text-[11px] font-semibold text-text-soft-400">{t('inventory.viewSheet.badges.stock')}</div>
                <div className="mt-1 text-sm font-semibold text-text-strong-950">
                  {t('inventory.viewSheet.stockAvailable', { count: product.stock.available })}
                </div>
              </div>
              <div className="rounded-xl border border-stroke-soft-200 bg-bg-weak-50 px-3 py-2">
                <div className="text-[11px] font-semibold text-text-soft-400">{t('inventory.viewSheet.badges.status')}</div>
                <div className="mt-1">
                  <StockBadge
                    status={product.status}
                    labels={{
                      inStock: t('inventory.status.inStock'),
                      lowStock: t('inventory.status.lowStock'),
                      outOfStock: t('inventory.status.outOfStock'),
                    }}
                  />
                </div>
              </div>
              <div className="rounded-xl border border-stroke-soft-200 bg-bg-weak-50 px-3 py-2">
                <div className="text-[11px] font-semibold text-text-soft-400">{t('inventory.viewSheet.badges.updated')}</div>
                <div className="mt-1 text-sm font-semibold text-text-strong-950">{product.stock.updatedAt}</div>
              </div>
            </div>
          )}
        </SheetHeader>

        <ScrollArea className="h-full">
          {isLoading ? (
            <SheetDetailSkeleton label={t('inventory.viewSheet.loading')} />
          ) : !product ? (
            <div className="p-5">
              <div className="rounded-2xl border border-dashed border-stroke-soft-200 bg-bg-weak-50 p-6 text-center text-sm text-text-sub-600">
                {t('inventory.viewSheet.empty')}
              </div>
            </div>
          ) : (
          <div className="space-y-4 p-5">
            <div data-product-print className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xl font-semibold text-text-strong-950">
                    {product?.name ?? t('inventory.table.na')}
                  </div>
                  <div className="mt-1 text-sm text-text-sub-600">
                    {product
                      ? t('inventory.viewSheet.subtitle', {
                          sku: product.sku,
                          category: product.category,
                        })
                      : ''}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-semibold text-text-soft-400">{t('inventory.viewSheet.available')}</div>
                  <div className="mt-1 text-2xl font-semibold text-text-strong-950">
                    {product?.stock.available ?? 0}
                  </div>
                </div>
              </div>

              <Separator className="my-2" />

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-stroke-soft-200 bg-white p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-text-strong-950">
                    <Warehouse className="h-4 w-4 text-text-sub-600" />
                    {t('inventory.viewSheet.sections.stock')}
                  </div>
                  <div className="mt-3 space-y-2 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-text-soft-400">{t('inventory.viewSheet.fields.onHand')}</span>
                      <span className="font-medium text-text-strong-950">{product?.stock.onHand ?? 0}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-text-soft-400">{t('inventory.viewSheet.fields.reserved')}</span>
                      <span className="font-medium text-text-strong-950">{product?.stock.reserved ?? 0}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-text-soft-400">{t('inventory.viewSheet.fields.available')}</span>
                      <span className="font-medium text-text-strong-950">{product?.stock.available ?? 0}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-text-soft-400">{t('inventory.viewSheet.fields.reorderPoint')}</span>
                      <span className="font-medium text-text-strong-950">{product?.stock.reorderPoint ?? 0}</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-stroke-soft-200 bg-white p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-text-strong-950">
                    <ShieldCheck className="h-4 w-4 text-text-sub-600" />
                    {t('inventory.viewSheet.sections.product')}
                  </div>
                  <div className="mt-3 space-y-2 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-text-soft-400">{t('inventory.viewSheet.fields.sku')}</span>
                      <span className="font-medium text-text-strong-950">{product?.sku ?? t('inventory.table.na')}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-text-soft-400">{t('inventory.viewSheet.fields.category')}</span>
                      <span className="font-medium text-text-strong-950">{product?.category ?? t('inventory.table.na')}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-text-soft-400">{t('inventory.viewSheet.fields.vendor')}</span>
                      <span className="font-medium text-text-strong-950">{product?.vendor ?? t('inventory.table.na')}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-stroke-soft-200 bg-white p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-text-strong-950">
                    {t('inventory.viewSheet.sections.pricing')}
                  </div>
                  <div className="mt-3 space-y-2 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-text-soft-400">{t('inventory.viewSheet.fields.price')}</span>
                      <span className="font-medium text-text-strong-950">{product?.pricing.price ?? t('inventory.table.na')}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-text-soft-400">{t('inventory.viewSheet.fields.cost')}</span>
                      <span className="font-medium text-text-strong-950">{product?.pricing.cost ?? t('inventory.table.na')}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-text-soft-400">{t('inventory.viewSheet.fields.margin')}</span>
                      <span className="font-medium text-text-strong-950">{product?.pricing.margin ?? t('inventory.table.na')}</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-stroke-soft-200 bg-white p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-text-strong-950">
                    <Truck className="h-4 w-4 text-text-sub-600" />
                    {t('inventory.viewSheet.sections.shipping')}
                  </div>
                  <div className="mt-3 space-y-2 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-text-soft-400">{t('inventory.viewSheet.fields.weight')}</span>
                      <span className="font-medium text-text-strong-950">{product?.shipping.weight ?? t('inventory.table.na')}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-text-soft-400">{t('inventory.viewSheet.fields.deliveryEligible')}</span>
                      <span className="font-medium text-text-strong-950">{product?.shipping.deliveryEligible ?? t('inventory.table.na')}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-stroke-soft-200 bg-white p-4">
                  <div className="text-sm font-semibold text-text-strong-950">{t('inventory.viewSheet.sections.staff')}</div>
                  <div className="mt-3 space-y-2 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-text-soft-400">{t('inventory.viewSheet.fields.createdBy')}</span>
                      <span className="font-medium text-text-strong-950">{product?.staff.createdBy ?? t('inventory.table.na')}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-text-soft-400">{t('inventory.viewSheet.fields.updatedBy')}</span>
                      <span className="font-medium text-text-strong-950">{product?.staff.updatedBy ?? t('inventory.table.na')}</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-stroke-soft-200 bg-white p-4">
                  <div className="text-sm font-semibold text-text-strong-950">{t('inventory.viewSheet.sections.notes')}</div>
                  <div className="mt-3 text-sm">
                    <div className="text-xs font-semibold text-text-soft-400">{t('inventory.viewSheet.fields.internalNote')}</div>
                    <div className="mt-1 rounded-xl border border-stroke-soft-200 bg-bg-weak-50 p-3 text-gray-800">
                      {product?.notes.internalNote ?? t('inventory.table.na')}
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-stroke-soft-200 bg-white p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-text-strong-950">
                  <Truck className="h-4 w-4 text-text-sub-600" />
                  {t('inventory.viewSheet.sections.timeline')}
                </div>
                <div className="mt-3 space-y-3">
                  {(product?.events ?? []).map((ev) => (
                    <div key={ev.id} className="flex gap-3">
                      <div className="mt-1 flex flex-col items-center">
                        <div className="h-2.5 w-2.5 rounded-full bg-primary-base" />
                        <div className="mt-1 h-full w-px bg-gray-200" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="text-sm font-semibold text-text-strong-950">{ev.title}</div>
                          <div className="shrink-0 text-xs font-medium text-text-soft-400">{ev.at}</div>
                        </div>
                        {ev.description && <div className="mt-1 text-sm text-text-sub-600">{ev.description}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
          )}
        </ScrollArea>

        <div className="border-t border-stroke-soft-200 bg-white p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-xs font-medium text-text-soft-400">{t('inventory.viewSheet.footerHint')}</div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={downloadAsPdf}
                disabled={!product || isLoading}
                className="h-9 rounded-lg border-stroke-soft-200 bg-white text-text-sub-600 hover:bg-primary-alpha-10 hover:text-primary-base"
              >
                <Download className="h-4 w-4" />
                {t('inventory.viewSheet.downloadPdf')}
              </Button>
              <Button
                type="button"
                onClick={() => onOpenChange(false)}
                className="h-9 rounded-lg bg-primary-base text-white hover:bg-primary-darker"
              >
                {t('inventory.viewSheet.close')}
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
