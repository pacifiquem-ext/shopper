import type { DateRange } from 'react-day-picker'

import { ordersService } from '@/services/orders.service'

export type OrderKpiCounts = {
  total: number
  unpaid: number
  cancelled: number
  fulfilled: number
}

export type OrderKpiSnapshot = OrderKpiCounts & {
  trends: {
    total: string
    unpaid: string
    cancelled: string
    fulfilled: string
  }
}

function startOfDay(date: Date): Date {
  const next = new Date(date)
  next.setHours(0, 0, 0, 0)
  return next
}

function endOfDay(date: Date): Date {
  const next = new Date(date)
  next.setHours(23, 59, 59, 999)
  return next
}

function toDateParam(date: Date): string {
  return date.toISOString().split('T')[0]
}

/** Last 7 calendar days ending today (today + previous 6 days). */
export function getLastSevenDaysRange(reference = new Date()): DateRange {
  const to = endOfDay(reference)
  const from = startOfDay(new Date(reference.getTime() - 6 * 24 * 60 * 60 * 1000))
  return { from, to }
}

export function resolveComparisonPeriods(range?: DateRange) {
  const now = new Date()
  const effectiveRange = range?.from ? range : getLastSevenDaysRange(now)

  const currentFrom = startOfDay(effectiveRange.from!)
  const currentTo = effectiveRange.to ? endOfDay(effectiveRange.to) : endOfDay(now)

  const durationMs = currentTo.getTime() - currentFrom.getTime() + 1
  const previousTo = new Date(currentFrom.getTime() - 1)
  const previousFrom = new Date(previousTo.getTime() - durationMs + 1)

  return {
    currentFrom,
    currentTo,
    previousFrom,
    previousTo,
  }
}

export function formatPercentChange(
  current: number,
  previous: number,
  label: (change: string) => string,
): string {
  if (previous === 0) {
    return label('0')
  }

  const pct = ((current - previous) / previous) * 100
  const signed = pct >= 0 ? `+${pct.toFixed(1)}` : pct.toFixed(1)
  return label(signed)
}

export async function fetchOrderKpiCounts(dateFrom: string, dateTo: string): Promise<OrderKpiCounts> {
  const [total, unpaid, cancelled, fulfilled] = await Promise.all([
    ordersService.getCount({ dateFrom, dateTo }),
    ordersService.getCount({ dateFrom, dateTo, paymentStatus: 'PENDING' }),
    ordersService.getCount({ dateFrom, dateTo, fulfillmentStatus: 'CANCELLED' }),
    ordersService.getCount({ dateFrom, dateTo, fulfillmentStatus: 'FULFILLED' }),
  ])

  return { total, unpaid, cancelled, fulfilled }
}

export async function fetchOrderKpiSnapshot(
  range: DateRange | undefined,
  label: (change: string) => string,
): Promise<OrderKpiSnapshot> {
  const { currentFrom, currentTo, previousFrom, previousTo } = resolveComparisonPeriods(range)

  const currentFromParam = toDateParam(currentFrom)
  const currentToParam = toDateParam(currentTo)
  const previousFromParam = toDateParam(previousFrom)
  const previousToParam = toDateParam(previousTo)

  const [current, previous] = await Promise.all([
    fetchOrderKpiCounts(currentFromParam, currentToParam),
    fetchOrderKpiCounts(previousFromParam, previousToParam),
  ])

  return {
    ...current,
    trends: {
      total: formatPercentChange(current.total, previous.total, label),
      unpaid: formatPercentChange(current.unpaid, previous.unpaid, label),
      cancelled: formatPercentChange(current.cancelled, previous.cancelled, label),
      fulfilled: formatPercentChange(current.fulfilled, previous.fulfilled, label),
    },
  }
}
