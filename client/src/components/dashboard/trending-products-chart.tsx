import { cn } from '@/lib/utils'
import { pointToXY, pointsToPathWithBounds } from '@/utils/dashboard'
import { TrendingUp, TrendingDown } from 'lucide-react'

type TrendingProduct = {
  id: string
  name: string
  sales: number
  trend: number
  sparklinePoints: readonly (readonly [number, number])[]
}

type TrendingProductsChartProps = {
  products: TrendingProduct[]
  title: string
}

export function TrendingProductsChart({ products, title }: TrendingProductsChartProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-xs font-medium text-gray-500">Sales Trend</span>
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {products.map((product, idx) => {
          const isPositive = product.trend >= 0
          const trendColor = isPositive ? 'text-emerald-600' : 'text-rose-600'
          const bgColor = isPositive ? 'bg-emerald-50' : 'bg-rose-50'

          return (
            <div
              key={product.id}
              className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50/50 p-3 transition-colors hover:bg-gray-100/50"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-xs font-semibold text-gray-700 shadow-xs">
                {idx + 1}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <div className="truncate text-sm font-semibold text-gray-900">{product.name}</div>
                  <div className={cn('flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs font-semibold', bgColor, trendColor)}>
                    {isPositive ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    <span>{Math.abs(product.trend)}%</span>
                  </div>
                </div>
                <div className="mt-0.5 text-xs font-medium text-gray-500">{product.sales} units sold</div>
              </div>

              <div className="shrink-0">
                <MiniSparkline points={product.sparklinePoints} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

type MiniSparklineProps = {
  points: readonly (readonly [number, number])[]
}

function MiniSparkline({ points }: MiniSparklineProps) {
  const width = 80
  const height = 32
  const padding = 2

  const x0 = padding
  const x1 = width - padding
  const y0 = padding
  const y1 = height - padding

  const path = pointsToPathWithBounds(points, x0, x1, y0, y1)

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-8 w-20"
      role="img"
      aria-label="Sales trend"
    >
      <defs>
        <linearGradient id="miniSparklineGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
        </linearGradient>
      </defs>

      <path
        d={`${path} L ${x1} ${y1} L ${x0} ${y1} Z`}
        fill="url(#miniSparklineGradient)"
        stroke="none"
      />

      <path
        d={path}
        fill="none"
        stroke="#10b981"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
