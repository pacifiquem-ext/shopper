'use client'

import { TurningZeroLoader } from '@/components/ui/turning-zero-loader'
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'

export interface StatsCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  iconBgColor?: string
  iconColor?: string
  trend?: {
    value: number
    label: string
    isPositive?: boolean
  }
  action?: React.ReactNode
  className?: string
  isLoading?: boolean
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  iconBgColor = 'bg-brand-50',
  iconColor = 'text-brand-600',
  trend,
  action,
  className,
  isLoading = false,
}: StatsCardProps) {
  const trendIsPositive = trend?.isPositive ?? (trend ? trend.value >= 0 : undefined)

  return (
    <div className={cn('rounded-2xl border border-gray-200 bg-white p-4 shadow-sm', className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="text-xs font-semibold text-gray-500">{title}</div>
          {isLoading ? (
            <div className="mt-2">
              <TurningZeroLoader size="sm" />
            </div>
          ) : (
            <div className="mt-2 text-2xl font-semibold text-gray-900">{value}</div>
          )}
        </div>
        {action ? (
          action
        ) : (
          <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', iconBgColor, iconColor)}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
      {trend && !isLoading && (
        <div
          className={cn(
            'mt-3 flex items-center gap-1 text-xs font-semibold',
            trendIsPositive ? 'text-emerald-600' : 'text-rose-600'
          )}
        >
          {trendIsPositive ? (
            <ArrowUpRight className="h-3.5 w-3.5" />
          ) : (
            <ArrowDownRight className="h-3.5 w-3.5" />
          )}
          <span>{trend.label}</span>
        </div>
      )}
    </div>
  )
}
