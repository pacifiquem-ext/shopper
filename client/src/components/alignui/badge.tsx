'use client'

import * as React from 'react'
import { tv, type VariantProps } from '@/utils/tv'
import { cn } from '@/lib/utils'

const badgeVariants = tv({
  base: 'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-label-xs font-medium ring-1 ring-inset',
  variants: {
    color: {
      gray: 'bg-bg-weak-50 text-text-sub-600 ring-stroke-soft-200',
      green: 'bg-success-alpha-10 text-success-base ring-transparent',
      red: 'bg-error-alpha-10 text-error-base ring-transparent',
      orange: 'bg-warning-alpha-10 text-warning-base ring-transparent',
      blue: 'bg-information-alpha-10 text-information-base ring-transparent',
      purple: 'bg-feature-alpha-10 text-feature-base ring-transparent',
    },
  },
  defaultVariants: { color: 'gray' },
})

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof badgeVariants>

export function Badge({ className, color, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ color }), className)} {...props} />
}
