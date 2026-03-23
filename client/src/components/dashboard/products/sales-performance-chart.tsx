import { cn } from '@/lib/utils'
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

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
}: SalesPerformanceChartProps) {
  const brandBlue = '#6083e3'
  const emeraldGreen = '#059669'

  const chartData = [
    { month: 'Week 1', revenue: 8500, units: 145 },
    { month: 'Week 2', revenue: 12300, units: 198 },
    { month: 'Week 3', revenue: 9800, units: 167 },
    { month: 'Week 4', revenue: 15200, units: 234 },
    { month: 'Week 5', revenue: 18900, units: 287 },
    { month: 'Week 6', revenue: 22400, units: 342 },
    { month: 'Week 7', revenue: 26700, units: 398 },
    { month: 'Week 8', revenue: 31200, units: 456 },
  ]

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          <p className="mt-0.5 text-xs font-medium text-gray-500">{subtitle}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: brandBlue }} />
            <span className="text-xs font-medium text-gray-600">Revenue</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: emeraldGreen }} />
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
                    isPositive ? 'text-[--color-emerald-600]' : 'text-gray-500'
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

      <div className="mt-4">
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="month"
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
              stroke={brandBlue}
              strokeWidth={2.5}
              dot={{ fill: brandBlue, r: 3 }}
              activeDot={{ r: 5 }}
              name="Revenue"
            />
            <Line
              type="monotone"
              dataKey="units"
              stroke={emeraldGreen}
              strokeWidth={2.5}
              dot={{ fill: emeraldGreen, r: 3 }}
              activeDot={{ r: 5 }}
              name="Units"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
