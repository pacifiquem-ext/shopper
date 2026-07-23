import { cn } from '@/lib/utils'

function EmptyState({
  className,
  title,
  description,
  action,
  icon,
}: {
  className?: string
  title: string
  description?: string
  action?: React.ReactNode
  icon?: React.ReactNode
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-20 border border-stroke-soft-200 bg-bg-white-0 px-6 py-16 text-center shadow-regular-xs',
        className,
      )}
    >
      {icon ? <div className="text-text-soft-400">{icon}</div> : null}
      <p className="text-label-md text-text-strong-950">{title}</p>
      {description ? (
        <p className="max-w-sm text-paragraph-sm text-text-sub-600">{description}</p>
      ) : null}
      {action}
    </div>
  )
}

export { EmptyState }
