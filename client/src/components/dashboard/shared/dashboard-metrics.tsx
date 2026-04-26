import { CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import type { SalesTrendPoint } from '@/services/analytics.service'

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

type SalesPurchaseChartProps = {
  data?: SalesTrendPoint[]
  isLoading?: boolean
}

function formatMonth(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleString('default', { month: 'short' })
}

export function SalesPurchaseChart({ data = [], isLoading = false }: SalesPurchaseChartProps) {
  const brandBlue = '#6083e3'
  const emeraldGreen = '#059669'

  if (isLoading) {
    return (
      <div className="mt-2 h-[260px] w-full animate-pulse rounded-xl bg-gray-100" />
    )
  }

  if (data.length === 0) {
    return (
      <div className="mt-2 flex h-[260px] w-full items-center justify-center rounded-xl bg-gray-50 text-sm text-gray-400">
        No sales trend data available yet.
      </div>
    )
  }

  const chartData = data.map((point) => ({
    month: formatMonth(String(point.date)),
    sales: point.revenue,
    purchase: point.cost,
  }))

  return (
    <div className="mt-2 w-full">
      <ResponsiveContainer width="100%" height={260}>
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="month"
            stroke="#6b7280"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#6b7280"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
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
            dataKey="sales"
            stroke={brandBlue}
            strokeWidth={3}
            dot={{ fill: brandBlue, r: 4 }}
            activeDot={{ r: 6 }}
            name="Revenue"
          />
          <Line
            type="monotone"
            dataKey="purchase"
            stroke={emeraldGreen}
            strokeWidth={3}
            dot={{ fill: emeraldGreen, r: 4 }}
            activeDot={{ r: 6 }}
            name="Cost"
          />
        </LineChart>
      </ResponsiveContainer>
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
