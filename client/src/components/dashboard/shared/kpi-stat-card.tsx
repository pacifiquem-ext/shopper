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
    <div
      className={cn(
        'rounded-20 border border-stroke-soft-200 bg-bg-white-0 p-5 shadow-regular-xs transition duration-200 hover:shadow-regular-sm',
        className,
      )}
    >
      <div className="text-label-xs uppercase tracking-[0.08em] text-text-soft-400">{title}</div>
      <div className={cn('mt-3 flex items-end gap-3', showSparkline ? 'justify-between' : 'justify-start')}>
        {isLoading ? (
          <TurningZeroLoader size="sm" />
        ) : (
          <div className="text-title-h5 text-text-strong-950">{value}</div>
        )}
        {showSparkline && sparklineTitle && sparklinePoints && !isLoading && (
          <Sparkline
            title={sparklineTitle}
            points={sparklinePoints}
            className="h-7 w-28"
            strokeClassName="stroke-primary-base"
            strokeWidth={2}
          />
        )}
      </div>
      {!isLoading && trendLabel ? (
        <div className="mt-2 text-paragraph-xs text-text-sub-600">{trendLabel}</div>
      ) : null}
    </div>
  )
}
