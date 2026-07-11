'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

const INPUT_ROOT_NAME = 'InputRoot'
const INPUT_WRAPPER_NAME = 'InputWrapper'
const INPUT_EL_NAME = 'InputInput'
const INPUT_ICON_NAME = 'InputIcon'

const InputRoot = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { hasError?: boolean }
>(({ className, hasError, ...rest }, ref) => (
  <div
    ref={ref}
    className={cn(
      'relative flex w-full overflow-hidden rounded-10 bg-bg-white-0 shadow-regular-xs ring-1 ring-inset transition duration-200 ease-out',
      hasError
        ? 'ring-error-base focus-within:shadow-button-error-focus'
        : 'ring-stroke-soft-200 focus-within:ring-primary-base focus-within:shadow-button-primary-focus',
      className,
    )}
    {...rest}
  />
))
InputRoot.displayName = INPUT_ROOT_NAME

const InputWrapper = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...rest }, ref) => (
  <div
    ref={ref}
    className={cn('flex w-full items-center gap-2 px-3', className)}
    {...rest}
  />
))
InputWrapper.displayName = INPUT_WRAPPER_NAME

const InputInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type = 'text', ...rest }, ref) => (
  <input
    ref={ref}
    type={type}
    className={cn(
      'h-10 w-full min-w-0 bg-transparent text-paragraph-sm text-text-strong-950 outline-none placeholder:text-text-soft-400 disabled:cursor-not-allowed disabled:text-text-disabled-300',
      className,
    )}
    {...rest}
  />
))
InputInput.displayName = INPUT_EL_NAME

function InputIcon({
  className,
  as: Comp = 'div',
  ...rest
}: React.HTMLAttributes<HTMLElement> & { as?: React.ElementType }) {
  return (
    <Comp
      className={cn('size-5 shrink-0 text-text-soft-400', className)}
      {...rest}
    />
  )
}
InputIcon.displayName = INPUT_ICON_NAME

export {
  InputRoot as Root,
  InputWrapper as Wrapper,
  InputInput as Input,
  InputIcon as Icon,
}
