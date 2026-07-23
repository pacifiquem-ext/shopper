'use client'

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import type { PolymorphicComponentProps } from '@/utils/polymorphic'
import { recursiveCloneChildren } from '@/utils/recursive-clone-children'
import { buttonVariants, type ButtonVariantProps } from '@/components/alignui/button-variants'

export { buttonVariants } from '@/components/alignui/button-variants'

const BUTTON_ROOT_NAME = 'ButtonRoot'
const BUTTON_ICON_NAME = 'ButtonIcon'

type ButtonSharedProps = ButtonVariantProps

type ButtonRootProps = ButtonVariantProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    asChild?: boolean
  }

const ButtonRoot = React.forwardRef<HTMLButtonElement, ButtonRootProps>(
  ({ children, variant, mode, size, asChild, className, ...rest }, forwardedRef) => {
    const uniqueId = React.useId()
    const Component = asChild ? Slot : 'button'
    const { root } = buttonVariants({ variant, mode, size })
    const sharedProps: ButtonSharedProps = { variant, mode, size }
    // Slot (asChild) requires exactly one React element child — not an array.
    // recursiveCloneChildren uses Children.map which always returns an array.
    const content = asChild
      ? children
      : recursiveCloneChildren(
          children,
          sharedProps,
          [BUTTON_ICON_NAME],
          uniqueId,
          asChild,
        )

    return (
      <Component
        ref={forwardedRef}
        className={root({ class: className })}
        {...rest}
      >
        {content}
      </Component>
    )
  },
)
ButtonRoot.displayName = BUTTON_ROOT_NAME

function ButtonIcon<T extends React.ElementType = 'div'>({
  variant,
  mode,
  size,
  as,
  className,
  ...rest
}: PolymorphicComponentProps<T, ButtonSharedProps>) {
  const Component = as || 'div'
  const { icon } = buttonVariants({ mode, variant, size })
  return <Component className={icon({ class: className })} {...rest} />
}
ButtonIcon.displayName = BUTTON_ICON_NAME

export { ButtonRoot as Root, ButtonIcon as Icon }
