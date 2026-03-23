import { CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

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
  const brandBlue = '#6083e3'
  const emeraldGreen = '#059669'

  const data = [
    { month: 'Jan', sales: 9300, purchase: 11200 },
    { month: 'Feb', sales: 9800, purchase: 10800 },
    { month: 'Mar', sales: 9600, purchase: 10400 },
    { month: 'Apr', sales: 9200, purchase: 10200 },
    { month: 'May', sales: 10500, purchase: 8800 },
    { month: 'Jun', sales: 9000, purchase: 10600 },
    { month: 'Jul', sales: 10200, purchase: 10000 },
    { month: 'Aug', sales: 9800, purchase: 11400 },
    { month: 'Sep', sales: 9900, purchase: 9200 },
    { month: 'Oct', sales: 9400, purchase: 9600 },
    { month: 'Nov', sales: 9700, purchase: 11000 },
    { month: 'Dec', sales: 9600, purchase: 10400 },
  ]

  return (
    <div className="mt-2 w-full">
      <ResponsiveContainer width="100%" height={260}>
        <LineChart
          data={data}
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
            name="Sales"
          />
          <Line
            type="monotone"
            dataKey="purchase"
            stroke={emeraldGreen}
            strokeWidth={3}
            dot={{ fill: emeraldGreen, r: 4 }}
            activeDot={{ r: 6 }}
            name="Purchase"
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
