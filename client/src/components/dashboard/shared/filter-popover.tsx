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
            'flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 shadow-xs transition-colors',
            'hover:bg-brand-50 hover:text-brand-900',
            triggerClassName
          )}
        >
          <Filter className="h-4 w-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align={align}
        className={cn('w-[360px] border-gray-200 bg-white p-4 text-gray-900 shadow-md', contentClassName)}
      >
        <div>
          <div className="text-sm font-semibold text-gray-900">{title}</div>
          {subtitle && <div className="mt-0.5 text-xs font-medium text-gray-500">{subtitle}</div>}
        </div>
        <div className="mt-4">{children}</div>
        <div className="mt-4 flex items-center justify-between gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClear}
            className="h-9 rounded-lg border-gray-200 bg-white text-gray-700 hover:bg-brand-50 hover:text-brand-900"
          >
            {clearLabel}
          </Button>
          <Button
            type="button"
            onClick={onApply}
            className="h-9 rounded-lg bg-brand-900 text-white hover:bg-brand-800"
          >
            {applyLabel}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
