import * as React from 'react'
import { cn } from '@/lib/utils'

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-10 border-0 bg-bg-white-0 px-3 py-2 text-paragraph-sm text-text-strong-950 shadow-regular-xs ring-1 ring-inset ring-stroke-soft-200 transition duration-200 outline-none file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-text-soft-400 focus-visible:shadow-button-primary-focus focus-visible:ring-primary-base disabled:cursor-not-allowed disabled:bg-bg-weak-50 disabled:text-text-disabled-300',
          className,
        )}
        ref={ref}
        {...props}
      />
    )
  },
)
Input.displayName = 'Input'

export { Input }
