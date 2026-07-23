import * as React from 'react'
import { cn } from '@/lib/utils'

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<'textarea'>>(
  ({ className, ...props }, ref) => (
    <textarea
      className={cn(
        'flex min-h-[96px] w-full rounded-10 border-0 bg-bg-white-0 px-3 py-2.5 text-paragraph-sm text-text-strong-950 shadow-regular-xs ring-1 ring-inset ring-stroke-soft-200',
        'placeholder:text-text-soft-400 outline-none transition duration-200',
        'focus-visible:ring-primary-base focus-visible:shadow-button-primary-focus',
        'disabled:cursor-not-allowed disabled:bg-bg-weak-50 disabled:text-text-disabled-300',
        className,
      )}
      ref={ref}
      {...props}
    />
  ),
)
Textarea.displayName = 'Textarea'

export { Textarea }
