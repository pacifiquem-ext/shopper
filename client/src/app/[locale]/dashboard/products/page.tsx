'use client'

import { ExportButton } from '@/components/dashboard/shared/export-button'
import { ProductStatusBadge } from '@/components/dashboard/shared/status-badges'
import { StatsCard } from '@/components/dashboard/shared/stats-card'
import { FilterPopover } from '@/components/dashboard/shared/filter-popover'
import { ImageZoomDialog } from '@/components/dashboard/shared/image-zoom-dialog'
import { DeleteConfirmationDialog } from '@/components/dashboard/shared/delete-confirmation-dialog'
import { SalesPerformanceChart, type SalesChartPoint, type SalesSummaryPoint } from '@/components/dashboard/products/sales-performance-chart'
import { TrendingProductsChart } from '@/components/dashboard/products/trending-products-chart'
import { ProductFormModal } from '@/components/dashboard/products/product-form-modal'
import { LoaderPanel } from '@/components/ui/turning-zero-loader'
import { extractEntity, extractPaginatedItems } from '@/lib/api-response'
import { Button } from '@/components/ui/button'
import { DataTable, type DataTableColumn } from '@/components/ui/data-table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import type {
  ProductRow,
  ProductsTab,
  ProductStatus,
  ProductFilters,
} from '@/types'
import { cn } from '@/lib/utils'
import { clampPercent } from '@/utils/dashboard'
import {
  ArrowUpRight,
  ArrowDownRight,
  Banknote,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Filter,
  MoreHorizontal,
  Package,
  Plus,
  Search,
  ShoppingCart,
  Sparkles,
  TrendingUp,
  Trash2,
  X,
  Badge,
  Edit,
} from 'lucide-react'
import type { Route } from 'next'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import { TurningZeroLoader } from '@/components/ui/turning-zero-loader'
import { productsService, type ProductApi, type CreateProductPayload } from '@/services/products.service'
import { storeSettingsService } from '@/services/store-settings.service'
import {
  analyticsService,
  type DashboardMetrics,
  type InventorySummary,
  type SalesTrendPoint,
  type TopProduct,
} from '@/services/analytics.service'
import { storeProductPath } from '@/lib/store-navigation'
import { Link, useRouter } from '@/i18n/navigation'

function mapProductStatus(s: string): ProductStatus {
  if (s === 'DRAFT') return 'draft'
  if (s === 'ARCHIVED') return 'archived'
  return 'active'
}

function apiToProductRow(p: ProductApi): ProductRow {
  const prices = p.variants.map((v) => v.price).filter((x) => x > 0)
  const minPrice = prices.length ? Math.min(...prices) : 0
  const maxPrice = prices.length ? Math.max(...prices) : 0
  const totalStock = p.variants.reduce((sum, v) => sum + (v.inventory?.onHand ?? 0), 0)
  const priceRange =
    prices.length === 0
      ? '—'
      : minPrice === maxPrice
        ? minPrice.toLocaleString()
        : `${minPrice.toLocaleString()} – ${maxPrice.toLocaleString()}`
  return {
    id: p.id,
    name: p.name,
    vendor: p.vendor,
    category: p.category,
    status: mapProductStatus(p.status),
    priceRange,
    totalStock,
    updatedAt: new Date(p.updatedAt).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }),
    primaryImageUrl: p.primaryImage,
    variantsCount: p.variants.length,
  }
}

function buildCreatePayload(draft: {
  name: string
  vendor: string
  category: string
  status: string
  description: string
  tags: string
  images: string[]
  colors: Array<{ name: string; hex: string }>
  sizes: string[]
  models: string[]
  price: string
  compareAt: string
  cost: string
  deliveryEnabled: boolean
  deliveryLocation: string
  deliveryPrice: string
}): CreateProductPayload {
  const colors = draft.colors.length > 0 ? draft.colors : [null]
  const sizes = draft.sizes.length > 0 ? draft.sizes : [null]
  const models = draft.models.length > 0 ? draft.models : [null]
  const variants: CreateProductPayload['variants'] = []
  for (const color of colors) {
    for (const size of sizes) {
      for (const model of models) {
        variants.push({
          colorName: color?.name,
          colorHex: color?.hex,
          size: size ?? undefined,
          model: model ?? undefined,
          price: Number(draft.price) || 0,
          compareAt: draft.compareAt ? Number(draft.compareAt) : undefined,
          cost: draft.cost ? Number(draft.cost) : undefined,
          stock: 0,
        })
      }
    }
  }
  return {
    name: draft.name,
    description: draft.description || undefined,
    vendor: draft.vendor,
    category: draft.category,
    status: draft.status,
    tags: draft.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean),
    images: draft.images.length > 0 ? draft.images : undefined,
    primaryImage: draft.images[0],
    deliveryEnabled: draft.deliveryEnabled,
    deliveryLocation: draft.deliveryLocation || undefined,
    deliveryPrice: draft.deliveryPrice ? Number(draft.deliveryPrice) : undefined,
    variants,
  }
}

function sumSalesInRange(points: SalesTrendPoint[], startMs: number, endMs: number) {
  return points.reduce(
    (acc, p) => {
      const t = new Date(p.date).getTime()
      if (t >= startMs && t < endMs) {
        acc.revenue += p.revenue
        acc.orders += p.orders
      }
      return acc
    },
    { revenue: 0, orders: 0 },
  )
}

function pctChange(current: number, previous: number) {
  if (previous === 0) return current > 0 ? 100 : 0
  return ((current - previous) / previous) * 100
}

export default function ProductsPage() {
  const t = useTranslations('dashboard')
  const router = useRouter()
  const searchParams = useSearchParams()

  const mediaUploadInputId = useId()

  const [tab, setTab] = useState<ProductsTab>('all')
  const [query, setQuery] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingProductId, setEditingProductId] = useState<string | null>(null)
  const [zoomOpen, setZoomOpen] = useState(false)
  const [zoomUrl, setZoomUrl] = useState<string | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<{ id: string; name: string; stock: number } | null>(null)

  const [filters, setFilters] = useState<ProductFilters>({
    vendor: 'any',
    category: 'any',
    status: 'any',
    minStock: null,
    maxStock: null,
  })
  const [filtersDraft, setFiltersDraft] = useState(filters)

  const [draftProduct, setDraftProduct] = useState<{
    name: string
    vendor: string
    category: string
    status: 'ACTIVE' | 'DRAFT' | 'ARCHIVED'
    description: string
    tags: string
    mediaSectionEnabled: boolean
    images: string[]
    newImageUrl: string
    variantsSectionEnabled: boolean
    colors: Array<{ name: string; hex: string }>
    sizes: string[]
    models: string[]
    price: string
    compareAt: string
    cost: string
    deliverySectionEnabled: boolean
    deliveryEnabled: boolean
    deliveryLocation: string
    deliveryPrice: string
    internalNote: string
  }>({
    name: '',
    vendor: '',
    category: '',
    status: 'ACTIVE',
    description: '',
    tags: '',
    mediaSectionEnabled: false,
    images: [],
    newImageUrl: '',
    variantsSectionEnabled: true,
    colors: [{ name: 'Black', hex: '#111827' }],
    sizes: ['S', 'M', 'L'],
    models: [],
    price: '',
    compareAt: '',
    cost: '',
    deliverySectionEnabled: true,
    deliveryEnabled: true,
    deliveryLocation: '',
    deliveryPrice: '',
    internalNote: '',
  })

  const [rows, setRows] = useState<ProductRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false)
  const [editLoading, setEditLoading] = useState(false)
  const [analyticsLoading, setAnalyticsLoading] = useState(true)
  const [dashboardMetrics, setDashboardMetrics] = useState<DashboardMetrics | null>(null)
  const [inventorySummary, setInventorySummary] = useState<InventorySummary | null>(null)
  const [salesTrend, setSalesTrend] = useState<SalesTrendPoint[]>([])
  const [topProducts, setTopProducts] = useState<TopProduct[]>([])
  const [storeVendorName, setStoreVendorName] = useState('')

  useEffect(() => {
    storeSettingsService.getSettings().then((res) => {
      const data = (res?.data as { data?: { displayName?: string } })?.data ?? res?.data
      const name = typeof data?.displayName === 'string' ? data.displayName.trim() : ''
      if (name) {
        setStoreVendorName(name)
        setDraftProduct((p) => ({ ...p, vendor: p.vendor || name }))
      }
    })
  }, [])

  const openCreateProduct = useCallback(() => {
    setIsEditMode(false)
    setEditingProductId(null)
    setDraftProduct((p) => ({ ...p, vendor: storeVendorName }))
    setCreateOpen(true)
  }, [storeVendorName])

  useEffect(() => {
    const action = searchParams.get('action')
    if (action === 'create') {
      openCreateProduct()
    }
  }, [searchParams, openCreateProduct])

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)

    productsService
      .getAll({ limit: 100 })
      .then((res) => {
        if (cancelled) return
        const products = extractPaginatedItems<ProductApi>(res)
        setRows(products.map(apiToProductRow))
      })
      .catch(() => {
        if (!cancelled) setRows([])
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false)
          setHasLoadedOnce(true)
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    setAnalyticsLoading(true)

    analyticsService
      .getDashboardOverview('month', { topLimit: 5, trendDays: 60 })
      .then((res) => {
        if (cancelled) return
        const overview = (res as { data?: typeof res })?.data ?? res
        if (overview && typeof overview === 'object' && 'metrics' in overview) {
          setDashboardMetrics(overview.metrics)
          setTopProducts(Array.isArray(overview.topProducts) ? overview.topProducts : [])
          setInventorySummary(overview.inventory ?? null)
          setSalesTrend(Array.isArray(overview.salesTrend) ? overview.salesTrend : [])
        }
      })
      .catch(() => {
        if (!cancelled) {
          setDashboardMetrics(null)
          setTopProducts([])
          setInventorySummary(null)
          setSalesTrend([])
        }
      })
      .finally(() => {
        if (!cancelled) setAnalyticsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const addImages = useCallback((urls: string[]) => {
    const cleaned = urls.map((u) => u.trim()).filter(Boolean)
    if (cleaned.length === 0) return
    setDraftProduct((p) => ({ ...p, images: Array.from(new Set([...p.images, ...cleaned])) }))
  }, [])

  const removeImage = useCallback((url: string) => {
    if (url.startsWith('blob:')) URL.revokeObjectURL(url)
    setDraftProduct((p) => ({ ...p, images: p.images.filter((u) => u !== url) }))
  }, [])

  const openEdit = useCallback(async (id: string) => {
    setIsEditMode(true)
    setEditingProductId(id)
    setCreateOpen(true)
    setEditLoading(true)

    let p: ProductApi | null = null
    try {
      const res = await productsService.getById(id)
      p = (res?.data as any)?.data ?? res?.data ?? null
    } catch {
      setCreateOpen(false)
      setIsEditMode(false)
      setEditingProductId(null)
      return
    } finally {
      setEditLoading(false)
    }
    if (!p) {
      setCreateOpen(false)
      setIsEditMode(false)
      setEditingProductId(null)
      return
    }

    const firstVariant = p.variants[0]
    setDraftProduct({
      name: p.name,
      vendor: p.vendor,
      category: p.category,
      status: p.status as 'ACTIVE' | 'DRAFT' | 'ARCHIVED',
      description: p.description ?? '',
      tags: (p.tags ?? []).join(', '),
      mediaSectionEnabled: (p.images?.length ?? 0) > 0,
      images: p.images ?? [],
      newImageUrl: '',
      variantsSectionEnabled: p.variants.length > 0,
      colors: Array.from(
        new Map(
          p.variants
            .filter((v) => v.colorName)
            .map((v) => [v.colorName, { name: v.colorName!, hex: v.colorHex ?? '#000000' }]),
        ).values(),
      ),
      sizes: Array.from(new Set(p.variants.filter((v) => v.size).map((v) => v.size!))),
      models: [],
      price: String(firstVariant?.price ?? ''),
      compareAt: String(firstVariant?.compareAt ?? ''),
      cost: String(firstVariant?.cost ?? ''),
      deliverySectionEnabled: p.deliveryEnabled,
      deliveryEnabled: p.deliveryEnabled,
      deliveryLocation: p.deliveryLocation ?? '',
      deliveryPrice: String(p.deliveryPrice ?? ''),
      internalNote: '',
    })
  }, [])

  const editQueryHandled = useRef<string | null>(null)
  useEffect(() => {
    const editId = searchParams.get('edit')
    if (!editId || editQueryHandled.current === editId) return
    editQueryHandled.current = editId
    void openEdit(editId)
  }, [searchParams, openEdit])

  const openDeleteConfirm = useCallback((product: ProductRow) => {
    setProductToDelete({ id: product.id, name: product.name, stock: product.totalStock })
    setDeleteOpen(true)
  }, [])

  const handleDelete = useCallback(async () => {
    if (!productToDelete) return
    try {
      await productsService.delete(productToDelete.id)
      setRows((prev) => prev.filter((r) => r.id !== productToDelete.id))
    } catch {}
    setDeleteOpen(false)
    setProductToDelete(null)
  }, [productToDelete])

  const vendors = useMemo(() => {
    const set = new Set<string>()
    for (const r of rows) set.add(r.vendor)
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }, [rows])

  const categories = useMemo(() => {
    const set = new Set<string>()
    for (const r of rows) set.add(r.category)
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }, [rows])

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase()
    let data = rows

    if (tab === 'active') data = data.filter((r) => r.status === 'active')
    if (tab === 'draft') data = data.filter((r) => r.status === 'draft')

    if (q) {
      data = data.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.vendor.toLowerCase().includes(q) ||
          r.category.toLowerCase().includes(q)
      )
    }

    if (filters.vendor !== 'any') data = data.filter((r) => r.vendor === filters.vendor)
    if (filters.category !== 'any') data = data.filter((r) => r.category === filters.category)
    if (filters.status !== 'any') data = data.filter((r) => r.status === filters.status)
    if (filters.minStock != null) data = data.filter((r) => r.totalStock >= filters.minStock!)
    if (filters.maxStock != null) data = data.filter((r) => r.totalStock <= filters.maxStock!)

    return data
  }, [rows, tab, query, filters])

  const stats = useMemo(() => {
    const total = rows.length
    const active = rows.filter((r) => r.status === 'active').length
    const draft = rows.filter((r) => r.status === 'draft').length
    const archived = rows.filter((r) => r.status === 'archived').length
    const inStock = rows.filter((r) => r.totalStock > 0).length
    const lowStock = rows.filter((r) => r.totalStock > 0 && r.totalStock < 10).length

    return { total, active, draft, archived, inStock, lowStock }
  }, [rows])

  const stockBar = useMemo(() => {
    if (inventorySummary) {
      const total =
        inventorySummary.inStock + inventorySummary.lowStock + inventorySummary.outOfStock
      if (total === 0) return { inPct: 0, lowPct: 0, outPct: 0 }
      const inPct = clampPercent((inventorySummary.inStock / total) * 100)
      const lowPct = clampPercent((inventorySummary.lowStock / total) * 100)
      const outPct = clampPercent(100 - inPct - lowPct)
      return { inPct, lowPct, outPct }
    }

    const total = rows.length
    if (total === 0) return { inPct: 0, lowPct: 0, outPct: 0 }

    const inStockCount = rows.filter((r) => r.totalStock >= 10).length
    const lowStockCount = rows.filter((r) => r.totalStock > 0 && r.totalStock < 10).length

    const inPct = clampPercent((inStockCount / total) * 100)
    const lowPct = clampPercent((lowStockCount / total) * 100)
    const outPct = clampPercent(100 - inPct - lowPct)

    return { inPct, lowPct, outPct }
  }, [rows, inventorySummary])

  const fmtCurrency = useCallback(
    (n: number) => `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
    [],
  )

  const dashMetric = useCallback(
    (v: string | number | undefined) => (analyticsLoading ? '—' : String(v ?? 0)),
    [analyticsLoading],
  )

  const avgOrderValue = useMemo(() => {
    if (!dashboardMetrics || dashboardMetrics.totalOrders === 0) return 0
    return dashboardMetrics.totalRevenue / dashboardMetrics.totalOrders
  }, [dashboardMetrics])

  const salesSummary = useMemo((): SalesSummaryPoint[] => {
    const now = Date.now()
    const day = 24 * 60 * 60 * 1000
    const thisWeek = sumSalesInRange(salesTrend, now - 7 * day, now)
    const lastWeek = sumSalesInRange(salesTrend, now - 14 * day, now - 7 * day)
    const thisMonth = sumSalesInRange(salesTrend, now - 30 * day, now)
    const lastMonth = sumSalesInRange(salesTrend, now - 60 * day, now - 30 * day)

    return [
      {
        label: t('products.charts.salesPerformance.thisWeek'),
        value: thisWeek.revenue,
        change: pctChange(thisWeek.revenue, lastWeek.revenue),
      },
      {
        label: t('products.charts.salesPerformance.lastWeek'),
        value: lastWeek.revenue,
        change: pctChange(lastWeek.revenue, sumSalesInRange(salesTrend, now - 21 * day, now - 14 * day).revenue),
      },
      {
        label: t('products.charts.salesPerformance.thisMonth'),
        value: thisMonth.revenue,
        change: pctChange(thisMonth.revenue, lastMonth.revenue),
      },
      {
        label: t('products.charts.salesPerformance.lastMonth'),
        value: lastMonth.revenue,
        change: pctChange(lastMonth.revenue, sumSalesInRange(salesTrend, now - 90 * day, now - 60 * day).revenue),
      },
    ]
  }, [salesTrend, t])

  const salesChartData = useMemo((): SalesChartPoint[] => {
    if (salesTrend.length === 0) return []

    const day = 24 * 60 * 60 * 1000
    const now = Date.now()
    const weeks: SalesChartPoint[] = []

    for (let i = 7; i >= 0; i--) {
      const end = now - i * 7 * day
      const start = end - 7 * day
      const bucket = sumSalesInRange(salesTrend, start, end)
      weeks.push({
        label: t('products.charts.salesPerformance.weekLabel', { number: 8 - i }),
        revenue: bucket.revenue,
        units: bucket.orders,
      })
    }

    return weeks
  }, [salesTrend, t])

  const trendingProducts = useMemo(
    () =>
      topProducts.map((p) => ({
        id: p.productId,
        name: p.productName,
        sales: p.unitsSold,
        trend: 0,
        sparklinePoints: [] as [number, number][],
      })),
    [topProducts],
  )

  const applyFilters = () => {
    setFilters(filtersDraft)
  }

  const clearFilters = () => {
    const next = {
      vendor: 'any',
      category: 'any',
      status: 'any' as const,
      minStock: null,
      maxStock: null,
    }

    setFilters(next)
    setFiltersDraft(next)
  }

  const statusLabel = useCallback(
    (s: ProductStatus) => {
      if (s === 'active') return t('products.status.active')
      if (s === 'draft') return t('products.status.draft')
      return t('products.status.archived')
    },
    [t]
  )

  const columns: DataTableColumn<ProductRow>[] = useMemo(
    () => [
      {
        id: 'name',
        header: t('products.table.name'),
        cell: (r) => (
          <div className="flex min-w-0 items-center gap-3">
            <div className="h-10 w-10 overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
              {r.primaryImageUrl ? (
                <img
                  src={r.primaryImageUrl}
                  alt={r.name}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-gray-500">
                  <Package className="h-4 w-4" />
                </div>
              )}
            </div>
            <Link
              href={`/dashboard/products/${r.id}`}
              className="min-w-0 text-left hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-900/30"
            >
              <div className="truncate font-semibold text-gray-900">{r.name}</div>
              <div className="truncate text-xs font-medium text-gray-500">
                {t('products.table.variantsCount', { count: r.variantsCount })}
              </div>
            </Link>
          </div>
        ),
      },
      {
        id: 'category',
        header: t('products.table.category'),
        cell: (r) => <div className="text-sm text-gray-700">{r.category}</div>,
      },
      {
        id: 'vendor',
        header: t('products.table.vendor'),
        cell: (r) => <div className="text-sm text-gray-700">{r.vendor}</div>,
      },
      {
        id: 'price',
        header: t('products.table.price'),
        cell: (r) => <div className="text-sm font-semibold text-gray-900">{r.priceRange}</div>,
      },
      {
        id: 'stock',
        header: t('products.table.stock'),
        cell: (r) => (
          <div className="flex items-center gap-2">
            <div className="text-sm font-semibold text-gray-900">{r.totalStock}</div>
            <div className="text-xs font-medium text-gray-500">{t('products.table.units')}</div>
          </div>
        ),
      },
      {
        id: 'status',
        header: t('products.table.status'),
        cell: (r) => <ProductStatusBadge status={r.status} label={statusLabel(r.status)} />, 
      },
      {
        id: 'updated',
        header: t('products.table.updated'),
        cell: (r) => <div className="text-sm text-gray-700">{r.updatedAt}</div>,
      },
      {
        id: 'action',
        header: <span className="sr-only">{t('products.table.action')}</span>,
        cell: (r) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg text-gray-700 hover:bg-brand-50 hover:text-brand-900"
                aria-label={t('products.table.moreAria')}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44 border-gray-200 bg-white text-gray-900">
              <DropdownMenuItem asChild className="cursor-pointer focus:bg-brand-50 focus:text-brand-900">
                <Link href={`/dashboard/products/${r.id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  {t('products.table.view')}
                </Link>
              </DropdownMenuItem>
              {r.status === 'active' ? (
                <DropdownMenuItem asChild className="cursor-pointer focus:bg-brand-50 focus:text-brand-900">
                  <Link href={storeProductPath(r.id)} target="_blank" rel="noopener noreferrer">
                    <ArrowUpRight className="mr-2 h-4 w-4" />
                    {t('products.table.viewLive')}
                  </Link>
                </DropdownMenuItem>
              ) : null}
              <DropdownMenuItem
                onClick={() => openEdit(r.id)}
                className="cursor-pointer focus:bg-brand-50 focus:text-brand-900"
              >
                <Edit className="mr-2 h-4 w-4" />
                {t('products.table.edit')}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => openDeleteConfirm(r)}
                className="cursor-pointer text-rose-600 focus:bg-rose-50 focus:text-rose-700"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {t('products.table.delete')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
        className: 'w-[56px] text-right',
        headerClassName: 'w-[56px]',
      },
    ],
    [openEdit, openDeleteConfirm, statusLabel, t]
  )

  const openZoom = (url: string) => {
    setZoomUrl(url)
    setZoomOpen(true)
  }

  return (
    <div className="flex w-full max-w-6xl flex-col gap-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">{t('products.title')}</h1>
            <p className="mt-2 text-gray-500">{t('products.subtitle')}</p>
            <p className="mt-1 text-sm font-medium text-brand-900/80">{t('products.listHint')}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:pt-[42px]">
            <ExportButton
              fetchBlob={() => productsService.exportCsv()}
              filename="products.csv"
              label={t('products.export')}
              className="h-9 rounded-lg border-gray-200 bg-white text-gray-700 hover:bg-brand-50 hover:text-brand-900"
            />
            <Button
              type="button"
              onClick={openCreateProduct}
              className="h-9 rounded-lg bg-brand-900 text-white hover:bg-brand-800"
            >
              <Plus className="mr-2 h-4 w-4" />
              {t('products.createProduct')}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatsCard
            title={t('products.charts.kpis.totalRevenue')}
            value={fmtCurrency(dashboardMetrics?.totalRevenue ?? 0)}
            icon={Banknote}
            iconBgColor="bg-emerald-50"
            iconColor="text-emerald-600"
            isLoading={analyticsLoading}
            trend={{
              value: 0,
              label: t('products.charts.kpis.revenuePeriod'),
              isPositive: true,
            }}
          />

          <StatsCard
            title={t('products.charts.kpis.unitsSold')}
            value={dashMetric(dashboardMetrics?.totalOrders)}
            icon={ShoppingCart}
            iconBgColor="bg-blue-50"
            iconColor="text-blue-600"
            isLoading={analyticsLoading}
            trend={{
              value: 0,
              label: t('products.charts.kpis.ordersPeriod'),
              isPositive: true,
            }}
          />

          <StatsCard
            title={t('products.charts.kpis.avgOrderValue')}
            value={fmtCurrency(avgOrderValue)}
            icon={TrendingUp}
            iconBgColor="bg-purple-50"
            iconColor="text-purple-600"
            isLoading={analyticsLoading}
            trend={{
              value: 0,
              label: t('products.charts.kpis.aovPeriod'),
              isPositive: true,
            }}
          />

          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs font-semibold text-gray-500">{t('products.charts.kpis.activeProducts')}</div>
                {analyticsLoading ? (
                  <div className="mt-2">
                    <TurningZeroLoader size="sm" />
                  </div>
                ) : (
                <div className="mt-2 text-2xl font-semibold text-gray-900">
                  {dashMetric(dashboardMetrics?.activeProducts ?? stats.active)}
                </div>
                )}
              </div>
              <FilterPopover
                title={t('products.filters.title')}
                subtitle={t('products.filters.subtitle')}
                onClear={clearFilters}
                onApply={applyFilters}
                clearLabel={t('products.filters.clear')}
                applyLabel={t('products.filters.apply')}
                ariaLabel={t('products.filters.aria')}
              >
                <div className="grid grid-cols-1 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="products-kpi-filter-vendor" className="text-xs font-semibold text-gray-600">{t('products.filters.vendor')}</Label>
                    <Select
                      value={filtersDraft.vendor}
                      onValueChange={(value) => setFiltersDraft((p) => ({ ...p, vendor: value }))}
                    >
                      <SelectTrigger className="h-9 rounded-lg border-gray-200 bg-white text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="border-gray-200 bg-white text-gray-900">
                        <SelectItem value="any">{t('products.filters.any')}</SelectItem>
                        {vendors.map((v) => (
                          <SelectItem key={v} value={v}>
                            {v}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="products-kpi-filter-category" className="text-xs font-semibold text-gray-600">{t('products.filters.category')}</Label>
                    <Select
                      value={filtersDraft.category}
                      onValueChange={(value) => setFiltersDraft((p) => ({ ...p, category: value }))}
                    >
                      <SelectTrigger className="h-9 rounded-lg border-gray-200 bg-white text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="border-gray-200 bg-white text-gray-900">
                        <SelectItem value="any">{t('products.filters.any')}</SelectItem>
                        {categories.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="products-kpi-filter-status" className="text-xs font-semibold text-gray-600">{t('products.filters.status')}</Label>
                    <Select
                      value={filtersDraft.status}
                      onValueChange={(value) => setFiltersDraft((p) => ({ ...p, status: value as ProductStatus | 'any' }))}
                    >
                      <SelectTrigger className="h-9 rounded-lg border-gray-200 bg-white text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="border-gray-200 bg-white text-gray-900">
                        <SelectItem value="any">{t('products.filters.any')}</SelectItem>
                        <SelectItem value="active">{t('products.status.active')}</SelectItem>
                        <SelectItem value="draft">{t('products.status.draft')}</SelectItem>
                        <SelectItem value="archived">{t('products.status.archived')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="grid gap-2">
                      <Label htmlFor="products-filter-min-stock" className="text-xs font-semibold text-gray-600">{t('products.filters.minStock')}</Label>
                      <Input
                        id="products-filter-min-stock"
                        value={filtersDraft.minStock == null ? '' : String(filtersDraft.minStock)}
                        onChange={(e) =>
                          setFiltersDraft((p) => ({
                            ...p,
                            minStock: e.target.value.trim() ? Number(e.target.value) : null,
                          }))
                        }
                        inputMode="numeric"
                        placeholder={t('products.filters.stockPlaceholder')}
                        className="h-9 rounded-lg border-gray-200 bg-white"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="products-filter-max-stock" className="text-xs font-semibold text-gray-600">{t('products.filters.maxStock')}</Label>
                      <Input
                        id="products-filter-max-stock"
                        value={filtersDraft.maxStock == null ? '' : String(filtersDraft.maxStock)}
                        onChange={(e) =>
                          setFiltersDraft((p) => ({
                            ...p,
                            maxStock: e.target.value.trim() ? Number(e.target.value) : null,
                          }))
                        }
                        inputMode="numeric"
                        placeholder={t('products.filters.stockPlaceholder')}
                        className="h-9 rounded-lg border-gray-200 bg-white"
                      />
                    </div>
                  </div>
                </div>
              </FilterPopover>
            </div>

            <div className="mt-3">
              {analyticsLoading ? (
                <div className="flex items-center justify-center py-4">
                  <TurningZeroLoader size="sm" />
                </div>
              ) : (
                <>
              <div className="flex h-2 w-full overflow-hidden rounded-full bg-gray-100">
                <div className="h-full bg-emerald-500" style={{ width: `${stockBar.inPct}%` }} />
                <div className="h-full bg-amber-500" style={{ width: `${stockBar.lowPct}%` }} />
                <div className="h-full bg-rose-500" style={{ width: `${stockBar.outPct}%` }} />
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium text-gray-600">
                <div className="inline-flex items-center gap-2 whitespace-nowrap">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span>{t('products.kpis.inStock')}</span>
                </div>
                <div className="inline-flex items-center gap-2 whitespace-nowrap">
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  <span>{t('products.kpis.lowStock')}</span>
                </div>
                <div className="inline-flex items-center gap-2 whitespace-nowrap">
                  <span className="h-2 w-2 rounded-full bg-rose-500" />
                  <span>{t('products.kpis.outOfStock')}</span>
                </div>
              </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <SalesPerformanceChart
              title={t('products.charts.salesPerformance.title')}
              subtitle={t('products.charts.salesPerformance.subtitle')}
              summary={salesSummary}
              chartData={salesChartData}
              isLoading={analyticsLoading}
              revenueLabel={t('products.charts.salesPerformance.revenue')}
              unitsLabel={t('products.charts.salesPerformance.orders')}
              emptyLabel={t('products.charts.salesPerformance.noData')}
              formatValue={fmtCurrency}
            />
          </div>

          <TrendingProductsChart
            title={t('products.charts.trending.title')}
            legendLabel={t('products.charts.trending.salesTrend')}
            unitsSoldLabel={(count) => t('products.charts.trending.unitsSold', { count })}
            emptyTitle={t('products.charts.trending.emptyTitle')}
            emptyDescription={t('products.charts.trending.emptyDescription')}
            isLoading={analyticsLoading}
            products={trendingProducts}
          />
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between">
            <Tabs value={tab} onValueChange={(v) => setTab(v as ProductsTab)}>
              <TabsList className="h-9 rounded-lg bg-gray-50">
                <TabsTrigger value="all" className="rounded-md text-sm">
                  {t('products.tabs.all')}
                </TabsTrigger>
                <TabsTrigger value="active" className="rounded-md text-sm">
                  {t('products.tabs.active')}
                </TabsTrigger>
                <TabsTrigger value="draft" className="rounded-md text-sm">
                  {t('products.tabs.draft')}
                </TabsTrigger>
                <TabsTrigger value="archived" className="rounded-md text-sm">
                  {t('products.tabs.archived')}
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex items-center gap-2">
              <div className="relative w-full max-w-[280px]">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t('products.searchPlaceholder')}
                  className="h-9 rounded-lg border-gray-200 bg-gray-50 pr-3 pl-9"
                />
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    aria-label={t('products.filters.aria')}
                    className={cn(
                      'flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 shadow-xs transition-colors',
                      'hover:bg-brand-50 hover:text-brand-900'
                    )}
                  >
                    <Filter className="h-4 w-4" />
                  </button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-[360px] border-gray-200 bg-white p-4 text-gray-900 shadow-md">
                  <div>
                    <div className="text-sm font-semibold text-gray-900">{t('products.filters.title')}</div>
                    <div className="mt-0.5 text-xs font-medium text-gray-500">{t('products.filters.subtitle')}</div>
                  </div>
                  <div className="mt-4 grid grid-cols-1 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="products-table-filter-vendor" className="text-xs font-semibold text-gray-600">{t('products.filters.vendor')}</Label>
                      <select
                        id="products-table-filter-vendor"
                        value={filtersDraft.vendor}
                        onChange={(e) => setFiltersDraft((p) => ({ ...p, vendor: e.target.value }))}
                        className="h-9 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900"
                      >
                        <option value="any">{t('products.filters.any')}</option>
                        {vendors.map((v) => (
                          <option key={v} value={v}>
                            {v}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="products-table-filter-category" className="text-xs font-semibold text-gray-600">{t('products.filters.category')}</Label>
                      <select
                        id="products-table-filter-category"
                        value={filtersDraft.category}
                        onChange={(e) => setFiltersDraft((p) => ({ ...p, category: e.target.value }))}
                        className="h-9 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900"
                      >
                        <option value="any">{t('products.filters.any')}</option>
                        {categories.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="products-table-filter-status" className="text-xs font-semibold text-gray-600">{t('products.filters.status')}</Label>
                      <select
                        id="products-table-filter-status"
                        value={filtersDraft.status}
                        onChange={(e) =>
                          setFiltersDraft((p) => ({ ...p, status: e.target.value as ProductStatus | 'any' }))
                        }
                        className="h-9 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900"
                      >
                        <option value="any">{t('products.filters.any')}</option>
                        <option value="active">{t('products.status.active')}</option>
                        <option value="draft">{t('products.status.draft')}</option>
                        <option value="archived">{t('products.status.archived')}</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="grid gap-2">
                        <Label htmlFor="products-table-filter-min-stock" className="text-xs font-semibold text-gray-600">{t('products.filters.minStock')}</Label>
                        <Input
                          id="products-table-filter-min-stock"
                          value={filtersDraft.minStock == null ? '' : String(filtersDraft.minStock)}
                          onChange={(e) =>
                            setFiltersDraft((p) => ({
                              ...p,
                              minStock: e.target.value.trim() ? Number(e.target.value) : null,
                            }))
                          }
                          inputMode="numeric"
                          placeholder={t('products.filters.stockPlaceholder')}
                          className="h-9 rounded-lg border-gray-200 bg-white"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="products-table-filter-max-stock" className="text-xs font-semibold text-gray-600">{t('products.filters.maxStock')}</Label>
                        <Input
                          id="products-table-filter-max-stock"
                          value={filtersDraft.maxStock == null ? '' : String(filtersDraft.maxStock)}
                          onChange={(e) =>
                            setFiltersDraft((p) => ({
                              ...p,
                              maxStock: e.target.value.trim() ? Number(e.target.value) : null,
                            }))
                          }
                          inputMode="numeric"
                          placeholder={t('products.filters.stockPlaceholder')}
                          className="h-9 rounded-lg border-gray-200 bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={clearFilters}
                      className="h-9 rounded-lg border-gray-200 bg-white text-gray-700 hover:bg-brand-50 hover:text-brand-900"
                    >
                      {t('products.filters.clear')}
                    </Button>
                    <Button
                      type="button"
                      onClick={applyFilters}
                      className="h-9 rounded-lg bg-brand-900 text-white hover:bg-brand-800"
                    >
                      {t('products.filters.apply')}
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="p-2 min-h-[280px]">
            {!hasLoadedOnce || isLoading ? (
              <LoaderPanel minHeightClassName="min-h-[280px]" label={t('products.preview.loading')} />
            ) : (
              <DataTable
                data={filteredRows}
                columns={columns}
                getRowId={(r) => r.id}
                enableSelection
                enablePagination
                isLoading={false}
                emptyState={<div className="text-sm">{t('products.empty')}</div>}
              />
            )}
          </div>
        </div>

      <ProductFormModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        isEditMode={isEditMode}
        draftProduct={draftProduct}
        setDraftProduct={setDraftProduct}
        onSubmit={async () => {
          const vendor = storeVendorName || draftProduct.vendor
          if (isEditMode && editingProductId) {
            const res = await productsService.update(editingProductId, {
              name: draftProduct.name,
              description: draftProduct.description || undefined,
              vendor,
              category: draftProduct.category,
              status: draftProduct.status,
              tags: draftProduct.tags
                .split(',')
                .map((t) => t.trim())
                .filter(Boolean),
              images: draftProduct.images.length > 0 ? draftProduct.images : undefined,
              primaryImage: draftProduct.images[0] || undefined,
              deliveryEnabled: draftProduct.deliveryEnabled,
              deliveryLocation: draftProduct.deliveryLocation || undefined,
              deliveryPrice: draftProduct.deliveryPrice
                ? Number(draftProduct.deliveryPrice)
                : undefined,
            })
            const updated: ProductApi | null = (res?.data as any)?.data ?? res?.data ?? null
            if (updated) {
              setRows((prev) =>
                prev.map((r) => (r.id === editingProductId ? apiToProductRow(updated) : r)),
              )
            }
            setCreateOpen(false)
            setIsEditMode(false)
            setEditingProductId(null)
            return
          }

          const payload = buildCreatePayload({ ...draftProduct, vendor })
          const res = await productsService.create(payload)
          const created = extractEntity<ProductApi>(res)
          if (!created) {
            throw new Error('Product create failed')
          }
          setRows((prev) => [apiToProductRow(created), ...prev])
          router.push(`/dashboard/products/${created.id}`)
        }}
        onZoomImage={openZoom}
        addImages={addImages}
        removeImage={removeImage}
        isDraftLoading={editLoading}
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

      <DeleteConfirmationDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDelete}
        title="Delete Product"
        description="This action cannot be undone"
        itemName={productToDelete?.name || ''}
        warningMessage="You are about to delete"
        deleteItems={[
          { label: 'The product and all its variants' },
          { label: 'units from inventory', value: productToDelete?.stock || 0 },
          { label: 'All product images and media' },
          { label: 'Sales history and analytics data' },
        ]}
        impactTitle="Impact on Active Orders"
        impactMessage="If this product is part of any pending orders, those orders may be affected. Consider archiving instead of deleting."
        confirmButtonText="Delete Product"
        cancelButtonText="Cancel"
      />
    </div>
  )
}
