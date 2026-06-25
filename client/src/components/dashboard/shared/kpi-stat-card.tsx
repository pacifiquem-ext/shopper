import { Sparkline } from '@/components/dashboard/shared/sparkline'
import { TurningZeroLoader } from '@/components/ui/turning-zero-loader'
import { cn } from '@/lib/utils'

type KpiStatCardProps = {
  title: string
  value: string
  trendLabel?: string
  sparklineTitle?: string
  sparklinePoints?: readonly (readonly [number, number])[]
  className?: string
  isLoading?: boolean
}

export function KpiStatCard({
  title,
  value,
  trendLabel,
  sparklineTitle,
  sparklinePoints,
  className,
  isLoading = false,
}: KpiStatCardProps) {
  const showSparkline = Boolean(sparklineTitle && sparklinePoints && sparklinePoints.length > 0)

  return (
    <div className={cn('rounded-2xl border border-gray-200 bg-white p-4 shadow-sm', className)}>
      <div className="text-xs font-semibold text-gray-500">{title}</div>
      <div className={cn('mt-2 flex items-end gap-3', showSparkline ? 'justify-between' : 'justify-start')}>
        {isLoading ? (
          <TurningZeroLoader size="sm" />
        ) : (
          <div className="text-2xl font-semibold text-gray-900">{value}</div>
        )}
        {showSparkline && sparklineTitle && sparklinePoints && !isLoading && (
          <Sparkline
            title={sparklineTitle}
            points={sparklinePoints}
            className="h-7 w-28"
            strokeClassName="stroke-brand-900"
            strokeWidth={2}
          />
        )}
      </div>
      {!isLoading && trendLabel ? (
        <div className="mt-2 text-xs text-gray-500">{trendLabel}</div>
      ) : null}
    </div>
  )
}
