'use client'

import { Check, Plus, ShoppingBag } from 'lucide-react'
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
}

export function QuickAddButton({
  item,
  label,
  addedLabel = 'Added',
  toastTitle = 'Added to cart',
  className,
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
      icon: <ShoppingBag className='size-4' />,
    })
  }

  return (
    <button
      type='button'
      aria-label={label}
      title={label}
      onClick={handleClick}
      className={cn(
        'group/cta relative inline-flex h-11 shrink-0 items-center justify-center overflow-hidden rounded-full font-medium tracking-tight shadow-[0_6px_18px_rgba(43,43,43,0.18)] transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] active:scale-[0.96]',
        success
          ? 'w-[120px] bg-[#7D8F69] text-white'
          : 'w-11 bg-[#B76E5D] text-white hover:w-[140px]',
        className,
      )}
    >
      <Plus
        aria-hidden
        className={cn(
          'absolute size-[18px] transition-all duration-300',
          success
            ? 'opacity-0 scale-50 -rotate-90'
            : 'opacity-100 scale-100 rotate-0 group-hover/cta:opacity-0 group-hover/cta:scale-50',
        )}
      />

      <span
        aria-hidden
        className={cn(
          'inline-flex items-center gap-1.5 text-[12px] font-semibold tracking-tight transition-all duration-300',
          success
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-1 group-hover/cta:opacity-100 group-hover/cta:translate-y-0',
        )}
      >
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
    </button>
  )
}
