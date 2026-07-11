'use client'

import { ShoppingBag } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'

import { Link, usePathname } from '@/i18n/navigation'
import { CART_EVENT, readCart } from '@/lib/cart-storage'
import { readStoreContextFromStorage } from '@/lib/store-context'
import { storeCartPath } from '@/lib/store-navigation'
import { cn } from '@/lib/utils'

function getCartCount(): number {
  return readCart().reduce((sum, item) => sum + item.quantity, 0)
}

type CartIconButtonProps = {
  /** `fixed` floats within page gutters; `inline` sits in a header/toolbar row. */
  variant?: 'fixed' | 'inline'
  className?: string
}

export function CartIconButton({ variant = 'fixed', className }: CartIconButtonProps) {
  const t = useTranslations('cart')
  const pathname = usePathname()
  const [count, setCount] = useState(0)
  const [pulse, setPulse] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [cartHref, setCartHref] = useState('/cart')
  const lastCountRef = useRef(0)
  const pulseTimerRef = useRef<number | null>(null)

  useEffect(() => {
    const sync = () => {
      const next = getCartCount()
      const previous = lastCountRef.current

      setCount(next)
      lastCountRef.current = next

      if (next > previous && previous >= 0) {
        setPulse(true)
        if (pulseTimerRef.current) window.clearTimeout(pulseTimerRef.current)
        pulseTimerRef.current = window.setTimeout(() => setPulse(false), 520)
      }
    }

    sync()
    setMounted(true)

    window.addEventListener(CART_EVENT, sync)
    window.addEventListener('storage', sync)

    return () => {
      window.removeEventListener(CART_EVENT, sync)
      window.removeEventListener('storage', sync)
      if (pulseTimerRef.current) window.clearTimeout(pulseTimerRef.current)
    }
  }, [])

  if (pathname === '/cart') return null

  const aria = count > 0 ? t('cartIconAriaWithCount', { count }) : t('cartIconAria')
  const display = count > 99 ? '99+' : String(count)

  const linkClass = cn(
    'group relative inline-flex shrink-0 items-center justify-center rounded-full border border-stroke-soft-200 bg-bg-white-0 text-text-strong-950 shadow-regular-xs transition-colors duration-200 ease-out hover:border-primary-base/30 hover:bg-bg-weak-50 hover:text-text-strong-950 active:scale-95',
    variant === 'inline'
      ? 'h-9 w-9 sm:h-10 sm:w-10'
      : 'pointer-events-auto h-10 w-10 sm:h-11 sm:w-11',
    className,
  )

  const cartLink = (
    <Link
      href={cartHref}
      aria-label={aria}
      title={aria}
      prefetch={false}
      className={linkClass}
    >
      <ShoppingBag
        aria-hidden
        className={cn(
          'size-4 transition-colors duration-300 group-hover:text-[#1daf61] sm:size-[18px]',
          pulse && 'animate-[os-cart-pop_520ms_cubic-bezier(0.2,0.8,0.2,1)_both]',
        )}
        strokeWidth={2}
      />

      {mounted && count > 0 ? (
        <span
          aria-hidden
          className={cn(
            'absolute -right-0.5 -top-0.5 inline-flex min-w-[18px] items-center justify-center rounded-full bg-primary-base px-1 text-[10px] font-bold leading-none text-static-white shadow-regular-xs ring-2 ring-bg-weak-50 sm:min-w-[20px] sm:text-[11px]',
            pulse && 'scale-110',
          )}
        >
          <span className='py-0.5 tabular-nums'>{display}</span>
        </span>
      ) : null}

      <span
        aria-hidden
        className={cn(
          'pointer-events-none absolute inset-0 rounded-full ring-2 ring-[#1daf61]/0 transition-all duration-700',
          pulse ? 'scale-150 opacity-0 ring-[#1daf61]/60' : 'scale-100 opacity-0',
        )}
      />
    </Link>
  )

  if (variant === 'inline') {
    return cartLink
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-50 sm:top-6">
      <div className='mx-auto flex w-full max-w-screen-2xl justify-end px-3 sm:px-4 lg:px-5'>
        {cartLink}
      </div>
    </div>
  )
}
