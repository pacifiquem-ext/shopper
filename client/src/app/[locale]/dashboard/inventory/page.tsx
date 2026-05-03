'use client'

import { KpiStatCard } from '@/components/dashboard/shared/kpi-stat-card'
import { StockBadge } from '@/components/dashboard/shared/status-badges'
import { InventoryViewSheet } from '@/components/dashboard/inventory/inventory-view-sheet'
import { InventoryAdjustDialog } from '@/components/dashboard/inventory/inventory-adjust-dialog'
import { Button } from '@/components/ui/button'
import { DataTable, type DataTableColumn } from '@/components/ui/data-table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type {
  InventoryRow,
  InventoryTab,
  ProductDetails,
  InventoryFilters,
  StockStatus,
} from '@/types'
import { cn } from '@/lib/utils'
import { clampPercent } from '@/utils/dashboard'
import {
  ChevronDown,
  Download,
  Eye,
  Filter,
  MoreHorizontal,
  Package,
  Plus,
  Search,
} from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { inventoryService, type InventoryRecordApi } from '@/services/inventory.service'
import { analyticsService } from '@/services/analytics.service'

function mapInvStatus(s: string): StockStatus {
  if (s === 'OUT_OF_STOCK') return 'outOfStock'
  if (s === 'LOW_STOCK') return 'lowStock'
  return 'inStock'
}

function apiToInventoryRow(r: InventoryRecordApi): InventoryRow {
  return {
    id: r.productVariantId,
    name: r.productVariant.product.name,
    category: r.productVariant.product.category,
    sku: r.productVariant.sku,
    vendor: r.productVariant.product.vendor,
    stock: r.onHand,
    status: mapInvStatus(r.status),
  }
}

function apiToInventoryDetails(r: InventoryRecordApi): ProductDetails {
  const price = r.productVariant.price
  const cost = r.productVariant.cost ?? 0
  const margin = cost > 0 && price > 0 ? `${Math.round(((price - cost) / price) * 100)}%` : '—'

  return {
    id: r.productVariantId,
    name: r.productVariant.product.name,
    sku: r.productVariant.sku,
    category: r.productVariant.product.category,
    vendor: r.productVariant.product.vendor,
    status: mapInvStatus(r.status),
    stock: {
      onHand: r.onHand,
      reserved: r.reserved,
      available: r.available,
      reorderPoint: r.reorderPoint,
      updatedAt: new Date(r.updatedAt).toLocaleString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    },
    pricing: {
      price: price.toLocaleString(),
      cost: cost ? cost.toLocaleString() : '—',
      margin,
    },
    shipping: { weight: '—', deliveryEligible: '—' },
    staff: { createdBy: 'Store Owner', updatedBy: 'Store Owner' },
    notes: { internalNote: '' },
    events: (r.events ?? []).map((e) => ({
      id: e.id,
      type: e.type.toLowerCase().replace('_', '') as any,
      at: new Date(e.createdAt).toLocaleString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      title: e.type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()),
      description: e.reason ?? '',
    })),
  }
}

export default function InventoryPage() {
  const t = useTranslations('dashboard')
  const searchParams = useSearchParams()

  const [tab, setTab] = useState<InventoryTab>('all')
  const [query, setQuery] = useState('')
  const [viewOpen, setViewOpen] = useState(false)
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null)
  const [adjustOpen, setAdjustOpen] = useState(false)
  const [adjustMode, setAdjustMode] = useState<'restock' | 'adjust'>('restock')
  const [adjustQuantity, setAdjustQuantity] = useState('')
  const [filters, setFilters] = useState<InventoryFilters>({
    vendor: 'any',
    category: 'any',
    status: 'any',
    sku: '',
    stockRange: [0, 200],
  })

  const [filtersDraft, setFiltersDraft] = useState(filters)

  const [rows, setRows] = useState<InventoryRow[]>([])
  const [totalAssetValue, setTotalAssetValue] = useState<string>('—')

  const [detailsById, setDetailsById] = useState<Map<string, ProductDetails>>(new Map())

  const selectedProduct = useMemo(() => {
    if (!selectedProductId) return null
    const base = detailsById.get(selectedProductId) ?? null
    if (!base) return null

    const row = rows.find((r) => r.id === selectedProductId)
    if (!row) return base

    const reserved = base.stock.reserved
    const onHand = row.stock
    const available = Math.max(0, onHand - reserved)
    const status: StockStatus =
      onHand <= 0 ? 'outOfStock' : onHand < base.stock.reorderPoint ? 'lowStock' : 'inStock'

    return { ...base, status, stock: { ...base.stock, onHand, available } }
  }, [detailsById, rows, selectedProductId])

  // Fetch inventory list + analytics on mount
  useEffect(() => {
    inventoryService.getAll({ limit: 200 }).then((res) => {
      const list: any = res?.data
      const items: InventoryRecordApi[] = list?.data ?? []
      setRows(items.map(apiToInventoryRow))
    })
    analyticsService.getInventorySummary().then((res) => {
      const summary = (res?.data as any)?.data ?? res?.data
      if (summary?.totalStockValue != null) {
        setTotalAssetValue(
          Number(summary.totalStockValue).toLocaleString(undefined, {
            style: 'currency',
            currency: 'RWF',
            maximumFractionDigits: 0,
          }),
        )
      }
    })
  }, [])

  // Lazy-load detail when a product is selected
  useEffect(() => {
    if (!selectedProductId || detailsById.has(selectedProductId)) return
    inventoryService.getByVariantId(selectedProductId).then((res) => {
      const r: InventoryRecordApi | null = (res?.data as any)?.data ?? res?.data ?? null
      if (r) setDetailsById((prev) => new Map(prev).set(selectedProductId, apiToInventoryDetails(r)))
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProductId])

  const openView = useCallback((id: string) => {
    setSelectedProductId(id)
    setViewOpen(true)
  }, [])

  const openAdjust = useCallback((id: string, mode: 'restock' | 'adjust') => {
    setSelectedProductId(id)
    setAdjustMode(mode)
    setAdjustQuantity('')
    setAdjustOpen(true)
  }, [])

  const handleExport = useCallback(async () => {
    try {
      const blob = await inventoryService.exportCsv()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'inventory.csv'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch {}
  }, [])

  const applyAdjustment = useCallback(async () => {
    const qty = Number(adjustQuantity)
    if (!Number.isFinite(qty) || !selectedProductId) return
    if (adjustMode === 'restock' && qty <= 0) return

    const currentStock = rows.find((r) => r.id === selectedProductId)?.stock ?? 0
    const delta = adjustMode === 'restock' ? qty : qty - currentStock
    const reason = adjustMode === 'restock' ? 'Manual restock' : 'Manual adjustment'

    try {
      const res = await inventoryService.adjustStock(selectedProductId, delta, reason)
      const updated: InventoryRecordApi | null = (res?.data as any)?.data ?? res?.data ?? null
      if (updated) {
        setRows((prev) =>
          prev.map((r) => (r.id === selectedProductId ? apiToInventoryRow(updated) : r)),
        )
        setDetailsById((prev) =>
          new Map(prev).set(selectedProductId, apiToInventoryDetails(updated)),
        )
      }
    } catch {}

    setAdjustOpen(false)
  }, [adjustMode, adjustQuantity, selectedProductId, rows])

  useEffect(() => {
    const sku = searchParams.get('sku')
    const q = searchParams.get('q')
    const action = searchParams.get('action')
    if (!sku && !action) return

    const id = sku
      ? rows.find((r) => r.sku === sku)?.id
      : q
        ? rows.find((r) => {
            const x = q.toLowerCase()
            return (
              r.name.toLowerCase().includes(x) ||
              r.sku.toLowerCase().includes(x) ||
              r.vendor.toLowerCase().includes(x)
            )
          })?.id
        : undefined
    if (!id) return

    setSelectedProductId(id)

    if (action === 'view') {
      setViewOpen(true)
      return
    }

    if (action === 'restock' || action === 'adjust') {
      setAdjustMode(action)
      setAdjustQuantity('')
      setAdjustOpen(true)
    }
  }, [rows, searchParams])


  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase()
    const skuQ = filters.sku.trim().toLowerCase()

    let data = rows

    if (tab === 'inStock') data = data.filter((r) => r.status === 'inStock')
    if (tab === 'lowStock') data = data.filter((r) => r.status === 'lowStock')
    if (tab === 'outOfStock') data = data.filter((r) => r.status === 'outOfStock')

    if (q) {
      data = data.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.category.toLowerCase().includes(q) ||
          r.sku.toLowerCase().includes(q) ||
          r.vendor.toLowerCase().includes(q)
      )
    }

    if (filters.vendor !== 'any') data = data.filter((r) => r.vendor === filters.vendor)
    if (filters.category !== 'any') data = data.filter((r) => r.category === filters.category)
    if (filters.status !== 'any') data = data.filter((r) => r.status === filters.status)
    if (skuQ) data = data.filter((r) => r.sku.toLowerCase().includes(skuQ))

    data = data.filter((r) => r.stock >= filters.stockRange[0] && r.stock <= filters.stockRange[1])

    return data
  }, [filters.category, filters.sku, filters.status, filters.stockRange, filters.vendor, query, rows, tab])

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

  const stockMax = useMemo(() => {
    const max = Math.max(0, ...rows.map((r) => r.stock))
    return Math.max(50, Math.ceil(max / 10) * 10)
  }, [rows])

  const applyFilters = () => {
    setFilters({
      ...filtersDraft,
      stockRange: [
        Math.min(filtersDraft.stockRange[0], filtersDraft.stockRange[1]),
        Math.max(filtersDraft.stockRange[0], filtersDraft.stockRange[1]),
      ],
    })
  }

  const clearFilters = () => {
    const next = {
      vendor: 'any',
      category: 'any',
      status: 'any' as const,
      sku: '',
      stockRange: [0, stockMax] as [number, number],
    }

    setFilters(next)
    setFiltersDraft(next)
  }

  const stats = useMemo(() => {
    const total = rows.length
    const inStock = rows.filter((r) => r.status === 'inStock').length
    const lowStock = rows.filter((r) => r.status === 'lowStock').length
    const outOfStock = rows.filter((r) => r.status === 'outOfStock').length

    return { total, inStock, lowStock, outOfStock }
  }, [rows])

  const stockBar = useMemo(() => {
    const total = Math.max(1, stats.total)
    const inPct = clampPercent((stats.inStock / total) * 100)
    const lowPct = clampPercent((stats.lowStock / total) * 100)
    const outPct = clampPercent((stats.outOfStock / total) * 100)

    return { inPct, lowPct, outPct }
  }, [stats.inStock, stats.lowStock, stats.outOfStock, stats.total])

  const columns: DataTableColumn<InventoryRow>[] = useMemo(
    () => [
      {
        id: 'name',
        header: t('inventory.table.name'),
        cell: (r) => (
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-gray-700">
              <Package className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="truncate font-medium text-gray-900">{r.name}</div>
              <div className="mt-0.5 truncate text-xs font-medium text-gray-500">{r.sku}</div>
            </div>
          </div>
        ),
      },
      { id: 'category', header: t('inventory.table.category'), cell: (r) => r.category, className: 'text-gray-600' },
      { id: 'sku', header: t('inventory.table.sku'), cell: (r) => r.sku, className: 'text-gray-600' },
      { id: 'vendor', header: t('inventory.table.vendor'), cell: (r) => r.vendor, className: 'text-gray-600' },
      {
        id: 'stock',
        header: t('inventory.table.stock'),
        cell: (r) => <span className="font-medium text-gray-900">{r.stock}</span>,
        className: 'text-gray-600',
      },
      {
        id: 'status',
        header: t('inventory.table.status'),
        cell: (r) => (
          <StockBadge
            status={r.status}
            labels={{
              inStock: t('inventory.status.inStock'),
              lowStock: t('inventory.status.lowStock'),
              outOfStock: t('inventory.status.outOfStock'),
            }}
          />
        ),
      },
      {
        id: 'action',
        header: t('inventory.table.action'),
        cell: (r) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label={t('inventory.table.moreAria')}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 shadow-xs transition-colors hover:bg-brand-50 hover:text-brand-900"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="border-gray-200 bg-white text-gray-900 shadow-md">
              <DropdownMenuItem
                onSelect={() => openView(r.id)}
                className="cursor-pointer rounded-md focus:bg-brand-50 focus:text-brand-900"
              >
                <Eye className="h-4 w-4 text-gray-600" />
                <span>{t('inventory.table.view')}</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => openAdjust(r.id, 'restock')}
                className="cursor-pointer rounded-md focus:bg-brand-50 focus:text-brand-900"
              >
                <Plus className="h-4 w-4 text-gray-600" />
                <span>{t('inventory.table.restock')}</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => openAdjust(r.id, 'adjust')}
                className="cursor-pointer rounded-md focus:bg-brand-50 focus:text-brand-900"
              >
                <Package className="h-4 w-4 text-gray-600" />
                <span>{t('inventory.table.adjustStock')}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
        className: 'text-right',
        headerClassName: 'text-right',
      },
    ],
    [openAdjust, openView, t]
  )

  return (
    <div className="flex w-full max-w-6xl flex-col gap-6">
      <h1 className="sr-only">{t('nav.inventory')}</h1>

      <InventoryViewSheet
        open={viewOpen}
        onOpenChange={setViewOpen}
        product={selectedProduct}
        onOpenAdjust={openAdjust}
      />

      <InventoryAdjustDialog
        open={adjustOpen}
        onOpenChange={setAdjustOpen}
        mode={adjustMode}
        quantity={adjustQuantity}
        onQuantityChange={setAdjustQuantity}
        onConfirm={applyAdjustment}
        productId={selectedProductId}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2">
          <div className="text-xl font-semibold leading-9 text-gray-900">{t('inventory.title')}</div>
          <div className="text-sm text-gray-600">{t('inventory.subtitle')}</div>
        </div>

        <div className="flex items-center gap-2 sm:pt-0.5">
          <Button
            type="button"
            variant="outline"
            className="h-9 rounded-lg border-gray-200 bg-white text-gray-700 hover:bg-brand-50 hover:text-brand-900"
            onClick={handleExport}
          >
            <Download className="h-4 w-4" />
            {t('inventory.export')}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-9 rounded-lg border-gray-200 bg-white text-gray-700 hover:bg-brand-50 hover:text-brand-900"
          >
            {t('inventory.moreActions')}
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiStatCard title={t('inventory.kpis.totalAssetValue')} value={totalAssetValue} trendLabel={t('inventory.kpis.thisMonth')} />
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs font-semibold text-gray-500">{t('inventory.kpis.products')}</div>
              <div className="mt-2 text-2xl font-semibold text-gray-900">
                {t('inventory.kpis.productsCount', { count: stats.total })}
              </div>
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  aria-label={t('inventory.kpis.filtersAria')}
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 shadow-xs transition-colors',
                    'hover:bg-brand-50 hover:text-brand-900'
                  )}
                >
                  <Filter className="h-4 w-4" />
                </button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-[360px] border-gray-200 bg-white p-4 text-gray-900 shadow-md">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-gray-900">{t('inventory.filters.title')}</div>
                    <div className="mt-0.5 text-xs font-medium text-gray-500">{t('inventory.filters.subtitle')}</div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-4">
                  <div className="grid gap-2">
                    <Label className="text-xs font-semibold text-gray-600">{t('inventory.filters.vendor')}</Label>
                    <Select
                      value={filtersDraft.vendor}
                      onValueChange={(v) => setFiltersDraft((p) => ({ ...p, vendor: v }))}
                    >
                      <SelectTrigger className="h-9 rounded-lg border-gray-200 bg-white text-sm">
                        <SelectValue placeholder={t('inventory.filters.any')} />
                      </SelectTrigger>
                      <SelectContent className="border-gray-200 bg-white text-gray-900">
                        <SelectItem value="any">{t('inventory.filters.any')}</SelectItem>
                        {vendors.map((v) => (
                          <SelectItem key={v} value={v}>
                            {v}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label className="text-xs font-semibold text-gray-600">{t('inventory.filters.category')}</Label>
                    <Select
                      value={filtersDraft.category}
                      onValueChange={(v) => setFiltersDraft((p) => ({ ...p, category: v }))}
                    >
                      <SelectTrigger className="h-9 rounded-lg border-gray-200 bg-white text-sm">
                        <SelectValue placeholder={t('inventory.filters.any')} />
                      </SelectTrigger>
                      <SelectContent className="border-gray-200 bg-white text-gray-900">
                        <SelectItem value="any">{t('inventory.filters.any')}</SelectItem>
                        {categories.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label className="text-xs font-semibold text-gray-600">{t('inventory.filters.status')}</Label>
                    <Select
                      value={filtersDraft.status}
                      onValueChange={(v) => setFiltersDraft((p) => ({ ...p, status: v as StockStatus | 'any' }))}
                    >
                      <SelectTrigger className="h-9 rounded-lg border-gray-200 bg-white text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="border-gray-200 bg-white text-gray-900">
                        <SelectItem value="any">{t('inventory.filters.any')}</SelectItem>
                        <SelectItem value="inStock">{t('inventory.status.inStock')}</SelectItem>
                        <SelectItem value="lowStock">{t('inventory.status.lowStock')}</SelectItem>
                        <SelectItem value="outOfStock">{t('inventory.status.outOfStock')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label className="text-xs font-semibold text-gray-600">{t('inventory.filters.sku')}</Label>
                    <Input
                      value={filtersDraft.sku}
                      onChange={(e) => setFiltersDraft((p) => ({ ...p, sku: e.target.value }))}
                      placeholder={t('inventory.filters.skuPlaceholder')}
                      className="h-9 rounded-lg border-gray-200 bg-white"
                    />
                  </div>

                  <div className="grid gap-2">
                    <div className="flex items-center justify-between gap-3">
                      <Label className="text-xs font-semibold text-gray-600">{t('inventory.filters.stockRange')}</Label>
                      <div className="text-xs font-semibold text-gray-700">
                        {filtersDraft.stockRange[0]} - {filtersDraft.stockRange[1]}
                      </div>
                    </div>
                    <Slider
                      value={filtersDraft.stockRange}
                      onValueChange={(v) => setFiltersDraft((p) => ({ ...p, stockRange: [v[0] ?? 0, v[1] ?? stockMax] }))}
                      min={0}
                      max={stockMax}
                      step={1}
                    />
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={clearFilters}
                    className="h-9 rounded-lg border-gray-200 bg-white text-gray-700 hover:bg-brand-50 hover:text-brand-900"
                  >
                    {t('inventory.filters.clear')}
                  </Button>
                  <Button
                    type="button"
                    onClick={applyFilters}
                    className="h-9 rounded-lg bg-brand-900 text-white hover:bg-brand-800"
                  >
                    {t('inventory.filters.apply')}
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
                <span>{t('inventory.kpis.inStock', { count: stats.inStock })}</span>
              </div>
              <div className="inline-flex items-center gap-2 whitespace-nowrap">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                <span>{t('inventory.kpis.lowStock', { count: stats.lowStock })}</span>
              </div>
              <div className="inline-flex items-center gap-2 whitespace-nowrap">
                <span className="h-2 w-2 rounded-full bg-rose-500" />
                <span>{t('inventory.kpis.outOfStock', { count: stats.outOfStock })}</span>
              </div>
            </div>
          </div>
        </div>
        <KpiStatCard title={t('inventory.kpis.lowStockItems')} value={String(stats.lowStock)} trendLabel={t('inventory.kpis.needsAttention')} />
        <KpiStatCard title={t('inventory.kpis.outOfStockItems')} value={String(stats.outOfStock)} trendLabel={t('inventory.kpis.needsRestock')} />
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-gray-200 p-4 lg:flex-row lg:items-center lg:justify-between">
          <Tabs value={tab} onValueChange={(v) => setTab(v as InventoryTab)}>
            <TabsList className="h-9 rounded-lg bg-gray-50 p-1">
              <TabsTrigger value="all" className="rounded-md text-sm">
                {t('inventory.tabs.all')}
              </TabsTrigger>
              <TabsTrigger value="inStock" className="rounded-md text-sm">
                {t('inventory.tabs.inStock')}
              </TabsTrigger>
              <TabsTrigger value="lowStock" className="rounded-md text-sm">
                {t('inventory.tabs.lowStock')}
              </TabsTrigger>
              <TabsTrigger value="outOfStock" className="rounded-md text-sm">
                {t('inventory.tabs.outOfStock')}
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-2">
            <div className="relative w-full max-w-[280px]">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('inventory.searchPlaceholder')}
                className="h-9 rounded-lg border-gray-200 bg-gray-50 pr-3 pl-9"
              />
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  aria-label={t('inventory.table.filterAria')}
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 shadow-xs transition-colors',
                    'hover:bg-brand-50 hover:text-brand-900'
                  )}
                >
                  <Filter className="h-4 w-4" />
                </button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-[360px] border-gray-200 bg-white p-4 text-gray-900 shadow-md">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-gray-900">{t('inventory.filters.title')}</div>
                    <div className="mt-0.5 text-xs font-medium text-gray-500">{t('inventory.filters.subtitle')}</div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-4">
                  <div className="grid gap-2">
                    <Label className="text-xs font-semibold text-gray-600">{t('inventory.filters.vendor')}</Label>
                    <Select
                      value={filtersDraft.vendor}
                      onValueChange={(v) => setFiltersDraft((p) => ({ ...p, vendor: v }))}
                    >
                      <SelectTrigger className="h-9 rounded-lg border-gray-200 bg-white text-sm">
                        <SelectValue placeholder={t('inventory.filters.any')} />
                      </SelectTrigger>
                      <SelectContent className="border-gray-200 bg-white text-gray-900">
                        <SelectItem value="any">{t('inventory.filters.any')}</SelectItem>
                        {vendors.map((v) => (
                          <SelectItem key={v} value={v}>
                            {v}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label className="text-xs font-semibold text-gray-600">{t('inventory.filters.category')}</Label>
                    <Select
                      value={filtersDraft.category}
                      onValueChange={(v) => setFiltersDraft((p) => ({ ...p, category: v }))}
                    >
                      <SelectTrigger className="h-9 rounded-lg border-gray-200 bg-white text-sm">
                        <SelectValue placeholder={t('inventory.filters.any')} />
                      </SelectTrigger>
                      <SelectContent className="border-gray-200 bg-white text-gray-900">
                        <SelectItem value="any">{t('inventory.filters.any')}</SelectItem>
                        {categories.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label className="text-xs font-semibold text-gray-600">{t('inventory.filters.status')}</Label>
                    <Select
                      value={filtersDraft.status}
                      onValueChange={(v) => setFiltersDraft((p) => ({ ...p, status: v as StockStatus | 'any' }))}
                    >
                      <SelectTrigger className="h-9 rounded-lg border-gray-200 bg-white text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="border-gray-200 bg-white text-gray-900">
                        <SelectItem value="any">{t('inventory.filters.any')}</SelectItem>
                        <SelectItem value="inStock">{t('inventory.status.inStock')}</SelectItem>
                        <SelectItem value="lowStock">{t('inventory.status.lowStock')}</SelectItem>
                        <SelectItem value="outOfStock">{t('inventory.status.outOfStock')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label className="text-xs font-semibold text-gray-600">{t('inventory.filters.sku')}</Label>
                    <Input
                      value={filtersDraft.sku}
                      onChange={(e) => setFiltersDraft((p) => ({ ...p, sku: e.target.value }))}
                      placeholder={t('inventory.filters.skuPlaceholder')}
                      className="h-9 rounded-lg border-gray-200 bg-white"
                    />
                  </div>

                  <div className="grid gap-2">
                    <div className="flex items-center justify-between gap-3">
                      <Label className="text-xs font-semibold text-gray-600">{t('inventory.filters.stockRange')}</Label>
                      <div className="text-xs font-semibold text-gray-700">
                        {filtersDraft.stockRange[0]} - {filtersDraft.stockRange[1]}
                      </div>
                    </div>
                    <Slider
                      value={filtersDraft.stockRange}
                      onValueChange={(v) => setFiltersDraft((p) => ({ ...p, stockRange: [v[0] ?? 0, v[1] ?? stockMax] }))}
                      min={0}
                      max={stockMax}
                      step={1}
                    />
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={clearFilters}
                    className="h-9 rounded-lg border-gray-200 bg-white text-gray-700 hover:bg-brand-50 hover:text-brand-900"
                  >
                    {t('inventory.filters.clear')}
                  </Button>
                  <Button
                    type="button"
                    onClick={applyFilters}
                    className="h-9 rounded-lg bg-brand-900 text-white hover:bg-brand-800"
                  >
                    {t('inventory.filters.apply')}
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
            defaultPageSize={10}
            emptyState={<span>{t('inventory.empty')}</span>}
            className="rounded-xl"
          />
        </div>
      </div>
    </div>
  )
}
