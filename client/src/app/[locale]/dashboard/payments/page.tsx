'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, CreditCard, CheckCircle2, XCircle, Clock, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { paymentsService, type PaymentApi } from '@/services/payments.service'

const STATUS_CONFIG: Record<string, { label: string; className: string; icon: React.ElementType }> =
  {
    SUCCESS: {
      label: 'Paid',
      className: 'border-emerald-200 bg-emerald-50 text-emerald-700',
      icon: CheckCircle2,
    },
    PENDING: {
      label: 'Pending',
      className: 'border-amber-200 bg-amber-50 text-amber-700',
      icon: Clock,
    },
    FAILED: {
      label: 'Failed',
      className: 'border-red-200 bg-red-50 text-red-700',
      icon: XCircle,
    },
    REFUNDED: {
      label: 'Refunded',
      className: 'border-blue-200 bg-blue-50 text-blue-700',
      icon: RefreshCw,
    },
  }

const METHOD_LABELS: Record<string, string> = {
  CASH_ON_DELIVERY: 'Cash on Delivery',
  MOBILE_MONEY: 'Mobile Money',
  BANK_TRANSFER: 'Bank Transfer',
  CARD: 'Card',
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-RW', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export default function PaymentsPage() {
  const t = useTranslations('dashboard')

  const [payments, setPayments] = useState<PaymentApi[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    async function load() {
      setIsLoading(true)
      try {
        const res = await paymentsService.getAll({ limit: 50, status: statusFilter || undefined })
        const data = (res as any)?.data ?? res
        const items: PaymentApi[] = Array.isArray(data?.data) ? data.data : []
        setPayments(items)
        setTotal(data?.total ?? items.length)
      } catch {
        // interceptor shows toast
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [statusFilter])

  const filtered = search
    ? payments.filter(
        (p) =>
          p.order.customerName.toLowerCase().includes(search.toLowerCase()) ||
          p.order.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
          (p.reference ?? '').toLowerCase().includes(search.toLowerCase()),
      )
    : payments

  const statuses = ['', 'SUCCESS', 'PENDING', 'FAILED', 'REFUNDED']

  return (
    <div className="flex w-full max-w-6xl flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">{t('nav.payments')}</h1>
        <p className="mt-2 text-gray-500">Payment records for all orders.</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {(['SUCCESS', 'PENDING', 'FAILED', 'REFUNDED'] as const).map((s) => {
          const cfg = STATUS_CONFIG[s]
          const count = payments.filter((p) => p.status === s).length
          const Icon = cfg.icon
          return (
            <div
              key={s}
              className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
            >
              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-xl border',
                  cfg.className,
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs text-gray-500">{cfg.label}</div>
                <div className="text-xl font-bold text-gray-900">{isLoading ? '—' : count}</div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order # or customer name..."
            className="h-10 rounded-xl border-gray-200 pl-9"
          />
        </div>
        <div className="flex gap-2">
          {statuses.map((s) => (
            <Button
              key={s}
              type="button"
              size="sm"
              variant={statusFilter === s ? 'default' : 'outline'}
              onClick={() => setStatusFilter(s)}
              className={cn(
                'h-9 rounded-lg text-xs',
                statusFilter === s
                  ? 'bg-brand-900 text-white hover:bg-brand-800'
                  : 'border-gray-200 text-gray-700 hover:bg-gray-50',
              )}
            >
              {s === '' ? 'All' : STATUS_CONFIG[s]?.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {isLoading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-900 border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 text-gray-400">
            <CreditCard className="h-12 w-12 opacity-30" />
            <p className="text-sm font-medium">No payments found</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-left">
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Order
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Customer
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Amount
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Method
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Status
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((p) => {
                const cfg = STATUS_CONFIG[p.status] ?? STATUS_CONFIG.PENDING
                const Icon = cfg.icon
                return (
                  <tr key={p.id} className="transition-colors hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{p.order.orderNumber}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{p.order.customerName}</div>
                      <div className="text-xs text-gray-500">{p.order.customerPhone}</div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      {Number(p.amount).toLocaleString()} RWF
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {METHOD_LABELS[p.method] ?? p.method}
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        className={cn(
                          'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium',
                          cfg.className,
                        )}
                      >
                        <Icon className="h-3 w-3" />
                        {cfg.label}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{fmtDate(p.createdAt)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
        {!isLoading && filtered.length > 0 && (
          <div className="border-t border-gray-100 px-6 py-3 text-xs text-gray-500">
            Showing {filtered.length} of {total} payments
          </div>
        )}
      </div>
    </div>
  )
}
