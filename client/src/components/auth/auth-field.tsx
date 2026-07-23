'use client'

import * as React from 'react'
import * as Input from '@/components/alignui/input'
import * as Label from '@/components/alignui/label'
import { FormControl, FormItem, FormMessage } from '@/components/ui/form'
import { cn } from '@/lib/utils'

type AuthFieldProps = {
  label: string
  icon?: React.ElementType
  hasError?: boolean
  hint?: string
  children: React.ReactElement
  className?: string
}

/**
 * AlignUI-styled field wrapper for auth forms (label + ringed input + message).
 * Pass the form field input as `children`; it is slotted into AlignUI Input.Input via FormControl.
 */
export function AuthField({ label, icon: Icon, hasError, hint, children, className }: AuthFieldProps) {
  return (
    <FormItem className={cn('space-y-1.5', className)}>
      <Label.Root className="text-label-sm text-text-sub-600">{label}</Label.Root>
      <Input.Root hasError={hasError}>
        <Input.Wrapper>
          {Icon ? <Input.Icon as={Icon} /> : null}
          <FormControl>{children}</FormControl>
        </Input.Wrapper>
      </Input.Root>
      {hint ? <p className="text-paragraph-xs text-text-soft-400">{hint}</p> : null}
      <FormMessage className="text-paragraph-xs text-error-base" />
    </FormItem>
  )
}

export function AuthInput(
  props: React.ComponentProps<typeof Input.Input>,
) {
  return <Input.Input {...props} />
}
