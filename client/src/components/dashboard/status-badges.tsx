import { Badge } from '@/components/ui/badge'
import type { StockStatus, PaymentStatus, FulfillmentStatus, ProductStatus } from '@/types/dashboard'

type StockBadgeProps = {
  status: StockStatus
  labels: {
    inStock: string
    lowStock: string
    outOfStock: string
  }
}

export function StockBadge({ status, labels }: StockBadgeProps) {
  if (status === 'inStock') {
    return (
      <Badge className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-50">
        {labels.inStock}
      </Badge>
    )
  }

  if (status === 'lowStock') {
    return (
      <Badge className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700 hover:bg-amber-50">
        {labels.lowStock}
      </Badge>
    )
  }

  return (
    <Badge className="rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-700 hover:bg-rose-50">
      {labels.outOfStock}
    </Badge>
  )
}

type OrderStatusBadgeProps = {
  status: PaymentStatus | FulfillmentStatus
  labels: {
    pending?: string
    success?: string
    fulfilled?: string
    unfulfilled?: string
  }
}

export function OrderStatusBadge({ status, labels }: OrderStatusBadgeProps) {
  if (status === 'pending') {
    return (
      <Badge className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700 hover:bg-amber-50">
        {labels.pending}
      </Badge>
    )
  }

  if (status === 'success') {
    return (
      <Badge className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-50">
        {labels.success}
      </Badge>
    )
  }

  if (status === 'fulfilled') {
    return (
      <Badge className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-50">
        {labels.fulfilled}
      </Badge>
    )
  }

  return (
    <Badge className="rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-700 hover:bg-rose-50">
      {labels.unfulfilled}
    </Badge>
  )
}

type ProductStatusBadgeProps = {
  status: ProductStatus
  label: string
}

export function ProductStatusBadge({ status, label }: ProductStatusBadgeProps) {
  if (status === 'active') {
    return (
      <Badge className="rounded-full border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
        {label}
      </Badge>
    )
  }

  if (status === 'draft') {
    return (
      <Badge className="rounded-full border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-50">
        {label}
      </Badge>
    )
  }

  return (
    <Badge className="rounded-full border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-50">
      {label}
    </Badge>
  )
}
