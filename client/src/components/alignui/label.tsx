'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

const LabelRoot = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...rest }, ref) => (
  <label
    ref={ref}
    className={cn('text-label-sm text-text-strong-950', className)}
    {...rest}
  />
))
LabelRoot.displayName = 'LabelRoot'

export { LabelRoot as Root }
