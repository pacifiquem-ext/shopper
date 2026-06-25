'use client'

import { ExportButton } from '@/components/dashboard/shared/export-button'
import { KpiStatCard } from '@/components/dashboard/shared/kpi-stat-card'
import { OrderCommunicationModal } from '@/components/dashboard/orders/order-communication-modal'
import { PaymentVerificationModal } from '@/components/dashboard/orders/payment-verification-modal'
import { OrderViewSheet } from '@/components/dashboard/orders/order-view-sheet'
import { OrderStatusBadge } from '@/components/dashboard/shared/status-badges'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { DataTable, type DataTableColumn } from '@/components/ui/data-table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type {
  OrderRow,
  OrderDetails,
  OrdersTab,
  PaymentStatus,
  FulfillmentStatus,
} from '@/types'
import { cn } from '@/lib/utils'
import {
  ChevronDown,
  Columns3,
  Eye,
  Filter,
  Package,
  Printer,
  MoreHorizontal,
  Plus,
  Search,
  Truck,
  User,
} from 'lucide-react'
import { useTranslations, useFormatter } from 'next-intl'
import { useCallback, useEffect, useMemo, useState } from 'react'
import type { DateRange } from 'react-day-picker'
import { ordersService, type OrderApi, type OrderMessageApi } from '@/services/orders.service'
import { fetchOrderKpiSnapshot, getLastSevenDaysRange, type OrderKpiSnapshot } from '@/lib/order-kpi-stats'
import { useSearchParams } from 'next/navigation'

function mapPaymentStatus(s: string): PaymentStatus {
  return s === 'SUCCESS' ? 'success' : 'pending'
}

function mapFulfillmentStatus(s: string): FulfillmentStatus {
  return s === 'FULFILLED' ? 'fulfilled' : 'unfulfilled'
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function parseAddress(raw: string | undefined): string {
  if (!raw) return '—'
  try {
    const obj = JSON.parse(raw)
    return [obj.province, obj.district, obj.sector, obj.physicalAddress]
      .filter(Boolean)
      .join(', ')
  } catch {
    return raw
  }
}

function apiToOrderRow(o: OrderApi, t: (k: string, p?: any) => string): OrderRow {
  return {
    id: o.orderNumber,
    date: fmtDate(o.placedAt),
    customer: o.customerName,
    payment: mapPaymentStatus(o.payment?.status ?? 'PENDING'),
    total: o.total.toLocaleString(),
    delivery: t('orders.table.na'),
    items: t('orders.table.itemsCount', { count: o.lineItems.length }),
    fulfillment: mapFulfillmentStatus(o.fulfillment?.status ?? 'UNFULFILLED'),
  }
}

function apiToOrderDetails(o: OrderApi, t: (k: string, p?: any) => string): OrderDetails {
  const na = t('orders.table.na')
  return {
    id: o.orderNumber,
    placedAt: fmtDate(o.placedAt),
    customer: {
      name: o.customerName,
      phone: o.customerPhone,
      email: o.customerEmail ?? na,
    },
    payment: {
      status: mapPaymentStatus(o.payment?.status ?? 'PENDING'),
      method: o.payment?.method ?? na,
      reference: o.payment?.reference ?? na,
      paidAt: o.payment?.paidAt ? fmtDate(o.payment.paidAt) : na,
    },
    fulfillment: {
      status: mapFulfillmentStatus(o.fulfillment?.status ?? 'UNFULFILLED'),
      deliveryMethod: o.fulfillment?.deliveryMethod ?? na,
      courierName: o.fulfillment?.courierName ?? na,
      driverName: o.fulfillment?.driverName ?? na,
      assignedAt: o.fulfillment?.assignedAt ? fmtDate(o.fulfillment.assignedAt) : na,
      deliveredAt: o.fulfillment?.deliveredAt ? fmtDate(o.fulfillment.deliveredAt) : na,
      trackingNumber: o.fulfillment?.trackingNumber ?? na,
    },
    addresses: {
      shipping: parseAddress(o.shippingAddress),
      billing: parseAddress(o.billingAddress ?? o.shippingAddress),
    },
    staff: {
      createdBy: 'Store Owner',
      packedBy: o.fulfillment?.packedBy ?? na,
      deliveredBy: o.fulfillment?.deliveredBy ?? na,
      store: '—',
    },
    totals: {
      subtotal: o.subtotal.toLocaleString(),
      deliveryFee: o.deliveryFee.toLocaleString(),
      discount: o.discount.toLocaleString(),
      tax: o.tax.toLocaleString(),
      total: o.total.toLocaleString(),
    },
    items: o.lineItems.map((li) => ({
      id: li.id,
      name: li.productName,
      sku: li.sku,
      quantity: li.quantity,
      unitPrice: li.unitPrice.toLocaleString(),
      total: li.total.toLocaleString(),
    })),
    notes: {
      customerNote: o.customerNote ?? na,
      internalNote: o.internalNote ?? na,
    },
    events: (o.events ?? []).map((e) => ({
      id: e.id,
      type: e.type.toLowerCase() as any,
      at: fmtDate(e.createdAt),
      title: e.title,
      description: e.description,
    })),
  }
}

function apiToMessages(msgs: OrderMessageApi[]): Array<{
  id: string
  sender: 'admin' | 'customer'
  senderName: string
  message: string
  timestamp: string
}> {
  return msgs.map((m) => ({
    id: m.id,
    sender: m.sender.toLowerCase() === 'admin' ? 'admin' : 'customer',
    senderName: m.senderName,
    message: m.message,
    timestamp: new Date(m.createdAt).toLocaleString(),
  }))
}

export default function OrdersPage() {
  const t = useTranslations('dashboard')
  const formatter = useFormatter()
  const searchParams = useSearchParams()

  const [tab, setTab] = useState<OrdersTab>('all')
  const [query, setQuery] = useState('')
  const [viewOpen, setViewOpen] = useState(false)
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [communicationOpen, setCommunicationOpen] = useState(false)
  const [paymentModalOpen, setPaymentModalOpen] = useState(false)
  const [activeModalOrderId, setActiveModalOrderId] = useState<string | null>(null)
  const [range, setRange] = useState<DateRange | undefined>(undefined)
  const [rows, setRows] = useState<OrderRow[]>([])
  const [orderUuidMap, setOrderUuidMap] = useState<Record<string, string>>({})
  const [detailsById, setDetailsById] = useState<Map<string, OrderDetails>>(new Map())
  const [orderMessages, setOrderMessages] = useState<Record<string, Array<{
    id: string
    sender: 'admin' | 'customer'
    senderName: string
    message: string
    timestamp: string
  }>>>({})
  const [kpiStats, setKpiStats] = useState<OrderKpiSnapshot | null>(null)
  const [kpiLoading, setKpiLoading] = useState(true)
  const [rowsLoading, setRowsLoading] = useState(true)
  const [detailLoading, setDetailLoading] = useState(false)
  const [messagesLoading, setMessagesLoading] = useState(false)

  const kpiTrendLabel = useMemo(
    () => (change: string) => t('orders.stats.trendChange', { change }),
    [t],
  )

  const dateFormat = useMemo(
    () => ({ month: 'short' as const, day: 'numeric' as const, year: 'numeric' as const }),
    [],
  )

  const dateRangeLabel = useMemo(() => {
    if (!range?.from) return t('orders.lastSevenDays')

    const fromStr = formatter.dateTime(range.from, dateFormat)
    const toStr = range.to ? formatter.dateTime(range.to, dateFormat) : ''
    return toStr ? `${fromStr} - ${toStr}` : fromStr
  }, [range?.from, range?.to, formatter, dateFormat, t])

  useEffect(() => {
    setRange(getLastSevenDaysRange())
  }, [])

  // rows loaded via useEffect below

  // detailsById loaded lazily in useEffect below

  const selectedOrder = useMemo(() => {
    if (!selectedOrderId) return null
    return detailsById.get(selectedOrderId) ?? null
  }, [detailsById, selectedOrderId])

  // Fetch orders whenever the date range changes
  useEffect(() => {
    if (!range?.from) return

    const filters: Parameters<typeof ordersService.getAll>[0] = { limit: 100 }
    if (range?.from) filters.dateFrom = range.from.toISOString().split('T')[0]
    if (range?.to) filters.dateTo = range.to.toISOString().split('T')[0]

    setRowsLoading(true)
    ordersService.getAll(filters).then((res) => {
      const list: any = res?.data
      const orders: OrderApi[] = list?.data ?? []
      const uuidMap: Record<string, string> = {}
      const mapped = orders.map((o) => {
        uuidMap[o.orderNumber] = o.id
        return apiToOrderRow(o, t)
      })
      setRows(mapped)
      setOrderUuidMap(uuidMap)
    }).finally(() => setRowsLoading(false))
  }, [range, t])

  useEffect(() => {
    if (!range?.from) return

    let cancelled = false
    setKpiLoading(true)

    fetchOrderKpiSnapshot(range, kpiTrendLabel)
      .then((snapshot) => {
        if (!cancelled) setKpiStats(snapshot)
      })
      .catch(() => {
        if (!cancelled) setKpiStats(null)
      })
      .finally(() => {
        if (!cancelled) setKpiLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [range, kpiTrendLabel])

  // Lazy-load order detail when selectedOrderId changes
  useEffect(() => {
    if (!selectedOrderId || detailsById.has(selectedOrderId)) {
      setDetailLoading(false)
      return
    }
    const uuid = orderUuidMap[selectedOrderId]
    if (!uuid) return
    let cancelled = false
    setDetailLoading(true)
    ordersService.getById(uuid).then((res) => {
      const o: OrderApi | null = (res?.data as any)?.data ?? res?.data ?? null
      if (o && !cancelled) setDetailsById((prev) => new Map(prev).set(selectedOrderId, apiToOrderDetails(o, t)))
    }).finally(() => {
      if (!cancelled) setDetailLoading(false)
    })
    return () => {
      cancelled = true
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedOrderId, orderUuidMap])

  const openView = useCallback((id: string) => {
    setSelectedOrderId(id)
    setViewOpen(true)
  }, [])

  // Open an order view when coming from a notification click (?order=#1001).
  useEffect(() => {
    const orderNumber = searchParams.get('order')
    if (!orderNumber) return
    openView(orderNumber)
  }, [openView, searchParams])

  const handleConfirmPayment = useCallback(async (orderId: string) => {
    const uuid = orderUuidMap[orderId]
    if (!uuid) return
    try {
      await ordersService.updatePayment(uuid, { status: 'SUCCESS' })
      setRows((prev) => prev.map((r) => r.id === orderId ? { ...r, payment: 'success' as const } : r))
      const res = await ordersService.getById(uuid)
      const o: OrderApi | null = (res?.data as any)?.data ?? res?.data ?? null
      if (o) setDetailsById((prev) => new Map(prev).set(orderId, apiToOrderDetails(o, t)))
    } catch {}
  }, [orderUuidMap, t])

  const handleRejectPayment = useCallback(async (orderId: string) => {
    const uuid = orderUuidMap[orderId]
    if (!uuid) return
    try {
      await ordersService.updatePayment(uuid, { status: 'FAILED' })
      setRows((prev) => prev.map((r) => r.id === orderId ? { ...r, payment: 'pending' as const } : r))
    } catch {}
  }, [orderUuidMap])

  const handleSendMessage = useCallback(async (orderId: string, message: string) => {
    const uuid = orderUuidMap[orderId]
    if (!uuid) return
    try {
      await ordersService.sendMessage(uuid, { message, senderName: 'Store Admin' })
      const res = await ordersService.getMessages(uuid)
      const msgs: OrderMessageApi[] = (res?.data as any)?.data ?? res?.data ?? []
      setOrderMessages((prev) => ({ ...prev, [orderId]: apiToMessages(msgs) }))
    } catch {}
  }, [orderUuidMap])

  const openCommunication = useCallback(async (orderId: string) => {
    setActiveModalOrderId(orderId)
    setCommunicationOpen(true)
    const uuid = orderUuidMap[orderId]
    if (!uuid) return
    setMessagesLoading(true)
    try {
      const res = await ordersService.getMessages(uuid)
      const msgs: OrderMessageApi[] = (res?.data as any)?.data ?? res?.data ?? []
      setOrderMessages((prev) => ({ ...prev, [orderId]: apiToMessages(msgs) }))
    } catch {} finally {
      setMessagesLoading(false)
    }
  }, [orderUuidMap])

  const openPaymentModal = useCallback((orderId: string) => {
    setActiveModalOrderId(orderId)
    setPaymentModalOpen(true)
  }, [])

  const paymentConfirmed = useMemo<Record<string, boolean>>(() => {
    const result: Record<string, boolean> = {}
    for (const r of rows) result[r.id] = r.payment === 'success'
    return result
  }, [rows])

  const downloadAsPdf = () => {
    if (!selectedOrder) return

    const content = document.querySelector('[data-order-print]')
    if (!(content instanceof HTMLElement)) return

    const win = window.open('', '_blank', 'noopener,noreferrer,width=1100,height=800')
    if (!win) return

    win.document.open()
    win.document.write(`<!doctype html><html><head><meta charset="utf-8" />`)
    win.document.write(`<meta name="viewport" content="width=device-width, initial-scale=1" />`)
    win.document.write(`<title>${selectedOrder.id}</title>`)
    win.document.write(`<style>
      :root { color-scheme: light; }
      body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, "Noto Sans", "Liberation Sans", sans-serif; margin: 24px; color: #111827; }
      h1,h2,h3 { margin: 0; }
      .muted { color: #6b7280; }
      .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
      .card { border: 1px solid #e5e7eb; border-radius: 14px; padding: 14px; }
      table { width: 100%; border-collapse: collapse; }
      th, td { text-align: left; padding: 10px 8px; border-bottom: 1px solid #e5e7eb; font-size: 13px; }
      th { font-size: 12px; text-transform: uppercase; letter-spacing: .06em; color: #6b7280; }
      .totals { width: 320px; margin-left: auto; }
      .row { display:flex; justify-content: space-between; gap: 18px; padding: 6px 0; font-size: 13px; }
      .row strong { font-weight: 600; }
      @media print { body { margin: 0; } }
    </style></head><body>`)
    win.document.write(content.outerHTML)
    win.document.write(`</body></html>`)
    win.document.close()
    win.focus()
    win.print()
  }

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase()

    let data = rows

    if (tab === 'unfulfilled') {
      data = data.filter((r) => r.fulfillment === 'unfulfilled')
    }

    if (tab === 'unpaid') {
      data = data.filter((r) => r.payment === 'pending')
    }

    if (q) {
      data = data.filter(
        (r) =>
          r.id.toLowerCase().includes(q) ||
          r.customer.toLowerCase().includes(q) ||
          r.date.toLowerCase().includes(q)
      )
    }

    return data
  }, [query, rows, tab])

  const columns: DataTableColumn<OrderRow>[] = useMemo(
    () => [
      {
        id: 'order',
        header: t('orders.table.order'),
        cell: (r) => <span className="font-medium">{r.id}</span>,
      },
      { id: 'date', header: t('orders.table.date'), cell: (r) => r.date, className: 'text-gray-600' },
      { id: 'customer', header: t('orders.table.customer'), cell: (r) => r.customer },
      {
        id: 'payment',
        header: t('orders.table.payment'),
        cell: (r) => (
          <OrderStatusBadge
            status={r.payment}
            labels={{
              pending: t('orders.status.pending'),
              success: t('orders.status.success'),
            }}
          />
        ),
      },
      { id: 'total', header: t('orders.table.total'), cell: (r) => r.total, className: 'text-gray-600' },
      {
        id: 'delivery',
        header: t('orders.table.delivery'),
        cell: (r) => r.delivery,
        className: 'text-gray-600',
      },
      { id: 'items', header: t('orders.table.items'), cell: (r) => r.items, className: 'text-gray-600' },
      {
        id: 'fulfillment',
        header: t('orders.table.fulfillment'),
        cell: (r) => (
          <OrderStatusBadge
            status={r.fulfillment}
            labels={{
              fulfilled: t('orders.status.fulfilled'),
              unfulfilled: t('orders.status.unfulfilled'),
            }}
          />
        ),
      },
      {
        id: 'action',
        header: t('orders.table.action'),
        cell: (r) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label={t('orders.table.moreAria')}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 shadow-xs transition-colors hover:bg-brand-50 hover:text-brand-900"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="border-gray-200 bg-white text-gray-900 shadow-md"
            >
              <DropdownMenuItem
                onSelect={() => openView(r.id)}
                className="cursor-pointer rounded-md focus:bg-brand-50 focus:text-brand-900"
              >
                <Eye className="h-4 w-4 text-gray-600" />
                <span>{t('orders.table.view')}</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => openCommunication(r.id)}
                className="cursor-pointer rounded-md focus:bg-brand-50 focus:text-brand-900"
              >
                <User className="h-4 w-4 text-gray-600" />
                <span>Communication</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => openPaymentModal(r.id)}
                className="cursor-pointer rounded-md focus:bg-brand-50 focus:text-brand-900"
              >
                <Package className="h-4 w-4 text-gray-600" />
                <span>Confirm Payment</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
        className: 'text-right',
        headerClassName: 'text-right',
      },
    ],
    [t, openView, openCommunication, openPaymentModal]
  )

  return (
    <div className="flex w-full max-w-6xl flex-col gap-6">
      <h1 className="sr-only">{t('nav.orders')}</h1>

      <OrderViewSheet
        open={viewOpen}
        onOpenChange={setViewOpen}
        order={selectedOrder}
        orderMessages={orderMessages}
        paymentConfirmed={paymentConfirmed}
        onOpenCommunication={openCommunication}
        onOpenPaymentModal={openPaymentModal}
        isLoading={detailLoading && viewOpen && Boolean(selectedOrderId)}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2">
          <div className="text-xl font-semibold leading-9 text-gray-900">{t('nav.orders')}</div>

          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="inline-flex h-9 w-fit items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-brand-50 hover:text-brand-900"
              >
                <span>{dateRangeLabel}</span>
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </button>
            </PopoverTrigger>
            <PopoverContent
              align="start"
              className="w-[360px] border-gray-200 bg-white p-3 text-gray-900 shadow-md"
            >
              <div className="text-xs font-semibold text-gray-600">{t('orders.dateRange')}</div>
              <div className="mt-2">
                <Calendar mode="range" numberOfMonths={1} selected={range} onSelect={setRange} />
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex items-center gap-2 sm:pt-[42px]">
          <ExportButton
            fetchBlob={() => ordersService.exportCsv()}
            filename="orders.csv"
            label={t('orders.export')}
            className="h-9 rounded-lg border-gray-200 bg-white text-gray-700 hover:bg-brand-50 hover:text-brand-900"
          />
          <Button
            type="button"
            variant="outline"
            className="h-9 rounded-lg border-gray-200 bg-white text-gray-700 hover:bg-brand-50 hover:text-brand-900"
          >
            {t('orders.moreActions')}
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiStatCard
          title={t('orders.stats.totalOrders')}
          value={String(kpiStats?.total ?? 0)}
          trendLabel={kpiStats?.trends.total}
          isLoading={kpiLoading}
        />
        <KpiStatCard
          title={t('orders.stats.orderItemsOverTime')}
          value={String(kpiStats?.unpaid ?? 0)}
          trendLabel={kpiStats?.trends.unpaid}
          isLoading={kpiLoading}
        />
        <KpiStatCard
          title={t('orders.stats.returnsOrders')}
          value={String(kpiStats?.cancelled ?? 0)}
          trendLabel={kpiStats?.trends.cancelled}
          isLoading={kpiLoading}
        />
        <KpiStatCard
          title={t('orders.stats.fulfilledOverTime')}
          value={String(kpiStats?.fulfilled ?? 0)}
          trendLabel={kpiStats?.trends.fulfilled}
          isLoading={kpiLoading}
        />
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-gray-200 p-4 lg:flex-row lg:items-center lg:justify-between">
          <Tabs value={tab} onValueChange={(v) => setTab(v as OrdersTab)}>
            <TabsList className="h-9 rounded-lg bg-gray-50 p-1">
              <TabsTrigger value="all" className="rounded-md text-sm">
                {t('orders.tabs.all')}
              </TabsTrigger>
              <TabsTrigger value="unfulfilled" className="rounded-md text-sm">
                {t('orders.tabs.unfulfilled')}
              </TabsTrigger>
              <TabsTrigger value="unpaid" className="rounded-md text-sm">
                {t('orders.tabs.unpaid')}
              </TabsTrigger>
              <TabsTrigger value="open" className="rounded-md text-sm">
                {t('orders.tabs.open')}
              </TabsTrigger>
              <TabsTrigger value="closed" className="rounded-md text-sm">
                {t('orders.tabs.closed')}
              </TabsTrigger>
              <button
                type="button"
                className="ml-1 inline-flex h-7 items-center rounded-md px-2 text-sm font-medium text-gray-600 transition-colors hover:bg-brand-50 hover:text-brand-900"
              >
                + {t('orders.tabs.add')}
              </button>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-2">
            <div className="relative w-full max-w-[240px]">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('orders.searchPlaceholder')}
                className="h-9 rounded-lg border-brand-200 bg-gray-50 pr-3 pl-9"
              />
            </div>
            <button
              type="button"
              aria-label={t('orders.table.filterAria')}
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 shadow-xs transition-colors',
                'hover:bg-brand-50 hover:text-brand-900'
              )}
            >
              <Filter className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label={t('orders.table.columnsAria')}
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 shadow-xs transition-colors',
                'hover:bg-brand-50 hover:text-brand-900'
              )}
            >
              <Columns3 className="h-4 w-4" />
            </button>
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
            isLoading={rowsLoading}
            emptyState={<span>{t('orders.empty')}</span>}
            className="rounded-xl"
          />
        </div>
      </div>

      <OrderCommunicationModal
        open={communicationOpen}
        onOpenChange={setCommunicationOpen}
        orderId={activeModalOrderId || ''}
        customerName={
          activeModalOrderId
            ? detailsById.get(activeModalOrderId)?.customer.name ||
              rows.find((r) => r.id === activeModalOrderId)?.customer ||
              'Customer'
            : 'Customer'
        }
        messages={activeModalOrderId ? orderMessages[activeModalOrderId] || [] : []}
        isLoadingMessages={messagesLoading}
        onSendMessage={(msg) => {
          if (activeModalOrderId) handleSendMessage(activeModalOrderId, msg)
        }}
      />

      <PaymentVerificationModal
        open={paymentModalOpen}
        onOpenChange={setPaymentModalOpen}
        orderId={activeModalOrderId || ''}
        imageUrl={
          activeModalOrderId
            ? (detailsById.get(activeModalOrderId) as any)?.payment?.paymentProofUrl ?? null
            : null
        }
        isConfirmed={activeModalOrderId ? paymentConfirmed[activeModalOrderId] ?? false : false}
        onConfirm={() => {
          if (activeModalOrderId) handleConfirmPayment(activeModalOrderId)
        }}
        onReject={() => {
          if (activeModalOrderId) handleRejectPayment(activeModalOrderId)
        }}
      />
    </div>
  )
}
