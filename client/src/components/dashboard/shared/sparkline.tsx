import { cn } from '@/lib/utils'
import { pointsToPath } from '@/utils/dashboard'

type SparklinePoint = readonly [number, number]

type SparklineProps = {
  points: readonly SparklinePoint[]
  className?: string
  strokeClassName?: string
  strokeWidth?: number
  title: string
}

export function Sparkline({
  points,
  className,
  strokeClassName,
  strokeWidth = 2,
  title,
}: SparklineProps) {
  const d = pointsToPath(points)

  return (
    <svg
      viewBox="0 0 1 1"
      className={cn('h-7 w-24', className)}
      role="img"
      aria-label={title}
      preserveAspectRatio="none"
    >
      <title>{title}</title>
      <path
        d={d}
        fill="none"
        className={cn('stroke-primary-base', strokeClassName)}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </svg>
  )
}
