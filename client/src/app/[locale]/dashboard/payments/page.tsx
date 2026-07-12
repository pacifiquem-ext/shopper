'use client'

import { useState, useEffect, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, CreditCard, CheckCircle2, XCircle, Clock, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TurningZeroLoader } from '@/components/ui/turning-zero-loader'
import { paymentsService, type PaymentApi } from '@/services/payments.service'

const STATUS_STYLES: Record<string, { className: string; icon: React.ElementType }> = {
  SUCCESS: {
    className: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    icon: CheckCircle2,
  },
  PENDING: {
    className: 'border-amber-200 bg-amber-50 text-amber-700',
    icon: Clock,
  },
  FAILED: {
    className: 'border-red-200 bg-red-50 text-red-700',
    icon: XCircle,
  },
  REFUNDED: {
    className: 'border-blue-200 bg-blue-50 text-blue-700',
    icon: RefreshCw,
  },
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
  const tp = useTranslations('dashboard.paymentsPage')

  const statusLabel = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return tp('status.paid')
      case 'PENDING':
        return tp('status.pending')
      case 'FAILED':
        return tp('status.failed')
      case 'REFUNDED':
        return tp('status.refunded')
      default:
        return status
    }
  }

  const methodLabel = (method: string) => {
    switch (method) {
      case 'CASH_ON_DELIVERY':
        return tp('methods.cashOnDelivery')
      case 'MOBILE_MONEY':
        return tp('methods.mobileMoney')
      case 'BANK_TRANSFER':
        return tp('methods.bankTransfer')
      case 'CARD':
        return tp('methods.card')
      default:
        return method
    }
  }

  const [payments, setPayments] = useState<PaymentApi[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    async function load() {
      setIsLoading(true)
      setLoadError(false)
      try {
        const res = await paymentsService.getAll({ limit: 50, status: statusFilter || undefined })
        const data = (res as any)?.data ?? res
        const items: PaymentApi[] = Array.isArray(data?.data) ? data.data : []
        setPayments(items)
        setTotal(data?.total ?? items.length)
      } catch {
        setPayments([])
        setTotal(0)
        setLoadError(true)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [statusFilter, reloadKey])

  const filtered = search
    ? payments.filter(
        (p) =>
          p.order.customerName.toLowerCase().includes(search.toLowerCase()) ||
          p.order.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
          (p.reference ?? '').toLowerCase().includes(search.toLowerCase()),
      )
    : payments

  const statuses = useMemo(() => ['', 'SUCCESS', 'PENDING', 'FAILED', 'REFUNDED'] as const, [])

  return (
    <div className="flex w-full max-w-6xl flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-text-strong-950">{t('nav.payments')}</h1>
        <p className="mt-2 text-text-soft-400">{tp('subtitle')}</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {(['SUCCESS', 'PENDING', 'FAILED', 'REFUNDED'] as const).map((s) => {
          const cfg = STATUS_STYLES[s]
          const count = payments.filter((p) => p.status === s).length
          const Icon = cfg.icon
          return (
            <div
              key={s}
              className="flex items-center gap-3 rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-4 shadow-regular-xs"
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
                <div className="text-xs text-text-soft-400">{statusLabel(s)}</div>
                <div className="text-xl font-bold text-text-strong-950">{isLoading ? '—' : count}</div>
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
            placeholder={tp('searchPlaceholder')}
            className="h-10 rounded-xl border-stroke-soft-200 pl-9"
          />
        </div>
        <div className="flex gap-2">
          {statuses.map((s) => (
            <Button
              key={s || 'all'}
              type="button"
              size="sm"
              variant={statusFilter === s ? 'default' : 'outline'}
              onClick={() => setStatusFilter(s)}
              className={cn(
                'h-9 rounded-lg text-xs',
                statusFilter === s
                  ? 'bg-primary-base text-white hover:bg-primary-darker'
                  : 'border-stroke-soft-200 text-text-sub-600 hover:bg-bg-weak-50',
              )}
            >
              {s === '' ? tp('status.all') : statusLabel(s)}
            </Button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-stroke-soft-200 bg-bg-white-0 shadow-regular-xs">
        {isLoading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <TurningZeroLoader size="md" />
          </div>
        ) : loadError ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 px-4 text-center">
            <p className="text-sm font-medium text-text-sub-600">{t('errors.loadFailed')}</p>
            <Button
              type="button"
              variant="outline"
              onClick={() => setReloadKey((k) => k + 1)}
              className="h-9 rounded-lg border-stroke-soft-200 bg-white text-text-sub-600 hover:bg-primary-alpha-10 hover:text-primary-base"
            >
              {t('errors.retry')}
            </Button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 text-gray-400">
            <CreditCard className="h-12 w-12 opacity-30" />
            <p className="text-sm font-medium">{tp('empty')}</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stroke-soft-200 bg-bg-weak-50 text-left">
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-text-soft-400">
                  {tp('columns.order')}
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-text-soft-400">
                  {tp('columns.customer')}
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-text-soft-400">
                  {tp('columns.amount')}
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-text-soft-400">
                  {tp('columns.method')}
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-text-soft-400">
                  {tp('columns.status')}
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-text-soft-400">
                  {tp('columns.date')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((p) => {
                const cfg = STATUS_STYLES[p.status] ?? STATUS_STYLES.PENDING
                const Icon = cfg.icon
                return (
                  <tr key={p.id} className="transition-colors hover:bg-bg-weak-50">
                    <td className="px-6 py-4 font-medium text-text-strong-950">{p.order.orderNumber}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-text-strong-950">{p.order.customerName}</div>
                      <div className="text-xs text-text-soft-400">{p.order.customerPhone}</div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-text-strong-950">
                      {Number(p.amount).toLocaleString()} RWF
                    </td>
                    <td className="px-6 py-4 text-text-sub-600">
                      {methodLabel(p.method)}
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        className={cn(
                          'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium',
                          cfg.className,
                        )}
                      >
                        <Icon className="h-3 w-3" />
                        {statusLabel(p.status)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-text-soft-400">{fmtDate(p.createdAt)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
        {!isLoading && filtered.length > 0 && (
          <div className="border-t border-stroke-soft-200 px-6 py-3 text-xs text-text-soft-400">
            {tp('showing', { shown: filtered.length, total })}
          </div>
        )}
      </div>
    </div>
  )
}
