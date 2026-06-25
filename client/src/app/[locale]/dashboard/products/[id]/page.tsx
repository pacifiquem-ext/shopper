'use client'

import type { Route } from 'next'
import { ArrowUpRight, ChevronLeft, Edit, Plus } from 'lucide-react'
import { LoaderPanel } from '@/components/ui/turning-zero-loader'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { ImageZoomDialog } from '@/components/dashboard/shared/image-zoom-dialog'
import { ProductDetailsPanel } from '@/components/dashboard/products/product-details-panel'
import { ProductStatusBadge } from '@/components/dashboard/shared/status-badges'
import { Button } from '@/components/ui/button'
import { Link, useRouter } from '@/i18n/navigation'
import { apiToProductDetails } from '@/lib/merchant-product-details'
import { extractEntity } from '@/lib/api-response'
import { storeProductPath } from '@/lib/store-navigation'
import { toBaseSku } from '@/utils/dashboard'
import type { ProductStatus } from '@/types'
import { productsService, type ProductApi } from '@/services/products.service'

function mapProductStatus(s: string): ProductStatus {
  if (s === 'DRAFT') return 'draft'
  if (s === 'ARCHIVED') return 'archived'
  return 'active'
}

export default function DashboardProductDetailPage() {
  const t = useTranslations('dashboard')
  const router = useRouter()
  const params = useParams()
  const productId = typeof params.id === 'string' ? params.id : ''

  const [product, setProduct] = useState<ProductApi | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [zoomOpen, setZoomOpen] = useState(false)
  const [zoomUrl, setZoomUrl] = useState('')

  const statusLabel = useCallback(
    (s: ProductStatus) => {
      if (s === 'active') return t('products.status.active')
      if (s === 'draft') return t('products.status.draft')
      return t('products.status.archived')
    },
    [t],
  )

  const viewSheetTranslations = useMemo(
    () => ({
      title: t('products.viewSheet.title'),
      empty: t('products.viewSheet.empty'),
      na: t('products.table.na'),
      yes: t('products.viewSheet.yes'),
      no: t('products.viewSheet.no'),
      zoom: t('products.viewSheet.zoom'),
      photoThumbAria: (params: { index: number }) =>
        t('products.viewSheet.photoThumbAria', params),
      subtitle: (params: { vendor: string; category: string }) =>
        t('products.viewSheet.subtitle', params),
      variantsCount: (params: { count: number }) =>
        t('products.viewSheet.variantsCount', params),
      sections: {
        gallery: t('products.viewSheet.sections.gallery'),
        pricing: t('products.viewSheet.sections.pricing'),
        delivery: t('products.viewSheet.sections.delivery'),
        description: t('products.viewSheet.sections.description'),
        variants: t('products.viewSheet.sections.variants'),
        staff: t('products.viewSheet.sections.staff'),
      },
      fields: {
        cost: t('products.viewSheet.fields.cost'),
        margin: t('products.viewSheet.fields.margin'),
        compareAt: t('products.viewSheet.fields.compareAt'),
        deliveryEnabled: t('products.viewSheet.fields.deliveryEnabled'),
        deliveryLocation: t('products.viewSheet.fields.deliveryLocation'),
        deliveryPrice: t('products.viewSheet.fields.deliveryPrice'),
        createdBy: t('products.viewSheet.fields.createdBy'),
        updatedBy: t('products.viewSheet.fields.updatedBy'),
      },
      table: {
        variant: t('products.viewSheet.table.variant'),
        sku: t('products.viewSheet.table.sku'),
        stock: t('products.viewSheet.table.stock'),
        price: t('products.viewSheet.table.price'),
      },
    }),
    [t],
  )

  useEffect(() => {
    if (!productId) return

    let cancelled = false
    setLoading(true)
    setError(null)
    setProduct(null)

    productsService
      .getById(productId)
      .then((productRes) => {
        if (cancelled) return
        const p = extractEntity<ProductApi>(productRes)

        if (!p) {
          setError(t('products.preview.notFound'))
          setProduct(null)
          return
        }
        setProduct(p)
      })
      .catch(() => {
        if (!cancelled) setError(t('products.preview.loadError'))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [productId, t])

  const productDetails = useMemo(
    () => (product ? apiToProductDetails(product) : null),
    [product],
  )

  const status = product ? mapProductStatus(product.status) : 'draft'
  const isActive = status === 'active'

  const handleAddStock = () => {
    if (!product?.variants[0]?.sku) return
    const baseSku = toBaseSku(product.variants[0].sku)
    router.push(
      `/dashboard/inventory?sku=${encodeURIComponent(baseSku)}&action=restock` as Route,
    )
  }

  const openZoom = useCallback((url: string) => {
    setZoomUrl(url)
    setZoomOpen(true)
  }, [])

  if (loading || (!error && !product)) {
    return (
      <div className="flex w-full flex-col gap-6">
        <div className="space-y-2">
          <Button
            type="button"
            variant="ghost"
            className="-ml-2 h-9 rounded-lg px-2 text-gray-600 hover:bg-brand-50 hover:text-brand-900"
            onClick={() => router.push('/dashboard/products')}
          >
            <ChevronLeft className="mr-1 size-4" aria-hidden />
            {t('products.preview.backToProducts')}
          </Button>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            {t('products.viewSheet.title')}
          </h1>
        </div>
        <LoaderPanel minHeightClassName="min-h-[320px]" label={t('products.preview.loading')} />
      </div>
    )
  }

  if (error || !product || !productDetails) {
    return (
      <div className="mx-auto max-w-lg space-y-4 py-16 text-center">
        <p className="text-gray-700">{error ?? t('products.preview.notFound')}</p>
        <Button asChild variant="outline" className="rounded-lg">
          <Link href="/dashboard/products">{t('products.preview.backToProducts')}</Link>
        </Button>
      </div>
    )
  }

  const totalStock = product.variants.reduce((sum, v) => sum + (v.inventory?.onHand ?? 0), 0)

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <Button
            type="button"
            variant="ghost"
            className="-ml-2 h-9 rounded-lg px-2 text-gray-600 hover:bg-brand-50 hover:text-brand-900"
            onClick={() => router.push('/dashboard/products')}
          >
            <ChevronLeft className="mr-1 size-4" aria-hidden />
            {t('products.preview.backToProducts')}
          </Button>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">{product.name}</h1>
            <ProductStatusBadge status={status} label={statusLabel(status)} />
          </div>
          <p className="text-sm text-gray-500">
            {t('products.preview.subtitle', {
              category: product.category,
              stock: totalStock,
            })}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            className="h-9 rounded-lg border-gray-200 bg-white text-gray-700 hover:bg-brand-50 hover:text-brand-900"
            onClick={() => router.push(`/dashboard/products?edit=${product.id}`)}
          >
            <Edit className="mr-2 size-4" />
            {t('products.table.edit')}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-9 rounded-lg border-gray-200 bg-white text-gray-700 hover:bg-brand-50 hover:text-brand-900"
            onClick={handleAddStock}
          >
            <Plus className="mr-2 size-4" />
            {t('products.viewSheet.addStock')}
          </Button>
          {isActive ? (
            <Button
              asChild
              className="h-9 rounded-lg bg-brand-900 text-white hover:bg-brand-800"
            >
              <Link
                href={storeProductPath(product.id)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center"
              >
                <ArrowUpRight className="mr-2 size-4" />
                {t('products.viewSheet.viewLivePage')}
              </Link>
            </Button>
          ) : null}
        </div>
      </div>

      {!isActive ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {t('products.preview.draftNotice')}
        </p>
      ) : null}

      <ProductDetailsPanel
        product={productDetails}
        onZoomImage={openZoom}
        statusLabel={statusLabel}
        translations={viewSheetTranslations}
      />

      <ImageZoomDialog
        open={zoomOpen}
        onOpenChange={setZoomOpen}
        imageUrl={zoomUrl}
        title={t('products.zoom.title')}
        subtitle={t('products.zoom.subtitle')}
        altText={t('products.zoom.alt')}
        emptyText={t('products.table.na')}
      />
    </div>
  )
}
