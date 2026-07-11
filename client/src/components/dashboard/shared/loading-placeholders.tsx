import { TurningZeroLoader, LoaderPanel } from '@/components/ui/turning-zero-loader'
import { cn } from '@/lib/utils'

export function SkeletonBlock({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-md bg-bg-weak-50', className)} />
}

export function SheetDetailSkeleton({ className, label }: { className?: string; label?: string }) {
  return <LoaderPanel className={className} label={label} minHeightClassName="min-h-[320px]" />
}

export function InlineLoadingState({
  label,
  className,
}: {
  label: string
  className?: string
}) {
  return (
    <div className={cn('flex items-center justify-center gap-2.5 py-10 text-sm text-text-soft-400', className)}>
      <TurningZeroLoader size="sm" label={label} />
      <span>{label}</span>
    </div>
  )
}

export function NotificationListSkeleton() {
  return (
    <div className="flex items-center justify-center py-8">
      <TurningZeroLoader size="md" />
    </div>
  )
}

export function ChartLoadingPlaceholder({
  className,
  minHeightClassName = 'min-h-[200px]',
}: {
  className?: string
  minHeightClassName?: string
}) {
  return <LoaderPanel className={className} minHeightClassName={minHeightClassName} size="md" />
}
