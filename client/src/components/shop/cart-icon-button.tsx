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

export function CartIconButton() {
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

  return (
    <Link
      href={cartHref}
      aria-label={aria}
      title={aria}
      prefetch={false}
      className='group fixed top-5 right-5 z-50 inline-flex size-14 items-center justify-center rounded-full border border-[rgba(43,43,43,0.08)] bg-white/70 text-[#2B2B2B] shadow-[0_8px_28px_rgba(43,43,43,0.10),0_2px_6px_rgba(43,43,43,0.06)] backdrop-blur-md transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-[#B76E5D]/50 hover:bg-white/85 hover:shadow-[0_12px_36px_rgba(43,43,43,0.14)] active:scale-95 sm:top-6 sm:right-6'
    >
      <ShoppingBag
        aria-hidden
        className={cn(
          'size-5 transition-colors duration-300 group-hover:text-[#B76E5D]',
          pulse && 'animate-[os-cart-pop_520ms_cubic-bezier(0.2,0.8,0.2,1)_both]',
        )}
        strokeWidth={1.75}
      />

      {mounted && count > 0 ? (
        <span
          aria-hidden
          className={cn(
            'absolute -right-1 -top-1 inline-flex min-w-[22px] items-center justify-center rounded-full bg-[#B76E5D] px-1.5 text-[11px] font-bold leading-none text-white shadow-[0_2px_8px_rgba(183,110,93,0.45)] ring-2 ring-[#F5F1EB] transition-transform duration-300',
            pulse && 'scale-110',
          )}
        >
          <span className='py-1 tabular-nums'>{display}</span>
        </span>
      ) : null}

      <span
        aria-hidden
        className={cn(
          'pointer-events-none absolute inset-0 rounded-full ring-2 ring-[#B76E5D]/0 transition-all duration-700',
          pulse ? 'scale-150 opacity-0 ring-[#B76E5D]/60' : 'scale-100 opacity-0',
        )}
      />
    </Link>
  )
}
