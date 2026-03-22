'use client'

import { KpiStatCard } from '@/components/dashboard/kpi-stat-card'
import { OrderCommunicationModal } from '@/components/dashboard/order-communication-modal'
import { PaymentVerificationModal } from '@/components/dashboard/payment-verification-modal'
import { OrderStatusBadge } from '@/components/dashboard/status-badges'
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
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type {
  OrderRow,
  OrderDetails,
  OrdersTab,
  PaymentStatus,
  FulfillmentStatus,
} from '@/types'
import { cn } from '@/lib/utils'
import { formatDateRange } from '@/utils/dashboard'
import {
  ChevronDown,
  Columns3,
  Download,
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
import { useTranslations } from 'next-intl'
import { useCallback, useMemo, useState } from 'react'
import type { DateRange } from 'react-day-picker'

export default function OrdersPage() {
  const t = useTranslations('dashboard')

  const [tab, setTab] = useState<OrdersTab>('all')
  const [query, setQuery] = useState('')
  const [viewOpen, setViewOpen] = useState(false)
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [communicationOpen, setCommunicationOpen] = useState(false)
  const [paymentModalOpen, setPaymentModalOpen] = useState(false)
  const [activeModalOrderId, setActiveModalOrderId] = useState<string | null>(null)
  const [range, setRange] = useState<DateRange | undefined>({
    from: new Date('2024-01-01'),
    to: new Date('2024-01-30'),
  })
  const [paymentConfirmed, setPaymentConfirmed] = useState<Record<string, boolean>>({
    '#1002': false,
    '#1004': true,
  })
  const [orderMessages, setOrderMessages] = useState<Record<string, Array<{
    id: string
    sender: 'admin' | 'customer'
    senderName: string
    message: string
    timestamp: string
  }>>>({
    '#1002': [
      {
        id: 'm1',
        sender: 'customer',
        senderName: 'Wade Warren',
        message: 'Hi, I just sent the payment proof. Can you confirm it?',
        timestamp: '2 hours ago',
      },
    ],
    '#1004': [
      {
        id: 'm2',
        sender: 'customer',
        senderName: 'Esther Howard',
        message: 'When will my order be delivered?',
        timestamp: '1 day ago',
      },
      {
        id: 'm3',
        sender: 'admin',
        senderName: 'Store Admin',
        message: 'Your order has been shipped and should arrive within 2-3 business days.',
        timestamp: '1 day ago',
      },
    ],
  })

  const dateRangeLabel = useMemo(
    () => formatDateRange(range?.from, range?.to, t('orders.dateRange')),
    [range?.from, range?.to, t]
  )

  const rows: OrderRow[] = useMemo(
    () => [
      {
        id: '#1002',
        date: '11 Feb, 2024',
        customer: 'Wade Warren',
        payment: 'pending',
        total: '$20.00',
        delivery: t('orders.table.na'),
        items: t('orders.table.itemsCount', { count: 2 }),
        fulfillment: 'unfulfilled',
      },
      {
        id: '#1004',
        date: '13 Feb, 2024',
        customer: 'Esther Howard',
        payment: 'success',
        total: '$22.00',
        delivery: t('orders.table.na'),
        items: t('orders.table.itemsCount', { count: 3 }),
        fulfillment: 'fulfilled',
      },
      {
        id: '#1007',
        date: '15 Feb, 2024',
        customer: 'Jenny Wilson',
        payment: 'pending',
        total: '$25.00',
        delivery: t('orders.table.na'),
        items: t('orders.table.itemsCount', { count: 1 }),
        fulfillment: 'unfulfilled',
      },
      {
        id: '#1009',
        date: '17 Feb, 2024',
        customer: 'Guy Hawkins',
        payment: 'success',
        total: '$27.00',
        delivery: t('orders.table.na'),
        items: t('orders.table.itemsCount', { count: 5 }),
        fulfillment: 'fulfilled',
      },
      {
        id: '#1011',
        date: '19 Feb, 2024',
        customer: 'Jacob Jones',
        payment: 'pending',
        total: '$32.00',
        delivery: t('orders.table.na'),
        items: t('orders.table.itemsCount', { count: 4 }),
        fulfillment: 'unfulfilled',
      },
    ],
    [t]
  )

  const detailsById = useMemo(() => {
    const data: OrderDetails[] = [
      {
        id: '#1002',
        placedAt: '11 Feb, 2024 • 10:14',
        customer: { name: 'Wade Warren', phone: '+250 780 000 002', email: 'wade@example.com' },
        payment: {
          status: 'pending',
          method: t('orders.viewSheet.paymentMethod.cashOnDelivery'),
          reference: t('orders.table.na'),
          paidAt: t('orders.table.na'),
        },
        fulfillment: {
          status: 'unfulfilled',
          deliveryMethod: t('orders.viewSheet.deliveryMethod.storeDelivery'),
          courierName: 'OnlineShop Logistics',
          driverName: t('orders.table.na'),
          assignedAt: t('orders.table.na'),
          deliveredAt: t('orders.table.na'),
          trackingNumber: 'OS-TRK-1002',
        },
        addresses: {
          shipping: 'Kigali, Kicukiro, Gatenga',
          billing: 'Kigali, Kicukiro, Gatenga',
        },
        staff: {
          createdBy: 'Store Owner',
          packedBy: t('orders.table.na'),
          deliveredBy: t('orders.table.na'),
          store: 'Kigali Fashion',
        },
        totals: {
          subtotal: '$18.00',
          deliveryFee: '$2.00',
          discount: '$0.00',
          tax: '$0.00',
          total: '$20.00',
        },
        items: [
          {
            id: 'li-1',
            name: 'Cotton T-shirt',
            sku: 'TS-001',
            quantity: 1,
            unitPrice: '$10.00',
            total: '$10.00',
          },
          {
            id: 'li-2',
            name: 'Classic Cap',
            sku: 'CAP-031',
            quantity: 1,
            unitPrice: '$8.00',
            total: '$8.00',
          },
        ],
        notes: {
          customerNote: t('orders.viewSheet.notes.customerNoteSample'),
          internalNote: t('orders.viewSheet.notes.internalNoteSample'),
        },
        events: [
          {
            id: 'ev-1',
            type: 'created',
            at: '11 Feb, 2024 • 10:14',
            title: t('orders.viewSheet.events.created.title'),
            description: t('orders.viewSheet.events.created.description'),
          },
          {
            id: 'ev-2',
            type: 'paid',
            at: '11 Feb, 2024 • 10:15',
            title: t('orders.viewSheet.events.paymentPending.title'),
            description: t('orders.viewSheet.events.paymentPending.description'),
          },
        ],
      },
      {
        id: '#1004',
        placedAt: '13 Feb, 2024 • 15:02',
        customer: { name: 'Esther Howard', phone: '+250 780 000 004', email: 'esther@example.com' },
        payment: {
          status: 'success',
          method: t('orders.viewSheet.paymentMethod.mobileMoney'),
          reference: 'MOMO-829311',
          paidAt: '13 Feb, 2024 • 15:03',
        },
        fulfillment: {
          status: 'fulfilled',
          deliveryMethod: t('orders.viewSheet.deliveryMethod.storeDelivery'),
          courierName: 'OnlineShop Logistics',
          driverName: 'Eric N.',
          assignedAt: '13 Feb, 2024 • 15:20',
          deliveredAt: '13 Feb, 2024 • 16:05',
          trackingNumber: 'OS-TRK-1004',
        },
        addresses: {
          shipping: 'Kigali, Gasabo, Kacyiru',
          billing: 'Kigali, Gasabo, Kacyiru',
        },
        staff: {
          createdBy: 'Store Owner',
          packedBy: 'Aline M.',
          deliveredBy: 'Eric N.',
          store: 'Kigali Fashion',
        },
        totals: {
          subtotal: '$19.00',
          deliveryFee: '$3.00',
          discount: '$0.00',
          tax: '$0.00',
          total: '$22.00',
        },
        items: [
          {
            id: 'li-11',
            name: 'Denim Shorts',
            sku: 'SH-219',
            quantity: 1,
            unitPrice: '$12.00',
            total: '$12.00',
          },
          {
            id: 'li-12',
            name: 'Socks (Pair)',
            sku: 'SOCK-01',
            quantity: 1,
            unitPrice: '$2.00',
            total: '$2.00',
          },
          {
            id: 'li-13',
            name: 'Belt',
            sku: 'BLT-12',
            quantity: 1,
            unitPrice: '$5.00',
            total: '$5.00',
          },
        ],
        notes: {
          customerNote: t('orders.table.na'),
          internalNote: t('orders.table.na'),
        },
        events: [
          {
            id: 'ev-11',
            type: 'created',
            at: '13 Feb, 2024 • 15:02',
            title: t('orders.viewSheet.events.created.title'),
            description: t('orders.viewSheet.events.created.description'),
          },
          {
            id: 'ev-12',
            type: 'paid',
            at: '13 Feb, 2024 • 15:03',
            title: t('orders.viewSheet.events.paid.title'),
            description: t('orders.viewSheet.events.paid.description'),
          },
          {
            id: 'ev-13',
            type: 'packed',
            at: '13 Feb, 2024 • 15:18',
            title: t('orders.viewSheet.events.packed.title'),
            description: t('orders.viewSheet.events.packed.description'),
          },
          {
            id: 'ev-14',
            type: 'delivered',
            at: '13 Feb, 2024 • 16:05',
            title: t('orders.viewSheet.events.delivered.title'),
            description: t('orders.viewSheet.events.delivered.description'),
          },
        ],
      },
    ]

    const map = new Map<string, OrderDetails>()
    for (const item of data) map.set(item.id, item)
    return map
  }, [t])

  const selectedOrder = useMemo(() => {
    if (!selectedOrderId) return null
    return detailsById.get(selectedOrderId) ?? null
  }, [detailsById, selectedOrderId])

  const openView = useCallback((id: string) => {
    setSelectedOrderId(id)
    setViewOpen(true)
  }, [])

  const handleConfirmPayment = useCallback((orderId: string) => {
    setPaymentConfirmed((prev) => ({ ...prev, [orderId]: true }))
  }, [])

  const handleRejectPayment = useCallback((orderId: string) => {
    setPaymentConfirmed((prev) => ({ ...prev, [orderId]: false }))
  }, [])

  const handleSendMessage = useCallback((orderId: string, message: string) => {
    const newMessage = {
      id: `m${Date.now()}`,
      sender: 'admin' as const,
      senderName: 'Store Admin',
      message,
      timestamp: 'Just now',
    }
    setOrderMessages((prev) => ({
      ...prev,
      [orderId]: [...(prev[orderId] || []), newMessage],
    }))
  }, [])

  const openCommunication = useCallback((orderId: string) => {
    setActiveModalOrderId(orderId)
    setCommunicationOpen(true)
  }, [])

  const openPaymentModal = useCallback((orderId: string) => {
    setActiveModalOrderId(orderId)
    setPaymentModalOpen(true)
  }, [])

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

      <Sheet open={viewOpen} onOpenChange={setViewOpen}>
        <SheetContent
          side="right"
          className="flex h-full w-full flex-col gap-0 border-gray-200 bg-white p-0 sm:max-w-[1000px]"
        >
          <SheetHeader className="border-b border-gray-200 p-5 text-left">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <SheetTitle className="truncate text-lg font-semibold text-gray-900">
                  {selectedOrder ? t('orders.viewSheet.titleWithId', { id: selectedOrder.id }) : t('orders.viewSheet.title')}
                </SheetTitle>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-gray-600">
                  <span>{selectedOrder?.placedAt ?? t('orders.table.na')}</span>
                  <span className="text-gray-300">•</span>
                  <span className="inline-flex items-center gap-1">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="truncate">{selectedOrder?.customer.name ?? t('orders.table.na')}</span>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={downloadAsPdf}
                  disabled={!selectedOrder}
                  className="h-9 rounded-lg border-gray-200 bg-white text-gray-700 hover:bg-brand-50 hover:text-brand-900"
                >
                  <Printer className="h-4 w-4" />
                  {t('orders.viewSheet.downloadPdf')}
                </Button>
              </div>
            </div>

            {selectedOrder && (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
                  <div className="text-[11px] font-semibold text-gray-500">{t('orders.viewSheet.badges.payment')}</div>
                  <div className="mt-1">
                    <OrderStatusBadge
                      status={selectedOrder.payment.status}
                      labels={{
                        pending: t('orders.status.pending'),
                        success: t('orders.status.success'),
                      }}
                    />
                  </div>
                </div>
                <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
                  <div className="text-[11px] font-semibold text-gray-500">{t('orders.viewSheet.badges.fulfillment')}</div>
                  <div className="mt-1">
                    <OrderStatusBadge
                      status={selectedOrder.fulfillment.status}
                      labels={{
                        fulfilled: t('orders.status.fulfilled'),
                        unfulfilled: t('orders.status.unfulfilled'),
                      }}
                    />
                  </div>
                </div>
                <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
                  <div className="text-[11px] font-semibold text-gray-500">{t('orders.viewSheet.badges.tracking')}</div>
                  <div className="mt-1 text-sm font-semibold text-gray-900">{selectedOrder.fulfillment.trackingNumber}</div>
                </div>
              </div>
            )}
          </SheetHeader>

          <ScrollArea className="h-full">
            <div className="space-y-4 p-5">
              <div data-order-print className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-xl font-semibold text-gray-900">
                      {selectedOrder ? t('orders.viewSheet.orderId', { id: selectedOrder.id }) : t('orders.table.na')}
                    </div>
                    <div className="mt-1 text-sm text-gray-600">{selectedOrder?.placedAt ?? ''}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-semibold text-gray-500">{t('orders.viewSheet.total')}</div>
                    <div className="mt-1 text-2xl font-semibold text-gray-900">
                      {selectedOrder?.totals.total ?? t('orders.table.na')}
                    </div>
                  </div>
                </div>

                <Separator className="my-4" />

                {selectedOrder && (
                  <div className="rounded-2xl border border-gray-200 bg-white p-4">
                    <div className="text-sm font-semibold text-gray-900">Quick Actions</div>
                    <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          openCommunication(selectedOrder.id)
                        }}
                        className="h-auto justify-start rounded-xl border-gray-200 bg-white p-4 text-left hover:bg-brand-50 hover:border-brand-200"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-semibold text-gray-900">Customer Communication</div>
                            <div className="mt-0.5 text-xs text-gray-600">
                              {orderMessages[selectedOrder.id]?.length || 0} messages
                            </div>
                          </div>
                        </div>
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          openPaymentModal(selectedOrder.id)
                        }}
                        className="h-auto justify-start rounded-xl border-gray-200 bg-white p-4 text-left hover:bg-brand-50 hover:border-brand-200"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50">
                            <Package className="h-5 w-5 text-emerald-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-semibold text-gray-900">Payment Verification</div>
                            <div className="mt-0.5 text-xs text-gray-600">
                              {paymentConfirmed[selectedOrder.id] ? 'Verified' : 'Pending review'}
                            </div>
                          </div>
                        </div>
                      </Button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-gray-200 bg-white p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                      <User className="h-4 w-4 text-gray-600" />
                      {t('orders.viewSheet.sections.customer')}
                    </div>
                    <div className="mt-3 space-y-2 text-sm">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-gray-500">{t('orders.viewSheet.fields.name')}</span>
                        <span className="font-medium text-gray-900">{selectedOrder?.customer.name ?? t('orders.table.na')}</span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-gray-500">{t('orders.viewSheet.fields.phone')}</span>
                        <span className="font-medium text-gray-900">{selectedOrder?.customer.phone ?? t('orders.table.na')}</span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-gray-500">{t('orders.viewSheet.fields.email')}</span>
                        <span className="font-medium text-gray-900">{selectedOrder?.customer.email ?? t('orders.table.na')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-gray-200 bg-white p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                      <Package className="h-4 w-4 text-gray-600" />
                      {t('orders.viewSheet.sections.orderMeta')}
                    </div>
                    <div className="mt-3 space-y-2 text-sm">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-gray-500">{t('orders.viewSheet.fields.createdBy')}</span>
                        <span className="font-medium text-gray-900">{selectedOrder?.staff.createdBy ?? t('orders.table.na')}</span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-gray-500">{t('orders.viewSheet.fields.store')}</span>
                        <span className="font-medium text-gray-900">{selectedOrder?.staff.store ?? t('orders.table.na')}</span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-gray-500">{t('orders.viewSheet.fields.orderDate')}</span>
                        <span className="font-medium text-gray-900">{selectedOrder?.placedAt ?? t('orders.table.na')}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-gray-200 bg-white p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                      {t('orders.viewSheet.sections.payment')}
                    </div>
                    <div className="mt-3 space-y-2 text-sm">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-gray-500">{t('orders.viewSheet.fields.status')}</span>
                        <span>
                          {selectedOrder ? (
                            <OrderStatusBadge
                              status={selectedOrder.payment.status}
                              labels={{
                                pending: t('orders.status.pending'),
                                success: t('orders.status.success'),
                              }}
                            />
                          ) : null}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-gray-500">{t('orders.viewSheet.fields.method')}</span>
                        <span className="font-medium text-gray-900">{selectedOrder?.payment.method ?? t('orders.table.na')}</span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-gray-500">{t('orders.viewSheet.fields.reference')}</span>
                        <span className="font-medium text-gray-900">{selectedOrder?.payment.reference ?? t('orders.table.na')}</span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-gray-500">{t('orders.viewSheet.fields.paidAt')}</span>
                        <span className="font-medium text-gray-900">{selectedOrder?.payment.paidAt ?? t('orders.table.na')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-gray-200 bg-white p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                      <Truck className="h-4 w-4 text-gray-600" />
                      {t('orders.viewSheet.sections.fulfillment')}
                    </div>
                    <div className="mt-3 space-y-2 text-sm">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-gray-500">{t('orders.viewSheet.fields.status')}</span>
                        <span>
                          {selectedOrder ? (
                            <OrderStatusBadge
                              status={selectedOrder.fulfillment.status}
                              labels={{
                                fulfilled: t('orders.status.fulfilled'),
                                unfulfilled: t('orders.status.unfulfilled'),
                              }}
                            />
                          ) : null}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-gray-500">{t('orders.viewSheet.fields.deliveryMethod')}</span>
                        <span className="font-medium text-gray-900">{selectedOrder?.fulfillment.deliveryMethod ?? t('orders.table.na')}</span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-gray-500">{t('orders.viewSheet.fields.courier')}</span>
                        <span className="font-medium text-gray-900">{selectedOrder?.fulfillment.courierName ?? t('orders.table.na')}</span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-gray-500">{t('orders.viewSheet.fields.driver')}</span>
                        <span className="font-medium text-gray-900">{selectedOrder?.fulfillment.driverName ?? t('orders.table.na')}</span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-gray-500">{t('orders.viewSheet.fields.assignedAt')}</span>
                        <span className="font-medium text-gray-900">{selectedOrder?.fulfillment.assignedAt ?? t('orders.table.na')}</span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-gray-500">{t('orders.viewSheet.fields.deliveredAt')}</span>
                        <span className="font-medium text-gray-900">{selectedOrder?.fulfillment.deliveredAt ?? t('orders.table.na')}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-semibold text-gray-900">{t('orders.viewSheet.sections.items')}</div>
                    <div className="text-xs font-semibold text-gray-500">{selectedOrder?.items.length ?? 0} {t('orders.viewSheet.itemsCountLabel')}</div>
                  </div>
                  <div className="mt-3 overflow-hidden rounded-xl border border-gray-200">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr className="text-left text-xs font-semibold text-gray-500">
                          <th scope="col" className="px-3 py-2">{t('orders.viewSheet.table.item')}</th>
                          <th scope="col" className="px-3 py-2">{t('orders.viewSheet.table.qty')}</th>
                          <th scope="col" className="px-3 py-2">{t('orders.viewSheet.table.unit')}</th>
                          <th scope="col" className="px-3 py-2 text-right">{t('orders.viewSheet.table.total')}</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm text-gray-800">
                        {(selectedOrder?.items ?? []).map((it) => (
                          <tr key={it.id} className="border-t border-gray-100">
                            <td className="px-3 py-3">
                              <div className="font-medium text-gray-900">{it.name}</div>
                              <div className="mt-0.5 text-xs font-medium text-gray-500">{it.sku}</div>
                            </td>
                            <td className="px-3 py-3 text-gray-700">{it.quantity}</td>
                            <td className="px-3 py-3 text-gray-700">{it.unitPrice}</td>
                            <td className="px-3 py-3 text-right font-medium text-gray-900">{it.total}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                      <div className="text-xs font-semibold text-gray-500">{t('orders.viewSheet.sections.addressShipping')}</div>
                      <div className="mt-1 text-sm font-medium text-gray-900">{selectedOrder?.addresses.shipping ?? t('orders.table.na')}</div>
                    </div>
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                      <div className="text-xs font-semibold text-gray-500">{t('orders.viewSheet.sections.addressBilling')}</div>
                      <div className="mt-1 text-sm font-medium text-gray-900">{selectedOrder?.addresses.billing ?? t('orders.table.na')}</div>
                    </div>
                  </div>

                  <div className="mt-4 rounded-xl border border-gray-200 bg-white p-3">
                    <div className="text-sm font-semibold text-gray-900">{t('orders.viewSheet.sections.totals')}</div>
                    <div className="mt-2 space-y-2 text-sm">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-gray-500">{t('orders.viewSheet.fields.subtotal')}</span>
                        <span className="font-medium text-gray-900">{selectedOrder?.totals.subtotal ?? t('orders.table.na')}</span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-gray-500">{t('orders.viewSheet.fields.deliveryFee')}</span>
                        <span className="font-medium text-gray-900">{selectedOrder?.totals.deliveryFee ?? t('orders.table.na')}</span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-gray-500">{t('orders.viewSheet.fields.discount')}</span>
                        <span className="font-medium text-gray-900">{selectedOrder?.totals.discount ?? t('orders.table.na')}</span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-gray-500">{t('orders.viewSheet.fields.tax')}</span>
                        <span className="font-medium text-gray-900">{selectedOrder?.totals.tax ?? t('orders.table.na')}</span>
                      </div>
                      <Separator className="my-2" />
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-gray-900">{t('orders.viewSheet.fields.total')}</span>
                        <span className="text-base font-semibold text-gray-900">{selectedOrder?.totals.total ?? t('orders.table.na')}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-gray-200 bg-white p-4">
                    <div className="text-sm font-semibold text-gray-900">{t('orders.viewSheet.sections.staff')}</div>
                    <div className="mt-3 space-y-2 text-sm">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-gray-500">{t('orders.viewSheet.fields.createdBy')}</span>
                        <span className="font-medium text-gray-900">{selectedOrder?.staff.createdBy ?? t('orders.table.na')}</span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-gray-500">{t('orders.viewSheet.fields.packedBy')}</span>
                        <span className="font-medium text-gray-900">{selectedOrder?.staff.packedBy ?? t('orders.table.na')}</span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-gray-500">{t('orders.viewSheet.fields.deliveredBy')}</span>
                        <span className="font-medium text-gray-900">{selectedOrder?.staff.deliveredBy ?? t('orders.table.na')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-gray-200 bg-white p-4">
                    <div className="text-sm font-semibold text-gray-900">{t('orders.viewSheet.sections.notes')}</div>
                    <div className="mt-3 space-y-3 text-sm">
                      <div>
                        <div className="text-xs font-semibold text-gray-500">{t('orders.viewSheet.fields.customerNote')}</div>
                        <div className="mt-1 rounded-xl border border-gray-200 bg-gray-50 p-3 text-gray-800">
                          {selectedOrder?.notes.customerNote ?? t('orders.table.na')}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-gray-500">{t('orders.viewSheet.fields.internalNote')}</div>
                        <div className="mt-1 rounded-xl border border-gray-200 bg-gray-50 p-3 text-gray-800">
                          {selectedOrder?.notes.internalNote ?? t('orders.table.na')}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                    <Truck className="h-4 w-4 text-gray-600" />
                    {t('orders.viewSheet.sections.timeline')}
                  </div>
                  <div className="mt-3 space-y-3">
                    {(selectedOrder?.events ?? []).map((ev) => (
                      <div key={ev.id} className="flex gap-3">
                        <div className="mt-1 flex flex-col items-center">
                          <div className="h-2.5 w-2.5 rounded-full bg-brand-900" />
                          <div className="mt-1 h-full w-px bg-gray-200" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div className="text-sm font-semibold text-gray-900">{ev.title}</div>
                            <div className="shrink-0 text-xs font-medium text-gray-500">{ev.at}</div>
                          </div>
                          {ev.description && <div className="mt-1 text-sm text-gray-600">{ev.description}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {!selectedOrder && (
                <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
                  {t('orders.viewSheet.empty')}
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="border-t border-gray-200 bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-xs font-medium text-gray-500">{t('orders.viewSheet.footerHint')}</div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={downloadAsPdf}
                  disabled={!selectedOrder}
                  className="h-9 rounded-lg border-gray-200 bg-white text-gray-700 hover:bg-brand-50 hover:text-brand-900"
                >
                  <Download className="h-4 w-4" />
                  {t('orders.viewSheet.downloadPdf')}
                </Button>
                <Button
                  type="button"
                  onClick={() => setViewOpen(false)}
                  className="h-9 rounded-lg bg-brand-900 text-white hover:bg-brand-800"
                >
                  {t('orders.viewSheet.close')}
                </Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

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
          <Button
            type="button"
            variant="outline"
            className="h-9 rounded-lg border-gray-200 bg-white text-gray-700 hover:bg-brand-50 hover:text-brand-900"
          >
            <Download className="h-4 w-4" />
            {t('orders.export')}
          </Button>
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
          value="21"
          trendLabel={t('orders.stats.lastWeek')}
        />
        <KpiStatCard
          title={t('orders.stats.orderItemsOverTime')}
          value="15"
          trendLabel={t('orders.stats.lastWeek')}
        />
        <KpiStatCard
          title={t('orders.stats.returnsOrders')}
          value="0"
          trendLabel={t('orders.stats.lastWeek')}
        />
        <KpiStatCard
          title={t('orders.stats.fulfilledOverTime')}
          value="12"
          trendLabel={t('orders.stats.lastWeek')}
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
                className="h-9 rounded-lg border-gray-200 bg-gray-50 pr-3 pl-9"
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
            paginationLabels={{
              previous: t('orders.pagination.previous'),
              next: t('orders.pagination.next'),
              rowsPerPage: t('orders.pagination.rowsPerPage'),
              showing: (from, to, total) => t('orders.pagination.showing', { from, to, total }),
            }}
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
            ? detailsById.get(activeModalOrderId)?.customer.name || 'Customer'
            : 'Customer'
        }
        messages={activeModalOrderId ? orderMessages[activeModalOrderId] || [] : []}
        onSendMessage={(msg) => {
          if (activeModalOrderId) {
            handleSendMessage(activeModalOrderId, msg)
          }
        }}
      />

      <PaymentVerificationModal
        open={paymentModalOpen}
        onOpenChange={setPaymentModalOpen}
        orderId={activeModalOrderId || ''}
        imageUrl={
          activeModalOrderId === '#1002'
            ? 'https://images.unsplash.com/photo-1554224311-beee460ae6ba?auto=format&fit=crop&w=800&q=80'
            : activeModalOrderId === '#1004'
              ? 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=800&q=80'
              : null
        }
        isConfirmed={activeModalOrderId ? paymentConfirmed[activeModalOrderId] ?? false : false}
        onConfirm={() => {
          if (activeModalOrderId) {
            handleConfirmPayment(activeModalOrderId)
          }
        }}
        onReject={() => {
          if (activeModalOrderId) {
            handleRejectPayment(activeModalOrderId)
          }
        }}
      />
    </div>
  )
}
