import { MARKETPLACE_BRAND } from '@/lib/marketplace-brand-colors'
import { ChartLoadingPlaceholder } from '@/components/dashboard/shared/loading-placeholders'
import { cn } from '@/lib/utils'
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export type SalesSummaryPoint = {
  label: string
  value: number
  change?: number
}

export type SalesChartPoint = {
  label: string
  revenue: number
  units: number
}

type SalesPerformanceChartProps = {
  title: string
  subtitle: string
  summary: SalesSummaryPoint[]
  chartData: SalesChartPoint[]
  isLoading?: boolean
  revenueLabel: string
  unitsLabel: string
  emptyLabel: string
  formatValue?: (value: number) => string
}

export function SalesPerformanceChart({
  title,
  subtitle,
  summary,
  chartData,
  isLoading = false,
  revenueLabel,
  unitsLabel,
  emptyLabel,
  formatValue = (v) => v.toLocaleString(),
}: SalesPerformanceChartProps) {
  const brandPrimary = MARKETPLACE_BRAND.primary
  const brandSecondary = MARKETPLACE_BRAND.secondary

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          <p className="mt-0.5 text-xs font-medium text-gray-500">{subtitle}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: brandPrimary }} />
            <span className="text-xs font-medium text-gray-600">{revenueLabel}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: brandSecondary }} />
            <span className="text-xs font-medium text-gray-600">{unitsLabel}</span>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {summary.map((item) => {
          const hasChange = item.change != null && !Number.isNaN(item.change)
          const isPositive = (item.change ?? 0) >= 0
          return (
            <div key={item.label} className="rounded-xl border border-gray-100 bg-gray-50/50 p-3">
              <div className="text-xs font-medium text-gray-500">{item.label}</div>
              <div className="mt-1.5 flex items-end justify-between gap-2">
                <div className="text-lg font-semibold text-gray-900">
                  {isLoading ? '—' : formatValue(item.value)}
                </div>
                {hasChange && !isLoading ? (
                  <div
                    className={cn(
                      'flex items-center gap-0.5 text-xs font-semibold',
                      isPositive ? 'text-emerald-600' : 'text-gray-500',
                    )}
                  >
                    {isPositive ? (
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    ) : (
                      <ArrowDownRight className="h-3.5 w-3.5" />
                    )}
                    <span>{Math.abs(item.change!).toFixed(1)}%</span>
                  </div>
                ) : null}
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-4">
        {isLoading ? (
          <ChartLoadingPlaceholder />
        ) : chartData.length === 0 ? (
          <div className="flex h-[200px] w-full items-center justify-center rounded-xl bg-gray-50 text-sm text-gray-400">
            {emptyLabel}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="label"
                stroke="#6b7280"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#6b7280"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '8px 12px',
                }}
                labelStyle={{ color: '#111827', fontWeight: 600, marginBottom: '4px' }}
                itemStyle={{ fontSize: '12px' }}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke={brandPrimary}
                strokeWidth={2.5}
                dot={{ fill: brandPrimary, r: 3 }}
                activeDot={{ r: 5 }}
                name={revenueLabel}
              />
              <Line
                type="monotone"
                dataKey="units"
                stroke={brandSecondary}
                strokeWidth={2.5}
                dot={{ fill: brandSecondary, r: 3 }}
                activeDot={{ r: 5 }}
                name={unitsLabel}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
