'use client'

import { ShoppingBag, Store } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffect, useRef, useState } from 'react'

import { Link } from '@/i18n/navigation'
import { CART_EVENT, readCart } from '@/lib/cart-storage'
import { cn } from '@/lib/utils'

type VibrantMarketNavbarProps = {
  storeName: string
  logoUrl: string | null
  cartHref?: string
}

function getCartCount(): number {
  return readCart().reduce((sum, item) => sum + item.quantity, 0)
}

const iconButtonClass =
  'relative inline-flex size-11 items-center justify-center rounded-full text-[var(--vm-on-primary)] transition-colors hover:bg-white/10 active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--vm-secondary)]/50'

export function VibrantMarketNavbar({
  storeName,
  logoUrl,
  cartHref = '/cart',
}: VibrantMarketNavbarProps) {
  const tCart = useTranslations('cart')
  const [count, setCount] = useState(0)
  const [mounted, setMounted] = useState(false)
  const lastCountRef = useRef(0)

  useEffect(() => {
    const sync = () => {
      const next = getCartCount()
      lastCountRef.current = next
      setCount(next)
    }
    sync()
    setMounted(true)
    window.addEventListener(CART_EVENT, sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(CART_EVENT, sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  const cartAria =
    count > 0 ? tCart('cartIconAriaWithCount', { count }) : tCart('cartIconAria')
  const display = count > 99 ? '99+' : String(count)

  return (
    <header className='bg-[var(--vm-primary)] text-white'>
      <div className='mx-auto flex h-14 max-w-screen-2xl items-center justify-between gap-3 px-3 sm:h-16 sm:px-4 lg:px-5'>
        <Link
          href='/'
          prefetch={false}
          className='flex min-w-0 items-center gap-2.5 sm:gap-3'
          aria-label={storeName}
        >
          <span className='flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white/10 ring-1 ring-[var(--vm-secondary)]/25 sm:size-11'>
            {logoUrl ? (
              <img src={logoUrl} alt='' className='size-full object-cover' />
            ) : (
              <Store className='size-5 text-[var(--vm-on-primary)]' aria-hidden strokeWidth={2.25} />
            )}
          </span>
          <span className='sr-only sm:not-sr-only sm:truncate sm:text-base sm:font-black sm:tracking-tight lg:text-lg'>
            {storeName}
          </span>
        </Link>

        <div className='flex shrink-0 items-center gap-0.5 sm:gap-1'>
          <Link
            href={cartHref}
            prefetch={false}
            aria-label={cartAria}
            title={cartAria}
            className={cn(iconButtonClass)}
          >
            <ShoppingBag className='size-5' aria-hidden strokeWidth={2} />
            {mounted && count > 0 ? (
              <span
                aria-hidden
                className='absolute -right-0.5 -top-0.5 inline-flex min-w-[1.15rem] items-center justify-center rounded-full border-2 border-[var(--vm-primary)] bg-[var(--vm-accent)] px-1 py-0.5 text-[10px] font-bold leading-none text-[var(--vm-on-primary)]'
              >
                {display}
              </span>
            ) : null}
          </Link>
        </div>
      </div>
    </header>
  )
}
