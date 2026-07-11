'use client'

import { Check, ShoppingBag } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

import { cn } from '@/lib/utils'
import { addCartItem, type CartItem } from '@/lib/cart-storage'

export interface QuickAddButtonProps {
  item: Omit<CartItem, 'quantity'>
  label: string
  addedLabel?: string
  toastTitle?: string
  className?: string
  /** Always show full-width label (Vibrant Market product cards). */
  fullWidth?: boolean
}

export function QuickAddButton({
  item,
  label,
  addedLabel = 'Added',
  toastTitle = 'Added to cart',
  className,
  fullWidth = false,
}: QuickAddButtonProps) {
  const [success, setSuccess] = useState(false)
  const timerRef = useRef<number | null>(null)

  useEffect(
    () => () => {
      if (timerRef.current) window.clearTimeout(timerRef.current)
    },
    [],
  )

  const handleClick = (event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()

    addCartItem(item)
    setSuccess(true)

    if (timerRef.current) window.clearTimeout(timerRef.current)
    timerRef.current = window.setTimeout(() => setSuccess(false), 1400)

    toast.success(toastTitle, {
      description: item.name,
      duration: 2200,
    })
  }

  return (
    <button
      type='button'
      aria-label={label}
      title={label}
      onClick={handleClick}
      className={cn(
        'group/cta relative inline-flex h-10 shrink-0 items-center justify-center overflow-hidden rounded-full px-3 font-medium tracking-tight shadow-regular-xs transition-colors duration-200 ease-out active:scale-[0.98] sm:h-11 sm:px-4',
        fullWidth
          ? cn(
              'w-full rounded-xl',
              success
                ? 'bg-[var(--vm-accent,#FF6B00)] text-[var(--vm-primary,#121212)]'
                : 'bg-[var(--vm-secondary,#A3FF12)] text-[var(--vm-primary,#121212)] hover:brightness-95',
            )
          : success
            ? 'bg-primary-base text-static-white'
            : 'bg-primary-base text-static-white hover:bg-primary-darker',
        className,
      )}
    >
      {fullWidth ? (
        <span className='inline-flex items-center gap-1.5 text-[12px] font-semibold tracking-tight'>
          {success ? (
            <>
              <Check className='size-4' aria-hidden strokeWidth={2.5} />
              {addedLabel}
            </>
          ) : (
            <>
              <ShoppingBag className='size-4' aria-hidden strokeWidth={2} />
              {label}
            </>
          )}
        </span>
      ) : (
        <span className='inline-flex items-center gap-1.5 text-[11px] font-semibold sm:text-xs'>
          {success ? (
            <>
              <Check aria-hidden className='size-4 shrink-0' strokeWidth={2.5} />
              <span>{addedLabel}</span>
            </>
          ) : (
            <>
              <ShoppingBag aria-hidden className='size-4 shrink-0' strokeWidth={2} />
              <span>{label}</span>
            </>
          )}
        </span>
      )}
    </button>
  )
}
