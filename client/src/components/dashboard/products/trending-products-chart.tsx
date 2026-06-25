import { ChartLoadingPlaceholder } from '@/components/dashboard/shared/loading-placeholders'
import { Link } from '@/i18n/navigation'
import { Package } from 'lucide-react'
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
  legendLabel: string
  unitsSoldLabel: (count: number) => string
  emptyTitle: string
  emptyDescription: string
  isLoading?: boolean
}

export function TrendingProductsChart({
  products,
  title,
  legendLabel,
  unitsSoldLabel,
  emptyTitle,
  emptyDescription,
  isLoading = false,
}: TrendingProductsChartProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-xs font-medium text-gray-500">{legendLabel}</span>
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {isLoading ? (
          <ChartLoadingPlaceholder minHeightClassName="min-h-[220px]" />
        ) : products.length === 0 ? (
          <div className="flex min-h-[220px] flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50/80 px-6 py-10 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-xs">
              <Package className="h-6 w-6 text-gray-400" aria-hidden />
            </div>
            <p className="mt-4 text-sm font-semibold text-gray-800">{emptyTitle}</p>
            <p className="mt-1.5 max-w-[260px] text-xs leading-relaxed font-medium text-gray-500">
              {emptyDescription}
            </p>
          </div>
        ) : (
          products.map((product, idx) => (
            <Link
              key={product.id}
              href={`/dashboard/products/${product.id}`}
              className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50/50 p-3 transition-colors hover:bg-gray-100/50"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-xs font-semibold text-gray-700 shadow-xs">
                {idx + 1}
              </div>

              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-gray-900">{product.name}</div>
                <div className="mt-0.5 text-xs font-medium text-gray-500">
                  {unitsSoldLabel(product.sales)}
                </div>
              </div>

              {product.sparklinePoints.length > 0 ? (
                <div className="shrink-0">
                  <MiniSparkline points={product.sparklinePoints} />
                </div>
              ) : null}
            </Link>
          ))
        )}
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
