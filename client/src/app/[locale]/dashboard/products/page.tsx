'use client'

import { ProductStatusBadge } from '@/components/dashboard/shared/status-badges'
import { StatsCard } from '@/components/dashboard/shared/stats-card'
import { FilterPopover } from '@/components/dashboard/shared/filter-popover'
import { ImageZoomDialog } from '@/components/dashboard/shared/image-zoom-dialog'
import { DeleteConfirmationDialog } from '@/components/dashboard/shared/delete-confirmation-dialog'
import { SalesPerformanceChart } from '@/components/dashboard/products/sales-performance-chart'
import { TrendingProductsChart } from '@/components/dashboard/products/trending-products-chart'
import { ProductFormModal } from '@/components/dashboard/products/product-form-modal'
import { ProductViewSheet } from '@/components/dashboard/products/product-view-sheet'
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
import { Sheet } from '@/components/ui/sheet'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import type {
  ProductRow,
  ProductDetailsExtended,
  ProductsTab,
  ProductStatus,
  ProductFilters,
} from '@/types'
import { cn } from '@/lib/utils'
import { clampPercent, toBaseSku } from '@/utils/dashboard'
import { printContent } from '@/utils/print'
import {
  ArrowUpRight,
  ArrowDownRight,
  Banknote,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
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
import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useCallback, useEffect, useId, useMemo, useState } from 'react'
import { productsService, type ProductApi, type CreateProductPayload } from '@/services/products.service'
import { analyticsService } from '@/services/analytics.service'

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

function apiToProductDetails(p: ProductApi): ProductDetailsExtended {
  const prices = p.variants.map((v) => v.price).filter((x) => x > 0)
  const minPrice = prices.length ? Math.min(...prices) : 0
  const maxPrice = prices.length ? Math.max(...prices) : 0
  const costs = p.variants.map((v) => v.cost).filter((c): c is number => c != null && c > 0)
  const avgCost = costs.length ? costs.reduce((a, b) => a + b, 0) / costs.length : 0
  const compareAt = p.variants[0]?.compareAt
  return {
    id: p.id,
    name: p.name,
    vendor: p.vendor,
    category: p.category,
    status: mapProductStatus(p.status),
    description: p.description ?? '',
    tags: p.tags ?? [],
    images: p.images ?? [],
    variants: p.variants.map((v) => ({
      id: v.id,
      title: v.title,
      sku: v.sku,
      color: v.colorName ? { name: v.colorName, hex: v.colorHex ?? '#000000' } : undefined,
      size: v.size,
      stock: v.inventory?.onHand ?? 0,
      price: v.price.toLocaleString(),
    })),
    pricing: {
      priceFrom: minPrice.toLocaleString(),
      priceTo: maxPrice.toLocaleString(),
      cost: avgCost ? Math.round(avgCost).toLocaleString() : '',
      margin:
        avgCost > 0 && minPrice > 0
          ? `${Math.round(((minPrice - avgCost) / minPrice) * 100)}%`
          : '',
      compareAt: compareAt ? compareAt.toLocaleString() : '',
    },
    delivery: {
      enabled: p.deliveryEnabled,
      location: p.deliveryLocation,
      price: p.deliveryPrice ? p.deliveryPrice.toLocaleString() : '',
    },
    staff: { createdBy: 'Store Owner', updatedBy: 'Store Owner' },
    notes: { internalNote: '' },
    updatedAt: new Date(p.updatedAt).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }),
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

export default function ProductsPage() {
  const t = useTranslations('dashboard')
  const router = useRouter()
  const searchParams = useSearchParams()

  const mediaUploadInputId = useId()

  const [tab, setTab] = useState<ProductsTab>('all')
  const [query, setQuery] = useState('')
  const [viewOpen, setViewOpen] = useState(false)
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null)
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
    status: 'DRAFT',
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

  useEffect(() => {
    const action = searchParams.get('action')
    if (action === 'create') {
      setCreateOpen(true)
    }
  }, [searchParams])

  const [rows, setRows] = useState<ProductRow[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [trendingProducts, setTrendingProducts] = useState<
    Array<{ id: string; name: string; sales: number; trend: number; sparklinePoints: [number, number][] }>
  >([])

  const [detailsById, setDetailsById] = useState<Record<string, ProductDetailsExtended>>({})

  useEffect(() => {
    setIsLoading(true)
    productsService
      .getAll({ limit: 100 })
      .then((res) => {
        const list = (res?.data as any)?.data ?? res?.data
        if (list?.data) setRows((list.data as ProductApi[]).map(apiToProductRow))
      })
      .finally(() => setIsLoading(false))
  }, [])

  useEffect(() => {
    analyticsService.getTopProducts(5).then((res) => {
      const data: any[] = (res?.data as any)?.data ?? res?.data ?? []
      if (Array.isArray(data)) {
        setTrendingProducts(
          data.map((p) => ({
            id: p.productId as string,
            name: p.productName as string,
            sales: (p.unitsSold as number) ?? 0,
            trend: 0,
            sparklinePoints: [] as [number, number][],
          })),
        )
      }
    })
  }, [])

  useEffect(() => {
    if (!selectedProductId || detailsById[selectedProductId]) return
    productsService.getById(selectedProductId).then((res) => {
      const p: ProductApi | null = (res?.data as any)?.data ?? res?.data ?? null
      if (p) setDetailsById((prev) => ({ ...prev, [selectedProductId]: apiToProductDetails(p) }))
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProductId])

  const addImages = useCallback((urls: string[]) => {
    const cleaned = urls.map((u) => u.trim()).filter(Boolean)
    if (cleaned.length === 0) return
    setDraftProduct((p) => ({ ...p, images: Array.from(new Set([...p.images, ...cleaned])) }))
  }, [])

  const removeImage = useCallback((url: string) => {
    if (url.startsWith('blob:')) URL.revokeObjectURL(url)
    setDraftProduct((p) => ({ ...p, images: p.images.filter((u) => u !== url) }))
  }, [])

  const openView = useCallback((id: string) => {
    setSelectedProductId(id)
    setViewOpen(true)
  }, [])

  const openEdit = useCallback(async (id: string) => {
    let p: ProductApi | null = null
    try {
      const res = await productsService.getById(id)
      p = (res?.data as any)?.data ?? res?.data ?? null
    } catch { return }
    if (!p) return

    setDetailsById((prev) => ({ ...prev, [id]: apiToProductDetails(p!) }))

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

    setIsEditMode(true)
    setEditingProductId(id)
    setCreateOpen(true)
  }, [])

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

  const handleExport = useCallback(async () => {
    try {
      const blob = await productsService.exportCsv()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'products.csv'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch {}
  }, [])

  const selectedProduct = selectedProductId ? detailsById[selectedProductId] : undefined

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
    const total = rows.length
    if (total === 0) return { inPct: 0, lowPct: 0, outPct: 0 }

    const inStockCount = rows.filter((r) => r.totalStock >= 10).length
    const lowStockCount = rows.filter((r) => r.totalStock > 0 && r.totalStock < 10).length
    const outCount = rows.filter((r) => r.totalStock === 0).length

    const inPct = clampPercent((inStockCount / total) * 100)
    const lowPct = clampPercent((lowStockCount / total) * 100)
    const outPct = clampPercent(100 - inPct - lowPct)

    return { inPct, lowPct, outPct }
  }, [rows])

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
            <div className="min-w-0">
              <div className="truncate font-semibold text-gray-900">{r.name}</div>
              <div className="truncate text-xs font-medium text-gray-500">
                {t('products.table.variantsCount', { count: r.variantsCount })}
              </div>
            </div>
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
              <DropdownMenuItem
                onClick={() => openView(r.id)}
                className="cursor-pointer focus:bg-brand-50 focus:text-brand-900"
              >
                <Eye className="mr-2 h-4 w-4" />
                {t('products.table.view')}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => openEdit(r.id)}
                className="cursor-pointer focus:bg-brand-50 focus:text-brand-900"
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => openDeleteConfirm(r)}
                className="cursor-pointer text-rose-600 focus:bg-rose-50 focus:text-rose-700"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
        className: 'w-[56px] text-right',
        headerClassName: 'w-[56px]',
      },
    ],
    [openView, openEdit, openDeleteConfirm, statusLabel, t]
  )

  const openZoom = (url: string) => {
    setZoomUrl(url)
    setZoomOpen(true)
  }

  const downloadAsPdf = () => {
    printContent({
      title: t('products.viewSheet.printTitle'),
      selector: '[data-product-print]',
      hideSelector: '[data-hide-print]',
    })
  }

  return (
    <Sheet open={viewOpen} onOpenChange={setViewOpen}>
      <div className="flex w-full max-w-6xl flex-col gap-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">{t('products.title')}</h1>
            <p className="mt-2 text-gray-500">{t('products.subtitle')}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:pt-[42px]">
            <Button
              type="button"
              variant="outline"
              className="h-9 rounded-lg border-gray-200 bg-white text-gray-700 hover:bg-brand-50 hover:text-brand-900"
              onClick={handleExport}
            >
              <Download className="mr-2 h-4 w-4" />
              {t('products.export')}
            </Button>
            <Button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="h-9 rounded-lg bg-brand-900 text-white hover:bg-brand-800"
            >
              <Plus className="mr-2 h-4 w-4" />
              {t('products.createProduct')}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatsCard
            title="Total Revenue"
            value="$48,574"
            icon={Banknote}
            iconBgColor="bg-emerald-50"
            iconColor="text-emerald-600"
            trend={{ value: 12.5, label: '12.5% from last month', isPositive: true }}
          />

          <StatsCard
            title="Units Sold"
            value="1,847"
            icon={ShoppingCart}
            iconBgColor="bg-blue-50"
            iconColor="text-blue-600"
            trend={{ value: 8.2, label: '8.2% from last month', isPositive: true }}
          />

          <StatsCard
            title="Avg. Order Value"
            value="$26.30"
            icon={TrendingUp}
            iconBgColor="bg-purple-50"
            iconColor="text-purple-600"
            trend={{ value: -3.1, label: '3.1% from last month', isPositive: false }}
          />

          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs font-semibold text-gray-500">Active Products</div>
                <div className="mt-2 text-2xl font-semibold text-gray-900">{stats.active}</div>
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
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <SalesPerformanceChart
              title="Sales Performance"
              subtitle="Revenue and units sold over the last 30 days"
              data={[
                { label: 'This Week', value: 12847, change: 15.3 },
                { label: 'Last Week', value: 11234, change: 8.7 },
                { label: 'This Month', value: 48574, change: 12.5 },
                { label: 'Last Month', value: 43189, change: -3.2 },
              ]}
              salesPoints={[
                [0, 0.45],
                [0.1, 0.52],
                [0.2, 0.48],
                [0.3, 0.55],
                [0.4, 0.62],
                [0.5, 0.58],
                [0.6, 0.65],
                [0.7, 0.72],
                [0.8, 0.68],
                [0.9, 0.75],
                [1, 0.78],
              ]}
              revenuePoints={[
                [0, 0.38],
                [0.1, 0.42],
                [0.2, 0.45],
                [0.3, 0.48],
                [0.4, 0.55],
                [0.5, 0.52],
                [0.6, 0.58],
                [0.7, 0.65],
                [0.8, 0.62],
                [0.9, 0.68],
                [1, 0.72],
              ]}
            />
          </div>

          <TrendingProductsChart
            title="Trending Products"
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

          <div className="p-2">
            <DataTable
              data={filteredRows}
              columns={columns}
              getRowId={(r) => r.id}
              enableSelection
              enablePagination
              emptyState={<div className="text-sm">{t('products.empty')}</div>}
            />
          </div>
        </div>
      </div>

      <ProductViewSheet
        product={selectedProduct ?? null}
        onZoomImage={openZoom}
        onAddStock={(product) => {
          const baseSku = toBaseSku(product.variants[0]?.sku ?? '')
          if (!baseSku) return
          router.push(`/dashboard/inventory?sku=${encodeURIComponent(baseSku)}&action=restock`)
        }}
        onDownloadPdf={downloadAsPdf}
        statusLabel={statusLabel}
        translations={{
          title: t('products.viewSheet.title'),
          subtitle: (params) => t('products.viewSheet.subtitle', params),
          empty: t('products.viewSheet.empty'),
          na: t('products.table.na'),
          yes: t('products.viewSheet.yes'),
          no: t('products.viewSheet.no'),
          addStock: t('products.viewSheet.addStock'),
          downloadPdf: t('products.viewSheet.downloadPdf'),
          zoom: t('products.viewSheet.zoom'),
          variantsCount: (params) => t('products.viewSheet.variantsCount', params),
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
        }}
      />

      <ProductFormModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        isEditMode={isEditMode}
        draftProduct={draftProduct}
        setDraftProduct={setDraftProduct}
        onSubmit={async () => {
          if (isEditMode && editingProductId) {
            try {
              const res = await productsService.update(editingProductId, {
                name: draftProduct.name,
                description: draftProduct.description || undefined,
                vendor: draftProduct.vendor,
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
                setDetailsById((prev) => ({
                  ...prev,
                  [editingProductId]: apiToProductDetails(updated),
                }))
              }
            } catch {}
            setCreateOpen(false)
            setIsEditMode(false)
            setEditingProductId(null)
          } else {
            try {
              const payload = buildCreatePayload(draftProduct)
              const res = await productsService.create(payload)
              const created: ProductApi | null = (res?.data as any)?.data ?? res?.data ?? null
              if (created) setRows((prev) => [apiToProductRow(created), ...prev])
            } catch {}
            setCreateOpen(false)
          }
        }}
        onZoomImage={openZoom}
        addImages={addImages}
        removeImage={removeImage}
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
    </Sheet>
  )
}
