import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border-0 px-2 py-0.5 text-label-xs font-medium transition-colors ring-1 ring-inset focus:outline-none',
  {
    variants: {
      variant: {
        default: 'bg-primary-alpha-10 text-primary-base ring-transparent',
        secondary: 'bg-bg-weak-50 text-text-sub-600 ring-stroke-soft-200',
        destructive: 'bg-error-alpha-10 text-error-base ring-transparent',
        outline: 'bg-bg-white-0 text-text-sub-600 ring-stroke-soft-200',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
