'use client'

import { Link } from '@/i18n/navigation'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import {
  ProductDetailsPanel,
  type ProductDetailsPanelTranslations,
} from '@/components/dashboard/products/product-details-panel'
import { SheetDetailSkeleton } from '@/components/dashboard/shared/loading-placeholders'
import type { ProductDetailsExtended } from '@/types'
import { storeProductPath } from '@/lib/store-navigation'
import { ArrowUpRight, Download, Package, Plus } from 'lucide-react'

interface ProductViewSheetProps {
  product: ProductDetailsExtended | null
  isLoading?: boolean
  onZoomImage: (url: string) => void
  onAddStock: (product: ProductDetailsExtended) => void
  onDownloadPdf: () => void
  statusLabel: (status: ProductDetailsExtended['status']) => string
  translations: ProductDetailsPanelTranslations & {
    title: string
    empty: string
    loading: string
    addStock: string
    downloadPdf: string
    viewLivePage: string
    viewLivePageDisabled: string
  }
}

export function ProductViewSheet({
  product,
  isLoading = false,
  onZoomImage,
  onAddStock,
  onDownloadPdf,
  statusLabel,
  translations: t,
}: ProductViewSheetProps) {
  const canViewLive = product?.status === 'active'

  return (
    <SheetContent
      side="right"
      className="flex h-full w-full flex-col gap-0 border-stroke-soft-200 bg-white p-0 sm:max-w-[1000px]"
    >
      <SheetHeader className="border-b border-stroke-soft-200 px-6 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <SheetTitle className="truncate text-lg font-semibold text-text-strong-950">
              {product ? product.name : t.title}
            </SheetTitle>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-text-sub-600">
              <span className="inline-flex items-center gap-2">
                <Package className="h-4 w-4 text-text-soft-400" />
                <span className="truncate">{product?.category ?? t.na}</span>
              </span>
              <span className="text-gray-300">•</span>
              <span className="truncate">{product?.vendor ?? t.na}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2" data-hide-print>
            {canViewLive && product ? (
              <Button
                type="button"
                variant="outline"
                asChild
                className="h-9 rounded-lg border-stroke-soft-200 bg-white text-text-sub-600 hover:bg-primary-alpha-10 hover:text-primary-base"
              >
                <Link
                  href={storeProductPath(product.id)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center"
                >
                  <ArrowUpRight className="mr-2 h-4 w-4" />
                  {t.viewLivePage}
                </Link>
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                disabled={!product}
                title={product ? t.viewLivePageDisabled : undefined}
                className="h-9 rounded-lg border-stroke-soft-200 bg-white text-text-sub-600 hover:bg-primary-alpha-10 hover:text-primary-base"
              >
                <ArrowUpRight className="mr-2 h-4 w-4" />
                {t.viewLivePage}
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={() => product && onAddStock(product)}
              disabled={!product}
              className="h-9 rounded-lg border-stroke-soft-200 bg-white text-text-sub-600 hover:bg-primary-alpha-10 hover:text-primary-base"
            >
              <Plus className="mr-2 h-4 w-4" />
              {t.addStock}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onDownloadPdf}
              className="h-9 rounded-lg border-stroke-soft-200 bg-white text-text-sub-600 hover:bg-primary-alpha-10 hover:text-primary-base"
            >
              <Download className="mr-2 h-4 w-4" />
              {t.downloadPdf}
            </Button>
          </div>
        </div>
      </SheetHeader>

      <ScrollArea className="h-full">
        <div className="px-6 py-6">
          {isLoading ? (
            <SheetDetailSkeleton label={t.loading} />
          ) : !product ? (
            <div className="rounded-2xl border border-dashed border-stroke-soft-200 bg-bg-weak-50 p-6 text-sm text-text-sub-600">
              {t.empty}
            </div>
          ) : (
            <ProductDetailsPanel
              product={product}
              onZoomImage={onZoomImage}
              statusLabel={statusLabel}
              translations={t}
            />
          )}
        </div>
      </ScrollArea>
    </SheetContent>
  )
}
