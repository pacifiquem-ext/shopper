'use client'

import { ProductStatusBadge } from '@/components/dashboard/shared/status-badges'
import { SalesPerformanceChart } from '@/components/dashboard/products/sales-performance-chart'
import { TrendingProductsChart } from '@/components/dashboard/products/trending-products-chart'
import { Button } from '@/components/ui/button'
import { DataTable, type DataTableColumn } from '@/components/ui/data-table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
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
  X,
  ZoomIn,
  Badge,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useCallback, useId, useMemo, useState } from 'react'

export default function ProductsPage() {
  const t = useTranslations('dashboard')
  const router = useRouter()

  const mediaUploadInputId = useId()

  const [tab, setTab] = useState<ProductsTab>('all')
  const [query, setQuery] = useState('')
  const [viewOpen, setViewOpen] = useState(false)
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [createStep, setCreateStep] = useState(0)
  const [zoomOpen, setZoomOpen] = useState(false)
  const [zoomUrl, setZoomUrl] = useState<string | null>(null)

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
    status: ProductStatus
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
    status: 'draft',
    description: '',
    tags: '',
    mediaSectionEnabled: true,
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

  const rows: ProductRow[] = useMemo(
    () => [
      {
        id: 'prod-1',
        name: 'Cotton T-shirt',
        vendor: 'Kigali Fashion',
        category: 'Apparel',
        status: 'active',
        priceRange: '$12 - $18',
        totalStock: 124,
        updatedAt: '2026-03-18',
        primaryImageUrl: 'https://images.unsplash.com/photo-1520975958225-1f1f962a8f1f?auto=format&fit=crop&w=400&q=60',
        variantsCount: 6,
      },
      {
        id: 'prod-2',
        name: 'Classic Cap',
        vendor: 'Kigali Fashion',
        category: 'Accessories',
        status: 'active',
        priceRange: '$8',
        totalStock: 10,
        updatedAt: '2026-03-16',
        primaryImageUrl: 'https://images.unsplash.com/photo-1523381294911-8d3cead13475?auto=format&fit=crop&w=400&q=60',
        variantsCount: 2,
      },
      {
        id: 'prod-3',
        name: 'Denim Shorts',
        vendor: 'Kigali Fashion',
        category: 'Apparel',
        status: 'draft',
        priceRange: '$24',
        totalStock: 0,
        updatedAt: '2026-03-10',
        primaryImageUrl: 'https://images.unsplash.com/photo-1520975958225-5d4f3f6f2a4b?auto=format&fit=crop&w=400&q=60',
        variantsCount: 4,
      },
      {
        id: 'prod-4',
        name: 'Leather Belt',
        vendor: 'Kigali Fashion',
        category: 'Accessories',
        status: 'active',
        priceRange: '$14 - $19',
        totalStock: 34,
        updatedAt: '2026-03-05',
        primaryImageUrl: 'https://images.unsplash.com/photo-1520975958225-b44e07039e9d?auto=format&fit=crop&w=400&q=60',
        variantsCount: 3,
      },
      {
        id: 'prod-5',
        name: 'Socks (Pair)',
        vendor: 'Kigali Fashion',
        category: 'Apparel',
        status: 'archived',
        priceRange: '$3',
        totalStock: 6,
        updatedAt: '2026-02-28',
        primaryImageUrl: 'https://images.unsplash.com/photo-1580901369227-308f6f40bdeb?auto=format&fit=crop&w=400&q=60',
        variantsCount: 1,
      },
    ],
    []
  )

  const detailsById: Record<string, ProductDetailsExtended> = useMemo(
    () => ({
      'prod-1': {
        id: 'prod-1',
        name: 'Cotton T-shirt',
        vendor: 'Kigali Fashion',
        category: 'Apparel',
        status: 'active',
        description:
          'Soft, breathable cotton t-shirt with modern fit. Designed for everyday comfort and easy styling.',
        tags: ['cotton', 'unisex', 'everyday'],
        images: [
          'https://images.unsplash.com/photo-1520975958225-1f1f962a8f1f?auto=format&fit=crop&w=1200&q=70',
          'https://images.unsplash.com/photo-1520975958225-9d6d17365f1b?auto=format&fit=crop&w=1200&q=70',
          'https://images.unsplash.com/photo-1520975958225-6d52c5ab07df?auto=format&fit=crop&w=1200&q=70',
        ],
        variants: [
          {
            id: 'v-1',
            title: 'Black / M',
            sku: 'TS-001-BLK-M',
            color: { name: 'Black', hex: '#111827' },
            size: 'M',
            stock: 42,
            price: '$14',
          },
          {
            id: 'v-2',
            title: 'Black / L',
            sku: 'TS-001-BLK-L',
            color: { name: 'Black', hex: '#111827' },
            size: 'L',
            stock: 29,
            price: '$14',
          },
          {
            id: 'v-3',
            title: 'White / M',
            sku: 'TS-001-WHT-M',
            color: { name: 'White', hex: '#FFFFFF' },
            size: 'M',
            stock: 53,
            price: '$14',
          },
        ],
        pricing: { priceFrom: '$12', priceTo: '$18', cost: '$6', margin: '50%', compareAt: '$20' },
        delivery: { enabled: true, location: 'Kigali', price: '$2' },
        staff: { createdBy: 'Admin', updatedBy: 'Manager' },
        notes: { internalNote: 'Keep top sizes ready for quick delivery.' },
        updatedAt: '2026-03-18',
      },
      'prod-2': {
        id: 'prod-2',
        name: 'Classic Cap',
        vendor: 'Kigali Fashion',
        category: 'Accessories',
        status: 'active',
        description: 'Everyday cap with adjustable strap and structured fit.',
        tags: ['cap', 'accessories'],
        images: [
          'https://images.unsplash.com/photo-1523381294911-8d3cead13475?auto=format&fit=crop&w=1200&q=70',
        ],
        variants: [
          {
            id: 'v-4',
            title: 'Black',
            sku: 'CAP-031-BLK',
            color: { name: 'Black', hex: '#111827' },
            stock: 6,
            price: '$8',
          },
          {
            id: 'v-5',
            title: 'Navy',
            sku: 'CAP-031-NVY',
            color: { name: 'Navy', hex: '#0F172A' },
            stock: 4,
            price: '$8',
          },
        ],
        pricing: { priceFrom: '$8', priceTo: '$8', cost: '$3', margin: '62%', compareAt: '' },
        delivery: { enabled: true, location: 'Kigali', price: '$1' },
        staff: { createdBy: 'Admin', updatedBy: 'Admin' },
        notes: { internalNote: '' },
        updatedAt: '2026-03-16',
      },
    }),
    []
  )

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
    if (tab === 'archived') data = data.filter((r) => r.status === 'archived')

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
    if (filters.minStock != null) data = data.filter((r) => r.totalStock >= filters.minStock)
    if (filters.maxStock != null) data = data.filter((r) => r.totalStock <= filters.maxStock)

    return data
  }, [filters.category, filters.maxStock, filters.minStock, filters.status, filters.vendor, query, rows, tab])

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
            </DropdownMenuContent>
          </DropdownMenu>
        ),
        className: 'w-[56px] text-right',
        headerClassName: 'w-[56px]',
      },
    ],
    [openView, statusLabel, t]
  )

  const paginationLabels = useMemo(
    () => ({
      previous: t('products.pagination.previous'),
      next: t('products.pagination.next'),
      rowsPerPage: t('products.pagination.rowsPerPage'),
      showing: (from: number, to: number, total: number) =>
        t('products.pagination.showing', { from, to, total }),
    }),
    [t]
  )

  const createSteps = useMemo(
    () => [
      {
        key: 'basics',
        title: t('products.create.steps.basics'),
        description: t('products.create.steps.basicsDescription'),
      },
      {
        key: 'media',
        title: t('products.create.steps.media'),
        description: t('products.create.steps.mediaDescription'),
      },
      {
        key: 'variants',
        title: t('products.create.steps.variants'),
        description: t('products.create.steps.variantsDescription'),
      },
      {
        key: 'pricing',
        title: t('products.create.steps.pricing'),
        description: t('products.create.steps.pricingDescription'),
      },
      {
        key: 'delivery',
        title: t('products.create.steps.delivery'),
        description: t('products.create.steps.deliveryDescription'),
      },
      {
        key: 'review',
        title: t('products.create.steps.review'),
        description: t('products.create.steps.reviewDescription'),
      },
    ],
    [t]
  )

  const isStepEnabled = useCallback(
    (index: number) => {
      const key = createSteps[index]?.key
      if (!key) return false
      if (key === 'media') return draftProduct.mediaSectionEnabled
      if (key === 'variants') return draftProduct.variantsSectionEnabled
      if (key === 'delivery') return draftProduct.deliverySectionEnabled
      return true
    },
    [createSteps, draftProduct.deliverySectionEnabled, draftProduct.mediaSectionEnabled, draftProduct.variantsSectionEnabled]
  )

  const canGoNext = useMemo(() => {
    if (createStep === 0) return draftProduct.name.trim().length > 0
    if (createStep === 2 && draftProduct.variantsSectionEnabled) {
      return draftProduct.colors.every((c) => c.name.trim().length > 0)
    }
    if (createStep === 3) return draftProduct.price.trim().length > 0
    return true
  }, [createStep, draftProduct.colors, draftProduct.name, draftProduct.price, draftProduct.variantsSectionEnabled])

  const closeCreate = () => {
    setCreateOpen(false)
    setCreateStep(0)
  }

  const nextStep = () => {
    if (!canGoNext) return

    setCreateStep((s) => {
      let idx = Math.min(createSteps.length - 1, s + 1)
      while (idx < createSteps.length - 1 && !isStepEnabled(idx)) idx += 1
      return idx
    })
  }

  const prevStep = () => {
    setCreateStep((s) => {
      let idx = Math.max(0, s - 1)
      while (idx > 0 && !isStepEnabled(idx)) idx -= 1
      return idx
    })
  }

  const setSectionEnabled = (key: 'media' | 'variants' | 'delivery', enabled: boolean) => {
    setDraftProduct((p) => {
      if (key === 'media') return { ...p, mediaSectionEnabled: enabled }
      if (key === 'variants') return { ...p, variantsSectionEnabled: enabled }
      return { ...p, deliverySectionEnabled: enabled }
    })

    if (!enabled) {
      const stepKey = createSteps[createStep]?.key
      if (stepKey === key) nextStep()
    }
  }

  const openZoom = (url: string) => {
    setZoomUrl(url)
    setZoomOpen(true)
  }

  const downloadAsPdf = () => {
    const win = window.open('', '_blank')
    if (!win) return

    const content = document.querySelector('[data-product-print]')
    if (!content) return

    win.document.write(`<html><head><title>${t('products.viewSheet.printTitle')}</title>`)
    win.document.write(`<style>
      @media print {
        body { margin: 0; }
        [data-hide-print] { display: none !important; }
      }
      body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"; }
    </style></head><body>`) 
    win.document.write(content.outerHTML)
    win.document.write('</body></html>')
    win.document.close()
    win.focus()
    win.print()
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
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-semibold text-gray-500">Total Revenue</div>
                <div className="mt-2 text-2xl font-semibold text-gray-900">$48,574</div>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <Banknote className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-emerald-600">
              <ArrowUpRight className="h-3.5 w-3.5" />
              <span>12.5% from last month</span>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-semibold text-gray-500">Units Sold</div>
                <div className="mt-2 text-2xl font-semibold text-gray-900">1,847</div>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <ShoppingCart className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-emerald-600">
              <ArrowUpRight className="h-3.5 w-3.5" />
              <span>8.2% from last month</span>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-semibold text-gray-500">Avg. Order Value</div>
                <div className="mt-2 text-2xl font-semibold text-gray-900">$26.30</div>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-rose-600">
              <ArrowDownRight className="h-3.5 w-3.5" />
              <span>3.1% from last month</span>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs font-semibold text-gray-500">Active Products</div>
                <div className="mt-2 text-2xl font-semibold text-gray-900">{stats.active}</div>
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
                      <Label htmlFor="products-kpi-filter-vendor" className="text-xs font-semibold text-gray-600">{t('products.filters.vendor')}</Label>
                      <select
                        id="products-kpi-filter-vendor"
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
                      <Label htmlFor="products-kpi-filter-category" className="text-xs font-semibold text-gray-600">{t('products.filters.category')}</Label>
                      <select
                        id="products-kpi-filter-category"
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
                      <Label htmlFor="products-kpi-filter-status" className="text-xs font-semibold text-gray-600">{t('products.filters.status')}</Label>
                      <select
                        id="products-kpi-filter-status"
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
            products={[
              {
                id: 'prod-1',
                name: 'Cotton T-shirt',
                sales: 342,
                trend: 24.5,
                sparklinePoints: [
                  [0, 0.3],
                  [0.2, 0.45],
                  [0.4, 0.52],
                  [0.6, 0.65],
                  [0.8, 0.72],
                  [1, 0.85],
                ],
              },
              {
                id: 'prod-4',
                name: 'Leather Belt',
                sales: 287,
                trend: 18.2,
                sparklinePoints: [
                  [0, 0.4],
                  [0.2, 0.5],
                  [0.4, 0.55],
                  [0.6, 0.62],
                  [0.8, 0.68],
                  [1, 0.75],
                ],
              },
              {
                id: 'prod-2',
                name: 'Classic Cap',
                sales: 234,
                trend: 12.8,
                sparklinePoints: [
                  [0, 0.5],
                  [0.2, 0.52],
                  [0.4, 0.58],
                  [0.6, 0.62],
                  [0.8, 0.65],
                  [1, 0.68],
                ],
              },
              {
                id: 'prod-3',
                name: 'Denim Shorts',
                sales: 198,
                trend: -5.3,
                sparklinePoints: [
                  [0, 0.7],
                  [0.2, 0.65],
                  [0.4, 0.62],
                  [0.6, 0.58],
                  [0.8, 0.55],
                  [1, 0.52],
                ],
              },
              {
                id: 'prod-5',
                name: 'Socks (Pair)',
                sales: 156,
                trend: 8.4,
                sparklinePoints: [
                  [0, 0.45],
                  [0.2, 0.48],
                  [0.4, 0.52],
                  [0.6, 0.55],
                  [0.8, 0.58],
                  [1, 0.62],
                ],
              },
            ]}
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
              paginationLabels={paginationLabels}
              emptyState={<div className="text-sm">{t('products.empty')}</div>}
            />
          </div>
        </div>
      </div>

      <SheetContent
        side="right"
        className="flex h-full w-full flex-col gap-0 border-gray-200 bg-white p-0 sm:max-w-[1000px]"
      >
        <SheetHeader className="border-b border-gray-100 px-6 py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <SheetTitle className="truncate text-lg font-semibold text-gray-900">
                {selectedProduct ? selectedProduct.name : t('products.viewSheet.title')}
              </SheetTitle>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-gray-600">
                <span className="inline-flex items-center gap-2">
                  <Package className="h-4 w-4 text-gray-500" />
                  <span className="truncate">{selectedProduct?.category ?? t('products.table.na')}</span>
                </span>
                <span className="text-gray-300">•</span>
                <span className="truncate">{selectedProduct?.vendor ?? t('products.table.na')}</span>
              </div>
            </div>

            <div className="flex items-center gap-2" data-hide-print>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (!selectedProduct) return
                  const baseSku = toBaseSku(selectedProduct.variants[0]?.sku ?? '')
                  if (!baseSku) return
                  router.push(`/dashboard/inventory?sku=${encodeURIComponent(baseSku)}&action=restock`)
                }}
                disabled={!selectedProduct}
                className="h-9 rounded-lg border-gray-200 bg-white text-gray-700 hover:bg-brand-50 hover:text-brand-900"
              >
                <Plus className="mr-2 h-4 w-4" />
                {t('products.viewSheet.addStock')}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={downloadAsPdf}
                className="h-9 rounded-lg border-gray-200 bg-white text-gray-700 hover:bg-brand-50 hover:text-brand-900"
              >
                <Download className="mr-2 h-4 w-4" />
                {t('products.viewSheet.downloadPdf')}
              </Button>
            </div>
          </div>
        </SheetHeader>

        <ScrollArea className="h-full">
          <div className="px-6 py-6" data-product-print>
            {!selectedProduct ? (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-6 text-sm text-gray-600">
                {t('products.viewSheet.empty')}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                  <div className="flex flex-col gap-4 lg:flex-row">
                    <div className="w-full lg:w-[340px]">
                      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-gray-50">
                        {selectedProduct.images[0] ? (
                          <img
                            src={selectedProduct.images[0]}
                            alt={selectedProduct.name}
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
                          onClick={() => selectedProduct.images[0] && openZoom(selectedProduct.images[0])}
                          disabled={!selectedProduct.images[0]}
                          className="h-9 rounded-lg border-gray-200 bg-white text-gray-700 hover:bg-brand-50 hover:text-brand-900"
                        >
                          <ZoomIn className="mr-2 h-4 w-4" />
                          {t('products.viewSheet.zoom')}
                        </Button>
                      </div>

                      <div className="mt-4">
                        <div className="text-xs font-semibold text-gray-500">{t('products.viewSheet.sections.gallery')}</div>
                        <div className="mt-2 grid grid-cols-3 gap-2" data-hide-print>
                          {selectedProduct.images.slice(0, 6).map((url) => (
                            <button
                              key={url}
                              type="button"
                              onClick={() => openZoom(url)}
                              className="overflow-hidden rounded-xl border border-gray-200 bg-gray-50"
                            >
                              <img
                                src={url}
                                alt={selectedProduct.name}
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
                          <div className="text-xl font-semibold text-gray-900">{selectedProduct.name}</div>
                          <div className="mt-1 text-sm text-gray-600">
                            {t('products.viewSheet.subtitle', {
                              vendor: selectedProduct.vendor,
                              category: selectedProduct.category,
                            })}
                          </div>
                        </div>
                        <div>
                          <ProductStatusBadge status={selectedProduct.status} label={statusLabel(selectedProduct.status)} />
                        </div>
                      </div>

                      <Separator className="my-4" />

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                          <div className="text-xs font-semibold text-gray-500">{t('products.viewSheet.sections.pricing')}</div>
                          <div className="mt-2 text-lg font-semibold text-gray-900">
                            {selectedProduct.pricing.priceFrom} - {selectedProduct.pricing.priceTo}
                          </div>
                          <div className="mt-3 space-y-2 text-sm">
                            <div className="flex items-center justify-between gap-3">
                              <span className="text-gray-500">{t('products.viewSheet.fields.cost')}</span>
                              <span className="font-medium text-gray-900">
                                {selectedProduct.pricing.cost || t('products.table.na')}
                              </span>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                              <span className="text-gray-500">{t('products.viewSheet.fields.margin')}</span>
                              <span className="font-medium text-gray-900">
                                {selectedProduct.pricing.margin || t('products.table.na')}
                              </span>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                              <span className="text-gray-500">{t('products.viewSheet.fields.compareAt')}</span>
                              <span className="font-medium text-gray-900">
                                {selectedProduct.pricing.compareAt || t('products.table.na')}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                          <div className="text-xs font-semibold text-gray-500">{t('products.viewSheet.sections.delivery')}</div>
                          <div className="mt-3 space-y-2 text-sm">
                            <div className="flex items-center justify-between gap-3">
                              <span className="text-gray-500">{t('products.viewSheet.fields.deliveryEnabled')}</span>
                              <span className="font-medium text-gray-900">
                                {selectedProduct.delivery.enabled
                                  ? t('products.viewSheet.yes')
                                  : t('products.viewSheet.no')}
                              </span>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                              <span className="text-gray-500">{t('products.viewSheet.fields.deliveryLocation')}</span>
                              <span className="font-medium text-gray-900">
                                {selectedProduct.delivery.location || t('products.table.na')}
                              </span>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                              <span className="text-gray-500">{t('products.viewSheet.fields.deliveryPrice')}</span>
                              <span className="font-medium text-gray-900">
                                {selectedProduct.delivery.price || t('products.table.na')}
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
                      <div className="text-xs font-semibold text-gray-500">{t('products.viewSheet.sections.description')}</div>
                      <div className="mt-2 text-sm text-gray-800">{selectedProduct.description}</div>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    {selectedProduct.tags.map((tag) => (
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
                    <div className="text-xs font-semibold text-gray-500">{t('products.viewSheet.sections.variants')}</div>
                    <div className="text-xs font-semibold text-gray-700">
                      {t('products.viewSheet.variantsCount', { count: selectedProduct.variants.length })}
                    </div>
                  </div>

                  <div className="mt-4 overflow-hidden rounded-xl border border-gray-200">
                    <div className="grid grid-cols-12 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-600">
                      <div className="col-span-5">{t('products.viewSheet.table.variant')}</div>
                      <div className="col-span-3">{t('products.viewSheet.table.sku')}</div>
                      <div className="col-span-2 text-right">{t('products.viewSheet.table.stock')}</div>
                      <div className="col-span-2 text-right">{t('products.viewSheet.table.price')}</div>
                    </div>
                    <div className="divide-y divide-gray-100">
                      {selectedProduct.variants.map((v) => (
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
                  <div className="text-xs font-semibold text-gray-500">{t('products.viewSheet.sections.staff')}</div>
                  <div className="mt-3 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                    <div className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
                      <span className="text-gray-500">{t('products.viewSheet.fields.createdBy')}</span>
                      <span className="font-medium text-gray-900">{selectedProduct.staff.createdBy}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
                      <span className="text-gray-500">{t('products.viewSheet.fields.updatedBy')}</span>
                      <span className="font-medium text-gray-900">{selectedProduct.staff.updatedBy}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </SheetContent>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-h-[85vh] w-[calc(100vw-24px)] max-w-4xl overflow-hidden rounded-2xl border border-gray-200 bg-white p-0 shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr]">
            <div className="border-b border-gray-100 bg-gray-50 p-5 lg:border-b-0 lg:border-r">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <DialogTitle className="text-lg font-semibold text-gray-900">{t('products.create.title')}</DialogTitle>
                  <DialogDescription className="mt-1 text-sm text-gray-600">
                    {t('products.create.subtitle')}
                  </DialogDescription>
                </div>
              </div>

              <div className="mt-5 space-y-2">
                {createSteps.map((s, idx) => {
                  const active = idx === createStep
                  const done = idx < createStep
                  const enabled = isStepEnabled(idx)
                  return (
                    <button
                      key={s.key}
                      type="button"
                      onClick={() => setCreateStep(idx)}
                      className={cn(
                        'flex w-full items-start gap-3 rounded-xl border px-3 py-2 text-left transition-colors',
                        active
                          ? 'border-brand-200 bg-white text-brand-900'
                          : 'border-transparent bg-transparent text-gray-700 hover:bg-white',
                        done ? 'opacity-100' : 'opacity-90'
                      )}
                    >
                      <span
                        className={cn(
                          'mt-0.5 flex h-5 w-5 items-center justify-center rounded-full border text-xs font-bold',
                          active
                            ? 'border-brand-200 bg-brand-50 text-brand-900'
                            : done
                              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                              : 'border-gray-200 bg-white text-gray-700'
                        )}
                      >
                        {done ? <Check className="h-3.5 w-3.5" /> : idx + 1}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold">
                          {s.title}{' '}
                          {!enabled ? (
                            <span className="ml-2 inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[11px] font-semibold text-gray-700">
                              {t('products.create.sections.skippedPill')}
                            </span>
                          ) : null}
                        </span>
                        <span className="mt-0.5 block text-xs font-medium text-gray-500">{s.description}</span>
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="flex max-h-[85vh] flex-col">
              <DialogHeader className="border-b border-gray-100 px-6 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <DialogTitle className="text-lg font-semibold text-gray-900">{createSteps[createStep]?.title}</DialogTitle>
                    <DialogDescription className="mt-1 text-sm text-gray-600">
                      {createSteps[createStep]?.description}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <ScrollArea className="h-full">
                <div className="space-y-4 px-6 py-6">
                  {createStep === 0 ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold text-gray-700">{t('products.create.fields.name')}</Label>
                          <Input
                            value={draftProduct.name}
                            onChange={(e) => setDraftProduct((p) => ({ ...p, name: e.target.value }))}
                            placeholder={t('products.create.fields.namePlaceholder')}
                            className="h-10 rounded-xl border-gray-200 bg-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold text-gray-700">{t('products.create.fields.vendor')}</Label>
                          <Input
                            value={draftProduct.vendor}
                            onChange={(e) => setDraftProduct((p) => ({ ...p, vendor: e.target.value }))}
                            placeholder={t('products.create.fields.vendorPlaceholder')}
                            className="h-10 rounded-xl border-gray-200 bg-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold text-gray-700">{t('products.create.fields.category')}</Label>
                          <Input
                            value={draftProduct.category}
                            onChange={(e) => setDraftProduct((p) => ({ ...p, category: e.target.value }))}
                            placeholder={t('products.create.fields.categoryPlaceholder')}
                            className="h-10 rounded-xl border-gray-200 bg-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold text-gray-700">{t('products.create.fields.status')}</Label>
                          <select
                            value={draftProduct.status}
                            onChange={(e) => setDraftProduct((p) => ({ ...p, status: e.target.value as ProductStatus }))}
                            className="h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900"
                          >
                            <option value="draft">{t('products.status.draft')}</option>
                            <option value="active">{t('products.status.active')}</option>
                            <option value="archived">{t('products.status.archived')}</option>
                          </select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-gray-700">{t('products.create.fields.description')}</Label>
                        <Textarea
                          value={draftProduct.description}
                          onChange={(e) => setDraftProduct((p) => ({ ...p, description: e.target.value }))}
                          placeholder={t('products.create.fields.descriptionPlaceholder')}
                          className="min-h-[120px] rounded-xl border-gray-200 bg-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-gray-700">{t('products.create.fields.tags')}</Label>
                        <Input
                          value={draftProduct.tags}
                          onChange={(e) => setDraftProduct((p) => ({ ...p, tags: e.target.value }))}
                          placeholder={t('products.create.fields.tagsPlaceholder')}
                          className="h-10 rounded-xl border-gray-200 bg-white"
                        />
                        <div className="text-xs font-medium text-gray-500">{t('products.create.fields.tagsHint')}</div>
                      </div>
                    </div>
                  ) : null}

                  {createStep === 1 ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-gray-900">{t('products.create.sections.applies')}</div>
                          <div className="mt-0.5 text-xs font-medium text-gray-500">{t('products.create.sections.mediaHint')}</div>
                        </div>
                        <Switch
                          checked={draftProduct.mediaSectionEnabled}
                          onCheckedChange={(v) => setSectionEnabled('media', Boolean(v))}
                        />
                      </div>

                      {!draftProduct.mediaSectionEnabled ? (
                        <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-6">
                          <div className="text-sm font-semibold text-gray-900">{t('products.create.sections.skippedTitle')}</div>
                          <div className="mt-1 text-sm text-gray-600">{t('products.create.sections.skippedBody')}</div>
                          <div className="mt-4">
                            <Button
                              type="button"
                              onClick={() => setSectionEnabled('media', true)}
                              className="h-10 rounded-xl bg-brand-900 text-white hover:bg-brand-800"
                            >
                              {t('products.create.sections.enable')}
                            </Button>
                          </div>
                        </div>
                      ) : null}

                      {draftProduct.mediaSectionEnabled ? (
                      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <div className="text-sm font-semibold text-gray-900">{t('products.create.media.addImages')}</div>
                            <div className="mt-1 text-xs font-medium text-gray-500">{t('products.create.media.addImagesHint')}</div>
                          </div>
                        </div>

                        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="text-xs font-medium text-gray-600">{t('products.create.media.uploadHint')}</div>
                          <div>
                            <input
                              id={mediaUploadInputId}
                              type="file"
                              accept="image/*"
                              multiple
                              className="hidden"
                              onChange={(e) => {
                                const files = Array.from(e.target.files ?? [])
                                const urls: string[] = []
                                for (const f of files) urls.push(URL.createObjectURL(f))
                                addImages(urls)
                                e.target.value = ''
                              }}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => document.getElementById(mediaUploadInputId)?.click()}
                              className="h-10 rounded-xl border-gray-200 bg-white text-gray-700 hover:bg-brand-50 hover:text-brand-900"
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              {t('products.create.media.upload')}
                            </Button>
                          </div>
                        </div>

                        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                          <Input
                            value={draftProduct.newImageUrl}
                            onChange={(e) => setDraftProduct((p) => ({ ...p, newImageUrl: e.target.value }))}
                            placeholder={t('products.create.media.urlPlaceholder')}
                            className="h-10 flex-1 rounded-xl border-gray-200 bg-white"
                          />
                          <Button
                            type="button"
                            onClick={() => {
                              const url = draftProduct.newImageUrl.trim()
                              if (!url) return
                              addImages([url])
                              setDraftProduct((p) => ({ ...p, newImageUrl: '' }))
                            }}
                            className="h-10 rounded-xl bg-brand-900 text-white hover:bg-brand-800"
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            {t('products.create.media.add')}
                          </Button>
                        </div>

                        {draftProduct.images.length > 0 ? (
                          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                            {draftProduct.images.map((url) => (
                              <div key={url} className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-gray-50">
                                <img
                                  src={url}
                                  alt={draftProduct.name || t('products.create.media.defaultAlt')}
                                  className="h-28 w-full object-cover"
                                  loading="lazy"
                                />
                                <div className="absolute inset-0 hidden items-end justify-between bg-gradient-to-t from-black/50 to-transparent p-2 group-hover:flex">
                                  <button
                                    type="button"
                                    onClick={() => openZoom(url)}
                                    className="inline-flex h-8 items-center gap-2 rounded-lg bg-white/90 px-2 text-xs font-semibold text-gray-900"
                                  >
                                    <ZoomIn className="h-3.5 w-3.5" />
                                    {t('products.create.media.zoom')}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => removeImage(url)}
                                    className="inline-flex h-8 items-center rounded-lg bg-white/90 px-2 text-xs font-semibold text-gray-900"
                                  >
                                    {t('products.create.media.remove')}
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="mt-4 rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-6 text-sm text-gray-600">
                            {t('products.create.media.empty')}
                          </div>
                        )}
                      </div>
                      ) : null}
                    </div>
                  ) : null}

                  {createStep === 2 ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-gray-900">{t('products.create.sections.applies')}</div>
                          <div className="mt-0.5 text-xs font-medium text-gray-500">{t('products.create.sections.variantsHint')}</div>
                        </div>
                        <Switch
                          checked={draftProduct.variantsSectionEnabled}
                          onCheckedChange={(v) => setSectionEnabled('variants', Boolean(v))}
                        />
                      </div>

                      {!draftProduct.variantsSectionEnabled ? (
                        <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-6">
                          <div className="text-sm font-semibold text-gray-900">{t('products.create.sections.skippedTitle')}</div>
                          <div className="mt-1 text-sm text-gray-600">{t('products.create.sections.skippedBody')}</div>
                          <div className="mt-4">
                            <Button
                              type="button"
                              onClick={() => setSectionEnabled('variants', true)}
                              className="h-10 rounded-xl bg-brand-900 text-white hover:bg-brand-800"
                            >
                              {t('products.create.sections.enable')}
                            </Button>
                          </div>
                        </div>
                      ) : null}

                      {draftProduct.variantsSectionEnabled ? (
                        <>
                          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                            <div className="text-sm font-semibold text-gray-900">{t('products.create.variants.colors')}</div>
                            <div className="mt-1 text-xs font-medium text-gray-500">{t('products.create.variants.colorsHint')}</div>
                            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                              {draftProduct.colors.map((c, idx) => (
                                <div key={`${c.name}-${idx}`} className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3">
                                  <label
                                    htmlFor={`products-create-color-${idx}`}
                                    className="inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-gray-200 bg-white"
                                    title={t('products.create.variants.colorPickerAria')}
                                  >
                                    <span className="h-7 w-7 rounded-lg" style={{ backgroundColor: c.hex }} />
                                  </label>
                                  <input
                                    id={`products-create-color-${idx}`}
                                    type="color"
                                    value={c.hex}
                                    onChange={(e) =>
                                      setDraftProduct((p) => {
                                        const nextHex = e.target.value
                                        const next = [...p.colors]
                                        const prevName = next[idx]?.name ?? ''
                                        next[idx] = {
                                          ...next[idx],
                                          hex: nextHex,
                                          name: prevName.trim().length > 0 ? '' : prevName,
                                        }
                                        return { ...p, colors: next }
                                      })
                                    }
                                    aria-label={t('products.create.variants.colorPickerAria')}
                                    className="h-0 w-0 overflow-hidden opacity-0"
                                  />
                                  <Input
                                    value={c.name}
                                    onChange={(e) =>
                                      setDraftProduct((p) => {
                                        const next = [...p.colors]
                                        next[idx] = { ...next[idx], name: e.target.value }
                                        return { ...p, colors: next }
                                      })
                                    }
                                    className="h-9 flex-1 rounded-lg border-gray-200 bg-white"
                                    placeholder={t('products.create.variants.colorNamePlaceholder')}
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                      setDraftProduct((p) => ({
                                        ...p,
                                        colors: p.colors.filter((_, i) => i !== idx),
                                      }))
                                    }
                                    className="h-9 w-9 rounded-lg text-gray-700 hover:bg-brand-50 hover:text-brand-900"
                                    aria-label={t('products.create.variants.removeColorAria')}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                            <div className="mt-4">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() =>
                                  setDraftProduct((p) => ({
                                    ...p,
                                    colors: [...p.colors, { name: '', hex: '#111827' }],
                                  }))
                                }
                                className="h-9 rounded-lg border-gray-200 bg-white text-gray-700 hover:bg-brand-50 hover:text-brand-900"
                              >
                                <Plus className="mr-2 h-4 w-4" />
                                {t('products.create.variants.addColor')}
                              </Button>
                            </div>
                          </div>

                          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                            <div className="text-sm font-semibold text-gray-900">{t('products.create.variants.sizes')}</div>
                            <div className="mt-1 text-xs font-medium text-gray-500">{t('products.create.variants.sizesHint')}</div>
                            <div className="mt-4 flex flex-wrap gap-2">
                              {draftProduct.sizes.map((s) => (
                                <button
                                  key={s}
                                  type="button"
                                  onClick={() =>
                                    setDraftProduct((p) => ({
                                      ...p,
                                      sizes: p.sizes.filter((x) => x !== s),
                                    }))
                                  }
                                  className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-sm font-semibold text-gray-800"
                                >
                                  {s}
                                  <span className="text-gray-500">×</span>
                                </button>
                              ))}
                            </div>
                            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                              <Input
                                value={draftProduct.models.join(', ')}
                                onChange={(e) =>
                                  setDraftProduct((p) => ({
                                    ...p,
                                    models: e.target.value
                                      .split(',')
                                      .map((x) => x.trim())
                                      .filter(Boolean),
                                  }))
                                }
                                placeholder={t('products.create.variants.modelsPlaceholder')}
                                className="h-10 flex-1 rounded-xl border-gray-200 bg-white"
                              />
                            </div>
                          </div>
                        </>
                      ) : null}
                    </div>
                  ) : null}

                  {createStep === 3 ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold text-gray-700">{t('products.create.pricing.price')}</Label>
                          <Input
                            value={draftProduct.price}
                            onChange={(e) => setDraftProduct((p) => ({ ...p, price: e.target.value }))}
                            placeholder={t('products.create.pricing.pricePlaceholder')}
                            className="h-10 rounded-xl border-gray-200 bg-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold text-gray-700">{t('products.create.pricing.compareAt')}</Label>
                          <Input
                            value={draftProduct.compareAt}
                            onChange={(e) => setDraftProduct((p) => ({ ...p, compareAt: e.target.value }))}
                            placeholder={t('products.create.pricing.compareAtPlaceholder')}
                            className="h-10 rounded-xl border-gray-200 bg-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold text-gray-700">{t('products.create.pricing.cost')}</Label>
                          <Input
                            value={draftProduct.cost}
                            onChange={(e) => setDraftProduct((p) => ({ ...p, cost: e.target.value }))}
                            placeholder={t('products.create.pricing.costPlaceholder')}
                            className="h-10 rounded-xl border-gray-200 bg-white"
                          />
                        </div>
                        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
                          <div className="flex items-center gap-2 font-semibold text-gray-900">
                            <Sparkles className="h-4 w-4" />
                            {t('products.create.pricing.smartHintTitle')}
                          </div>
                          <div className="mt-2 text-sm text-gray-600">{t('products.create.pricing.smartHintBody')}</div>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {createStep === 4 ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-gray-900">{t('products.create.sections.applies')}</div>
                          <div className="mt-0.5 text-xs font-medium text-gray-500">{t('products.create.sections.deliveryHint')}</div>
                        </div>
                        <Switch
                          checked={draftProduct.deliverySectionEnabled}
                          onCheckedChange={(v) => setSectionEnabled('delivery', Boolean(v))}
                        />
                      </div>

                      {!draftProduct.deliverySectionEnabled ? (
                        <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-6">
                          <div className="text-sm font-semibold text-gray-900">{t('products.create.sections.skippedTitle')}</div>
                          <div className="mt-1 text-sm text-gray-600">{t('products.create.sections.skippedBody')}</div>
                          <div className="mt-4">
                            <Button
                              type="button"
                              onClick={() => setSectionEnabled('delivery', true)}
                              className="h-10 rounded-xl bg-brand-900 text-white hover:bg-brand-800"
                            >
                              {t('products.create.sections.enable')}
                            </Button>
                          </div>
                        </div>
                      ) : null}

                      {draftProduct.deliverySectionEnabled ? (
                        <>
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                              <Label className="text-sm font-semibold text-gray-700">{t('products.create.delivery.enabled')}</Label>
                              <select
                                value={draftProduct.deliveryEnabled ? 'yes' : 'no'}
                                onChange={(e) =>
                                  setDraftProduct((p) => ({ ...p, deliveryEnabled: e.target.value === 'yes' }))
                                }
                                className="h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900"
                              >
                                <option value="yes">{t('products.viewSheet.yes')}</option>
                                <option value="no">{t('products.viewSheet.no')}</option>
                              </select>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-semibold text-gray-700">{t('products.create.delivery.location')}</Label>
                              <Input
                                value={draftProduct.deliveryLocation}
                                onChange={(e) => setDraftProduct((p) => ({ ...p, deliveryLocation: e.target.value }))}
                                placeholder={t('products.create.delivery.locationPlaceholder')}
                                className="h-10 rounded-xl border-gray-200 bg-white"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-semibold text-gray-700">{t('products.create.delivery.price')}</Label>
                              <Input
                                value={draftProduct.deliveryPrice}
                                onChange={(e) => setDraftProduct((p) => ({ ...p, deliveryPrice: e.target.value }))}
                                placeholder={t('products.create.delivery.pricePlaceholder')}
                                className="h-10 rounded-xl border-gray-200 bg-white"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-semibold text-gray-700">{t('products.create.delivery.internalNote')}</Label>
                            <Textarea
                              value={draftProduct.internalNote}
                              onChange={(e) => setDraftProduct((p) => ({ ...p, internalNote: e.target.value }))}
                              placeholder={t('products.create.delivery.internalNotePlaceholder')}
                              className="min-h-[120px] rounded-xl border-gray-200 bg-white"
                            />
                          </div>
                        </>
                      ) : null}
                    </div>
                  ) : null}

                  {createStep === 5 ? (
                    <div className="space-y-4">
                      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-sm font-semibold text-gray-900">{t('products.create.review.title')}</div>
                            <div className="mt-1 text-xs font-medium text-gray-500">{t('products.create.review.subtitle')}</div>
                          </div>
                          <Badge className="rounded-full border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-50">
                            {statusLabel(draftProduct.status)}
                          </Badge>
                        </div>

                        <Separator className="my-4" />

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div className="space-y-1">
                            <div className="text-xs font-semibold text-gray-500">{t('products.create.fields.name')}</div>
                            <div className="text-sm font-semibold text-gray-900">{draftProduct.name || t('products.table.na')}</div>
                          </div>
                          <div className="space-y-1">
                            <div className="text-xs font-semibold text-gray-500">{t('products.create.fields.vendor')}</div>
                            <div className="text-sm font-semibold text-gray-900">{draftProduct.vendor || t('products.table.na')}</div>
                          </div>
                          <div className="space-y-1">
                            <div className="text-xs font-semibold text-gray-500">{t('products.create.fields.category')}</div>
                            <div className="text-sm font-semibold text-gray-900">{draftProduct.category || t('products.table.na')}</div>
                          </div>
                          <div className="space-y-1">
                            <div className="text-xs font-semibold text-gray-500">{t('products.create.pricing.price')}</div>
                            <div className="text-sm font-semibold text-gray-900">{draftProduct.price || t('products.table.na')}</div>
                          </div>
                        </div>

                        <div className="mt-4 rounded-2xl border border-gray-200 bg-gray-50 p-4">
                          <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                            <Sparkles className="h-4 w-4" />
                            {t('products.create.review.nextTitle')}
                          </div>
                          <div className="mt-2 text-sm text-gray-600">{t('products.create.review.nextBody')}</div>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              </ScrollArea>

              <div className="border-t border-gray-100 px-6 py-4">
                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={closeCreate}
                    className="h-10 rounded-xl border-gray-200 bg-white text-gray-700 hover:bg-brand-50 hover:text-brand-900"
                  >
                    {t('products.create.cancel')}
                  </Button>

                  <div className="flex items-center justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={prevStep}
                      disabled={createStep === 0}
                      className="h-10 rounded-xl border-gray-200 bg-white text-gray-700 hover:bg-brand-50 hover:text-brand-900 disabled:opacity-50"
                    >
                      <ChevronLeft className="mr-2 h-4 w-4" />
                      {t('products.create.back')}
                    </Button>
                    {createStep < createSteps.length - 1 ? (
                      <Button
                        type="button"
                        onClick={nextStep}
                        disabled={!canGoNext}
                        className="h-10 rounded-xl bg-brand-900 text-white hover:bg-brand-800 disabled:opacity-50"
                      >
                        {t('products.create.next')}
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        onClick={() => {
                          setCreateOpen(false)
                          setCreateStep(0)
                          const q = draftProduct.name.trim()
                          router.push(`/dashboard/inventory?q=${encodeURIComponent(q)}&action=restock`)
                        }}
                        className="h-10 rounded-xl bg-brand-900 text-white hover:bg-brand-800"
                      >
                        <Sparkles className="mr-2 h-4 w-4" />
                        {t('products.create.finish')}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={zoomOpen} onOpenChange={setZoomOpen}>
        <DialogContent className="w-[calc(100vw-24px)] max-w-5xl overflow-hidden rounded-2xl border border-gray-200 bg-white p-0 shadow-xl">
          <div className="border-b border-gray-100 px-6 py-4">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold text-gray-900">{t('products.zoom.title')}</DialogTitle>
              <DialogDescription className="mt-1 text-sm text-gray-600">{t('products.zoom.subtitle')}</DialogDescription>
            </DialogHeader>
          </div>
          <div className="bg-black">
            {zoomUrl ? (
              <img src={zoomUrl} alt={t('products.zoom.alt')} className="max-h-[70vh] w-full object-contain" />
            ) : (
              <div className="flex h-[50vh] items-center justify-center text-white">{t('products.table.na')}</div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Sheet>
  )
}
