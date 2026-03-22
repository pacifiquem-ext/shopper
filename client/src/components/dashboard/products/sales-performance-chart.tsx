import { cn } from '@/lib/utils'
import { pointToXY, pointsToPathWithBounds } from '@/utils/dashboard'
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'

type SalesDataPoint = {
  label: string
  value: number
  change: number
}

type SalesPerformanceChartProps = {
  title: string
  subtitle: string
  data: SalesDataPoint[]
  salesPoints: readonly (readonly [number, number])[]
  revenuePoints: readonly (readonly [number, number])[]
}

export function SalesPerformanceChart({
  title,
  subtitle,
  data,
  salesPoints,
  revenuePoints,
}: SalesPerformanceChartProps) {
  const width = 920
  const height = 200
  const paddingLeft = 44
  const paddingRight = 16
  const paddingTop = 16
  const paddingBottom = 28

  const x0 = paddingLeft
  const x1 = width - paddingRight
  const y0 = paddingTop
  const y1 = height - paddingBottom

  const labels = ['$40k', '$30k', '$20k', '$10k']
  const gridCount = labels.length

  const salesPath = pointsToPathWithBounds(salesPoints, x0, x1, y0, y1)
  const revenuePath = pointsToPathWithBounds(revenuePoints, x0, x1, y0, y1)

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          <p className="mt-0.5 text-xs font-medium text-gray-500">{subtitle}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-blue-500" />
            <span className="text-xs font-medium text-gray-600">Revenue</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-xs font-medium text-gray-600">Units Sold</span>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-4 gap-3">
        {data.map((item) => {
          const isPositive = item.change >= 0
          return (
            <div key={item.label} className="rounded-xl border border-gray-100 bg-gray-50/50 p-3">
              <div className="text-xs font-medium text-gray-500">{item.label}</div>
              <div className="mt-1.5 flex items-end justify-between gap-2">
                <div className="text-lg font-semibold text-gray-900">{item.value}</div>
                <div
                  className={cn(
                    'flex items-center gap-0.5 text-xs font-semibold',
                    isPositive ? 'text-emerald-600' : 'text-rose-600'
                  )}
                >
                  {isPositive ? (
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  ) : (
                    <ArrowDownRight className="h-3.5 w-3.5" />
                  )}
                  <span>{Math.abs(item.change)}%</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-4 overflow-hidden rounded-xl bg-gray-50/50">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-[200px] w-full"
          role="img"
          aria-label="Sales performance chart"
        >
          <title>Sales performance chart</title>
          <defs>
            <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
            </linearGradient>
          </defs>

          {Array.from({ length: gridCount }).map((_, idx) => {
            const y = y0 + (idx / (gridCount - 1)) * (y1 - y0)
            const text = labels[idx] ?? ''
            return (
              <g key={`grid-${idx}`}>
                <line x1={x0} x2={x1} y1={y} y2={y} stroke="#e5e7eb" strokeWidth="1" />
                <text x={12} y={y + 4} fontSize="11" fill="#6b7280" fontWeight="500">
                  {text}
                </text>
              </g>
            )
          })}

          <path d={`${revenuePath} L ${x1} ${y1} L ${x0} ${y1} Z`} fill="url(#revenueFill)" stroke="none" />
          <path d={`${salesPath} L ${x1} ${y1} L ${x0} ${y1} Z`} fill="url(#salesFill)" stroke="none" />

          <path d={revenuePath} fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" />
          <path d={salesPath} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />

          {salesPoints.map((point, idx) => {
            const { x, y } = pointToXY(point, x0, x1, y0, y1)
            if (idx % 2 !== 0) return null
            return <circle key={`s-${idx}`} cx={x} cy={y} r="3" fill="#10b981" />
          })}

          {revenuePoints.map((point, idx) => {
            const { x, y } = pointToXY(point, x0, x1, y0, y1)
            if (idx % 2 !== 0) return null
            return <circle key={`r-${idx}`} cx={x} cy={y} r="3" fill="#3b82f6" />
          })}
        </svg>
      </div>
    </div>
  )
}
