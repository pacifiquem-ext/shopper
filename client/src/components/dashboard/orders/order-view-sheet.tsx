'use client'

import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { OrderStatusBadge } from '@/components/dashboard/shared/status-badges'
import { SheetDetailSkeleton } from '@/components/dashboard/shared/loading-placeholders'
import type { OrderDetails } from '@/types'
import { Download, Package, Printer, Truck, User } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { printContent } from '@/utils/print'

interface OrderViewSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: OrderDetails | null
  orderMessages?: Record<string, Array<{
    id: string
    sender: 'admin' | 'customer'
    senderName: string
    message: string
    timestamp: string
  }>>
  paymentConfirmed?: Record<string, boolean>
  onOpenCommunication?: (orderId: string) => void
  onOpenPaymentModal?: (orderId: string) => void
  isLoading?: boolean
}

export function OrderViewSheet({
  open,
  onOpenChange,
  order,
  orderMessages = {},
  paymentConfirmed = {},
  onOpenCommunication,
  onOpenPaymentModal,
  isLoading = false,
}: OrderViewSheetProps) {
  const t = useTranslations('dashboard')

  const downloadAsPdf = () => {
    if (!order) return
    const el = document.querySelector('[data-order-print]')
    if (!el) return
    printContent(el as HTMLElement)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-hidden p-0 sm:max-w-4xl">
        <SheetHeader className="border-b border-stroke-soft-200 bg-white px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <SheetTitle className="text-lg font-semibold text-text-strong-950">
                {order ? t('orders.viewSheet.titleWithId', { id: order.id }) : t('orders.viewSheet.title')}
              </SheetTitle>
              <div className="mt-1 text-sm text-text-sub-600">
                {order ? `${order.customer.name} • ${order.items.length} ${t('orders.viewSheet.itemsCountLabel')}` : ''}
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => {
                const el = document.querySelector('[data-order-print]')
                if (el) window.print()
              }}
              disabled={!order || isLoading}
              className="h-9 w-9 shrink-0 text-text-sub-600 hover:bg-primary-alpha-10 hover:text-primary-base"
              aria-label="Print order"
            >
              <Printer className="h-4 w-4" />
            </Button>
          </div>

          {order && (
            <div className="mt-3 grid grid-cols-3 gap-2">
              <div className="rounded-xl border border-stroke-soft-200 bg-bg-weak-50 px-3 py-2">
                <div className="text-[11px] font-semibold text-text-soft-400">{t('orders.viewSheet.badges.payment')}</div>
                <div className="mt-1">
                  <OrderStatusBadge
                    status={order.payment.status}
                    labels={{
                      pending: t('orders.status.pending'),
                      success: t('orders.status.success'),
                    }}
                  />
                </div>
              </div>
              <div className="rounded-xl border border-stroke-soft-200 bg-bg-weak-50 px-3 py-2">
                <div className="text-[11px] font-semibold text-text-soft-400">{t('orders.viewSheet.badges.fulfillment')}</div>
                <div className="mt-1">
                  <OrderStatusBadge
                    status={order.fulfillment.status}
                    labels={{
                      fulfilled: t('orders.status.fulfilled'),
                      unfulfilled: t('orders.status.unfulfilled'),
                    }}
                  />
                </div>
              </div>
              <div className="rounded-xl border border-stroke-soft-200 bg-bg-weak-50 px-3 py-2">
                <div className="text-[11px] font-semibold text-text-soft-400">{t('orders.viewSheet.badges.tracking')}</div>
                <div className="mt-1 text-sm font-semibold text-text-strong-950">{order.fulfillment.trackingNumber}</div>
              </div>
            </div>
          )}
        </SheetHeader>

        <ScrollArea className="h-full">
          {isLoading ? (
            <SheetDetailSkeleton />
          ) : (
          <div className="space-y-4 p-5">
            <div data-order-print className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xl font-semibold text-text-strong-950">
                    {order ? t('orders.viewSheet.orderId', { id: order.id }) : t('orders.table.na')}
                  </div>
                  <div className="mt-1 text-sm text-text-sub-600">{order?.placedAt ?? ''}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-semibold text-text-soft-400">{t('orders.viewSheet.total')}</div>
                  <div className="mt-1 text-2xl font-semibold text-text-strong-950">
                    {order?.totals.total ?? t('orders.table.na')}
                  </div>
                </div>
              </div>

              <Separator className="my-4" />

              {order && onOpenCommunication && onOpenPaymentModal && (
                <div className="rounded-2xl border border-stroke-soft-200 bg-white p-4">
                  <div className="text-sm font-semibold text-text-strong-950">Quick Actions</div>
                  <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => onOpenCommunication(order.id)}
                      className="h-auto justify-start rounded-xl border-stroke-soft-200 bg-white p-4 text-left hover:bg-primary-alpha-10 hover:border-primary-base/20"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-semibold text-text-strong-950">Customer Communication</div>
                          <div className="mt-0.5 text-xs text-text-sub-600">
                            {orderMessages[order.id]?.length || 0} messages
                          </div>
                        </div>
                      </div>
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => onOpenPaymentModal(order.id)}
                      className="h-auto justify-start rounded-xl border-stroke-soft-200 bg-white p-4 text-left hover:bg-primary-alpha-10 hover:border-primary-base/20"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50">
                          <Package className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-semibold text-text-strong-950">Payment Verification</div>
                          <div className="mt-0.5 text-xs text-text-sub-600">
                            {paymentConfirmed[order.id] ? 'Verified' : 'Pending review'}
                          </div>
                        </div>
                      </div>
                    </Button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-stroke-soft-200 bg-white p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-text-strong-950">
                    <User className="h-4 w-4 text-text-sub-600" />
                    {t('orders.viewSheet.sections.customer')}
                  </div>
                  <div className="mt-3 space-y-2 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-text-soft-400">{t('orders.viewSheet.fields.name')}</span>
                      <span className="font-medium text-text-strong-950">{order?.customer.name ?? t('orders.table.na')}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-text-soft-400">{t('orders.viewSheet.fields.phone')}</span>
                      <span className="font-medium text-text-strong-950">{order?.customer.phone ?? t('orders.table.na')}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-text-soft-400">{t('orders.viewSheet.fields.email')}</span>
                      <span className="font-medium text-text-strong-950">{order?.customer.email ?? t('orders.table.na')}</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-stroke-soft-200 bg-white p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-text-strong-950">
                    <Package className="h-4 w-4 text-text-sub-600" />
                    {t('orders.viewSheet.sections.orderMeta')}
                  </div>
                  <div className="mt-3 space-y-2 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-text-soft-400">{t('orders.viewSheet.fields.createdBy')}</span>
                      <span className="font-medium text-text-strong-950">{order?.staff.createdBy ?? t('orders.table.na')}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-text-soft-400">{t('orders.viewSheet.fields.store')}</span>
                      <span className="font-medium text-text-strong-950">{order?.staff.store ?? t('orders.table.na')}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-text-soft-400">{t('orders.viewSheet.fields.orderDate')}</span>
                      <span className="font-medium text-text-strong-950">{order?.placedAt ?? t('orders.table.na')}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-stroke-soft-200 bg-white p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-text-strong-950">
                    {t('orders.viewSheet.sections.payment')}
                  </div>
                  <div className="mt-3 space-y-2 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-text-soft-400">{t('orders.viewSheet.fields.status')}</span>
                      <span>
                        {order ? (
                          <OrderStatusBadge
                            status={order.payment.status}
                            labels={{
                              pending: t('orders.status.pending'),
                              success: t('orders.status.success'),
                            }}
                          />
                        ) : null}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-text-soft-400">{t('orders.viewSheet.fields.method')}</span>
                      <span className="font-medium text-text-strong-950">{order?.payment.method ?? t('orders.table.na')}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-text-soft-400">{t('orders.viewSheet.fields.reference')}</span>
                      <span className="font-medium text-text-strong-950">{order?.payment.reference ?? t('orders.table.na')}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-text-soft-400">{t('orders.viewSheet.fields.paidAt')}</span>
                      <span className="font-medium text-text-strong-950">{order?.payment.paidAt ?? t('orders.table.na')}</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-stroke-soft-200 bg-white p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-text-strong-950">
                    <Truck className="h-4 w-4 text-text-sub-600" />
                    {t('orders.viewSheet.sections.fulfillment')}
                  </div>
                  <div className="mt-3 space-y-2 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-text-soft-400">{t('orders.viewSheet.fields.status')}</span>
                      <span>
                        {order ? (
                          <OrderStatusBadge
                            status={order.fulfillment.status}
                            labels={{
                              fulfilled: t('orders.status.fulfilled'),
                              unfulfilled: t('orders.status.unfulfilled'),
                            }}
                          />
                        ) : null}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-text-soft-400">{t('orders.viewSheet.fields.deliveryMethod')}</span>
                      <span className="font-medium text-text-strong-950">{order?.fulfillment.deliveryMethod ?? t('orders.table.na')}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-text-soft-400">{t('orders.viewSheet.fields.courier')}</span>
                      <span className="font-medium text-text-strong-950">{order?.fulfillment.courierName ?? t('orders.table.na')}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-text-soft-400">{t('orders.viewSheet.fields.driver')}</span>
                      <span className="font-medium text-text-strong-950">{order?.fulfillment.driverName ?? t('orders.table.na')}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-text-soft-400">{t('orders.viewSheet.fields.assignedAt')}</span>
                      <span className="font-medium text-text-strong-950">{order?.fulfillment.assignedAt ?? t('orders.table.na')}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-text-soft-400">{t('orders.viewSheet.fields.deliveredAt')}</span>
                      <span className="font-medium text-text-strong-950">{order?.fulfillment.deliveredAt ?? t('orders.table.na')}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-stroke-soft-200 bg-white p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-semibold text-text-strong-950">{t('orders.viewSheet.sections.items')}</div>
                  <div className="text-xs font-semibold text-text-soft-400">{order?.items.length ?? 0} {t('orders.viewSheet.itemsCountLabel')}</div>
                </div>
                <div className="mt-3 overflow-hidden rounded-xl border border-stroke-soft-200">
                  <table className="w-full">
                    <thead className="bg-bg-weak-50">
                      <tr className="text-left text-xs font-semibold text-text-soft-400">
                        <th scope="col" className="px-3 py-2">{t('orders.viewSheet.table.item')}</th>
                        <th scope="col" className="px-3 py-2">{t('orders.viewSheet.table.qty')}</th>
                        <th scope="col" className="px-3 py-2">{t('orders.viewSheet.table.unit')}</th>
                        <th scope="col" className="px-3 py-2 text-right">{t('orders.viewSheet.table.total')}</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm text-gray-800">
                      {(order?.items ?? []).map((it) => (
                        <tr key={it.id} className="border-t border-stroke-soft-200">
                          <td className="px-3 py-3">
                            <div className="font-medium text-text-strong-950">{it.name}</div>
                            <div className="mt-0.5 text-xs font-medium text-text-soft-400">{it.sku}</div>
                          </td>
                          <td className="px-3 py-3 text-text-sub-600">{it.quantity}</td>
                          <td className="px-3 py-3 text-text-sub-600">{it.unitPrice}</td>
                          <td className="px-3 py-3 text-right font-medium text-text-strong-950">{it.total}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-stroke-soft-200 bg-bg-weak-50 p-3">
                    <div className="text-xs font-semibold text-text-soft-400">{t('orders.viewSheet.sections.addressShipping')}</div>
                    <div className="mt-1 text-sm font-medium text-text-strong-950">{order?.addresses.shipping ?? t('orders.table.na')}</div>
                  </div>
                  <div className="rounded-xl border border-stroke-soft-200 bg-bg-weak-50 p-3">
                    <div className="text-xs font-semibold text-text-soft-400">{t('orders.viewSheet.sections.addressBilling')}</div>
                    <div className="mt-1 text-sm font-medium text-text-strong-950">{order?.addresses.billing ?? t('orders.table.na')}</div>
                  </div>
                </div>

                <div className="mt-4 rounded-xl border border-stroke-soft-200 bg-white p-3">
                  <div className="text-sm font-semibold text-text-strong-950">{t('orders.viewSheet.sections.totals')}</div>
                  <div className="mt-2 space-y-2 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-text-soft-400">{t('orders.viewSheet.fields.subtotal')}</span>
                      <span className="font-medium text-text-strong-950">{order?.totals.subtotal ?? t('orders.table.na')}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-text-soft-400">{t('orders.viewSheet.fields.deliveryFee')}</span>
                      <span className="font-medium text-text-strong-950">{order?.totals.deliveryFee ?? t('orders.table.na')}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-text-soft-400">{t('orders.viewSheet.fields.discount')}</span>
                      <span className="font-medium text-text-strong-950">{order?.totals.discount ?? t('orders.table.na')}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-text-soft-400">{t('orders.viewSheet.fields.tax')}</span>
                      <span className="font-medium text-text-strong-950">{order?.totals.tax ?? t('orders.table.na')}</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-text-strong-950">{t('orders.viewSheet.fields.total')}</span>
                      <span className="text-base font-semibold text-text-strong-950">{order?.totals.total ?? t('orders.table.na')}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-stroke-soft-200 bg-white p-4">
                  <div className="text-sm font-semibold text-text-strong-950">{t('orders.viewSheet.sections.staff')}</div>
                  <div className="mt-3 space-y-2 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-text-soft-400">{t('orders.viewSheet.fields.createdBy')}</span>
                      <span className="font-medium text-text-strong-950">{order?.staff.createdBy ?? t('orders.table.na')}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-text-soft-400">{t('orders.viewSheet.fields.packedBy')}</span>
                      <span className="font-medium text-text-strong-950">{order?.staff.packedBy ?? t('orders.table.na')}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-text-soft-400">{t('orders.viewSheet.fields.deliveredBy')}</span>
                      <span className="font-medium text-text-strong-950">{order?.staff.deliveredBy ?? t('orders.table.na')}</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-stroke-soft-200 bg-white p-4">
                  <div className="text-sm font-semibold text-text-strong-950">{t('orders.viewSheet.sections.notes')}</div>
                  <div className="mt-3 space-y-3 text-sm">
                    <div>
                      <div className="text-xs font-semibold text-text-soft-400">{t('orders.viewSheet.fields.customerNote')}</div>
                      <div className="mt-1 rounded-xl border border-stroke-soft-200 bg-bg-weak-50 p-3 text-gray-800">
                        {order?.notes.customerNote ?? t('orders.table.na')}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-text-soft-400">{t('orders.viewSheet.fields.internalNote')}</div>
                      <div className="mt-1 rounded-xl border border-stroke-soft-200 bg-bg-weak-50 p-3 text-gray-800">
                        {order?.notes.internalNote ?? t('orders.table.na')}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-stroke-soft-200 bg-white p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-text-strong-950">
                  <Truck className="h-4 w-4 text-text-sub-600" />
                  {t('orders.viewSheet.sections.timeline')}
                </div>
                <div className="mt-3 space-y-3">
                  {(order?.events ?? []).map((ev) => (
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

            {!order && (
              <div className="rounded-2xl border border-stroke-soft-200 bg-white p-8 text-center text-sm text-text-soft-400">
                {t('orders.viewSheet.empty')}
              </div>
            )}
          </div>
          )}
        </ScrollArea>

        <div className="border-t border-stroke-soft-200 bg-white p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-xs font-medium text-text-soft-400">{t('orders.viewSheet.footerHint')}</div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={downloadAsPdf}
                disabled={!order || isLoading}
                className="h-9 rounded-lg border-stroke-soft-200 bg-white text-text-sub-600 hover:bg-primary-alpha-10 hover:text-primary-base"
              >
                <Download className="h-4 w-4" />
                {t('orders.viewSheet.downloadPdf')}
              </Button>
              <Button
                type="button"
                onClick={() => onOpenChange(false)}
                className="h-9 rounded-lg bg-primary-base text-white hover:bg-primary-darker"
              >
                {t('orders.viewSheet.close')}
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
