import { cn } from '@/lib/utils'

const sizeClasses = {
  xs: 'h-4 w-4 border-2',
  sm: 'h-5 w-5 border-2',
  md: 'h-8 w-8 border-[3px]',
  lg: 'h-10 w-10 border-4',
} as const

export type TurningZeroLoaderSize = keyof typeof sizeClasses

type TurningZeroLoaderProps = {
  size?: TurningZeroLoaderSize
  className?: string
  label?: string
}

/** Spinning ring loader (turning zero) — brand default across dashboard. */
export function TurningZeroLoader({
  size = 'md',
  className,
  label = 'Loading',
}: TurningZeroLoaderProps) {
  return (
    <span
      role="status"
      aria-label={label}
      className={cn(
        'inline-block shrink-0 animate-spin rounded-full border-primary-base border-t-transparent',
        sizeClasses[size],
        className,
      )}
    />
  )
}

type LoaderPanelProps = {
  label?: string
  className?: string
  minHeightClassName?: string
  size?: TurningZeroLoaderSize
}

export function LoaderPanel({
  label,
  className,
  minHeightClassName = 'min-h-[200px]',
  size = 'md',
}: LoaderPanelProps) {
  return (
    <div
      className={cn(
        'flex w-full flex-col items-center justify-center gap-3',
        minHeightClassName,
        className,
      )}
    >
      <TurningZeroLoader size={size} label={label} />
      {label ? <p className="text-sm font-medium text-text-soft-400">{label}</p> : null}
    </div>
  )
}
