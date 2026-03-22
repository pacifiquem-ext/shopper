import { CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { pointToXY, pointsToPathWithBounds } from '@/utils/dashboard'
import type React from 'react'

type MetricTileProps = {
  icon: React.ReactNode
  iconClassName: string
  label: string
  value: string
}

export function MetricTile({ icon, iconClassName, label, value }: MetricTileProps) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-gray-50 px-4 py-3">
      <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', iconClassName)}>
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-xs font-medium text-gray-500">{label}</div>
        <div className="text-lg font-semibold text-gray-900">{value}</div>
      </div>
    </div>
  )
}

type MetricCellProps = {
  icon: React.ReactNode
  iconClassName: string
  label: string
  value: string
  className?: string
}

export function MetricCell({ icon, iconClassName, label, value, className }: MetricCellProps) {
  return (
    <div className={cn('flex items-start gap-3 px-4', className)}>
      <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', iconClassName)}>
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-xs font-medium text-gray-500">{label}</div>
        <div className="mt-1 text-xl font-semibold text-gray-900">{value}</div>
      </div>
    </div>
  )
}

type KeyValueRowProps = {
  label: string
  value: string
}

export function KeyValueRow({ label, value }: KeyValueRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <div className="text-gray-500">{label}</div>
      <div className="font-semibold text-gray-900">{value}</div>
    </div>
  )
}

export function SalesPurchaseChart() {
  const width = 920
  const height = 230
  const paddingLeft = 44
  const paddingRight = 16
  const paddingTop = 16
  const paddingBottom = 28

  const x0 = paddingLeft
  const x1 = width - paddingRight
  const y0 = paddingTop
  const y1 = height - paddingBottom

  const labels = ['15k', '12k', '9k', '6k']
  const gridCount = labels.length

  const salesPoints = [
    [0, 0.62],
    [0.08, 0.55],
    [0.18, 0.58],
    [0.28, 0.52],
    [0.38, 0.64],
    [0.5, 0.48],
    [0.62, 0.6],
    [0.72, 0.56],
    [0.82, 0.58],
    [0.92, 0.54],
    [1, 0.57],
  ] as const

  const purchasePoints = [
    [0, 0.44],
    [0.1, 0.54],
    [0.2, 0.5],
    [0.32, 0.5],
    [0.44, 0.72],
    [0.56, 0.56],
    [0.66, 0.52],
    [0.76, 0.74],
    [0.86, 0.48],
    [0.94, 0.42],
    [1, 0.5],
  ] as const

  const salesPath = pointsToPathWithBounds(salesPoints, x0, x1, y0, y1)
  const purchasePath = pointsToPathWithBounds(purchasePoints, x0, x1, y0, y1)

  return (
    <div className="mt-2 w-full overflow-hidden rounded-2xl bg-white">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-[260px] w-full"
        role="img"
        aria-label="Sales and purchase chart"
      >
        <title>Sales and purchase chart</title>
        <defs>
          <linearGradient id="purchaseFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fb923c" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#fb923c" stopOpacity="0" />
          </linearGradient>
        </defs>

        {Array.from({ length: gridCount }).map((_, idx) => {
          const y = y0 + (idx / (gridCount - 1)) * (y1 - y0)
          const text = labels[idx] ?? ''
          return (
            <g key={`grid-${idx}`}>
              <line x1={x0} x2={x1} y1={y} y2={y} stroke="#e5e7eb" strokeWidth="1" />
              <text x={12} y={y + 4} fontSize="12" fill="#6b7280">
                {text}
              </text>
            </g>
          )
        })}

        <path d={`${purchasePath} L ${x1} ${y1} L ${x0} ${y1} Z`} fill="url(#purchaseFill)" stroke="none" />

        <path d={purchasePath} fill="none" stroke="#fb923c" strokeWidth="3" strokeLinecap="round" />
        <path d={salesPath} fill="none" stroke="#0ea5e9" strokeWidth="3" strokeLinecap="round" />

        {salesPoints.map((point, idx) => {
          const { x, y } = pointToXY(point, x0, x1, y0, y1)
          if (idx % 2 !== 0) {
            return null
          }
          return <circle key={`s-${idx}`} cx={x} cy={y} r="3.2" fill="#0ea5e9" />
        })}

        {purchasePoints.map((point, idx) => {
          const { x, y } = pointToXY(point, x0, x1, y0, y1)
          if (idx % 2 !== 0) {
            return null
          }
          return <circle key={`p-${idx}`} cx={x} cy={y} r="3.2" fill="#fb923c" />
        })}
      </svg>
    </div>
  )
}

export function SalesPurchaseChartCardContent() {
  return (
    <CardContent className="pt-4">
      <SalesPurchaseChart />
    </CardContent>
  )
}
