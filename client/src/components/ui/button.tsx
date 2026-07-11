import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-10 text-label-sm font-medium transition duration-200 ease-out cursor-pointer outline-none focus-visible:shadow-button-primary-focus disabled:pointer-events-none disabled:bg-bg-weak-50 disabled:text-text-disabled-300 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-primary-base text-static-white hover:bg-primary-darker',
        destructive: 'bg-error-base text-static-white hover:bg-red-700 focus-visible:shadow-button-error-focus',
        outline:
          'bg-bg-white-0 text-text-sub-600 shadow-regular-xs ring-1 ring-inset ring-stroke-soft-200 hover:bg-bg-weak-50 hover:text-text-strong-950',
        secondary: 'bg-bg-weak-50 text-text-sub-600 hover:bg-bg-white-0 hover:text-text-strong-950 hover:ring-1 hover:ring-stroke-soft-200',
        ghost: 'bg-transparent text-text-sub-600 hover:bg-bg-weak-50 hover:text-text-strong-950',
        link: 'text-primary-base underline-offset-4 hover:underline bg-transparent',
      },
      size: {
        default: 'h-10 px-3.5',
        sm: 'h-9 rounded-lg px-3',
        lg: 'h-11 rounded-10 px-5 text-label-md',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  },
)
Button.displayName = 'Button'

export { Button, buttonVariants }
