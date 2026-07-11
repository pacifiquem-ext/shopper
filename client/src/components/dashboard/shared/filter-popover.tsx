'use client'

import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { Filter } from 'lucide-react'

export interface FilterPopoverProps {
  title: string
  subtitle?: string
  children: React.ReactNode
  onClear: () => void
  onApply: () => void
  clearLabel?: string
  applyLabel?: string
  triggerClassName?: string
  contentClassName?: string
  align?: 'start' | 'center' | 'end'
  ariaLabel?: string
}

export function FilterPopover({
  title,
  subtitle,
  children,
  onClear,
  onApply,
  clearLabel = 'Clear',
  applyLabel = 'Apply',
  triggerClassName,
  contentClassName,
  align = 'end',
  ariaLabel = 'Open filters',
}: FilterPopoverProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={ariaLabel}
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-lg border border-stroke-soft-200 bg-white text-text-sub-600 shadow-xs transition-colors',
            'hover:bg-primary-alpha-10 hover:text-primary-base',
            triggerClassName
          )}
        >
          <Filter className="h-4 w-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align={align}
        className={cn('w-[360px] border-stroke-soft-200 bg-white p-4 text-text-strong-950 shadow-md', contentClassName)}
      >
        <div>
          <div className="text-sm font-semibold text-text-strong-950">{title}</div>
          {subtitle && <div className="mt-0.5 text-xs font-medium text-text-soft-400">{subtitle}</div>}
        </div>
        <div className="mt-4">{children}</div>
        <div className="mt-4 flex items-center justify-between gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClear}
            className="h-9 rounded-lg border-stroke-soft-200 bg-white text-text-sub-600 hover:bg-primary-alpha-10 hover:text-primary-base"
          >
            {clearLabel}
          </Button>
          <Button
            type="button"
            onClick={onApply}
            className="h-9 rounded-lg bg-primary-base text-white hover:bg-primary-darker"
          >
            {applyLabel}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
