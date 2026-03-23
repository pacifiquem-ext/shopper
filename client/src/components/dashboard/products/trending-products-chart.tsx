import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { LineChart, Line, ResponsiveContainer } from 'recharts'

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
          const trendColor = isPositive ? 'text-[--color-emerald-600]' : 'text-gray-500'
          const bgColor = isPositive ? 'bg-emerald-50' : 'bg-gray-50'

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
  const emeraldGreen = '#059669'
  
  const data = points.map((point, idx) => ({
    index: idx,
    value: point[1] * 100,
  }))

  return (
    <div className="h-8 w-20">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={emeraldGreen}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
