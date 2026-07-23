import * as React from 'react'
import { cn } from '@/lib/utils'

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-10 bg-bg-soft-200', className)}
      {...props}
    />
  )
}

export { Skeleton }
