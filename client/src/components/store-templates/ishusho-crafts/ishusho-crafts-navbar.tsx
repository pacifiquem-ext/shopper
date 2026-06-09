'use client'

import { ShoppingBag } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'

import { Link } from '@/i18n/navigation'
import { CART_EVENT, readCart } from '@/lib/cart-storage'
import { cn } from '@/lib/utils'

type IshushoCraftsNavbarProps = {
  storeName: string
  logoUrl: string | null
  navShopLabel: string
  cartHref?: string
}

function getCartCount(): number {
  return readCart().reduce((sum, item) => sum + item.quantity, 0)
}

export function IshushoCraftsNavbar({
  storeName,
  logoUrl,
  navShopLabel,
  cartHref = '/cart',
}: IshushoCraftsNavbarProps) {
  const tCart = useTranslations('cart')
  const [count, setCount] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const sync = () => setCount(getCartCount())
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
    <header className='sticky top-0 z-50 border-b border-[var(--ic-border)] bg-[color-mix(in_srgb,var(--ic-primary)_92%,transparent)] shadow-[0_8px_32px_rgba(0,0,0,0.45)] backdrop-blur-xl'>
      <div
        className='pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[var(--ic-secondary)]/55 to-transparent'
        aria-hidden
      />
      <div className='mx-auto flex h-[4.25rem] max-w-screen-2xl items-center justify-between gap-4 px-3 sm:px-4 lg:px-5'>
        <Link
          href='/'
          prefetch={false}
          className='flex min-w-0 items-center gap-3'
          aria-label={storeName}
        >
          {logoUrl ? (
            <>
              <span className='flex size-10 shrink-0 overflow-hidden rounded-lg bg-[var(--ic-surface)] shadow-[0_4px_18px_rgba(0,0,0,0.35)] ring-1 ring-[color-mix(in_srgb,var(--ic-secondary)_35%,transparent)]'>
                <img src={logoUrl} alt='' className='size-full object-cover' />
              </span>
              <span className='min-w-0'>
                <span className='block truncate font-[family-name:var(--font-ic-display)] text-lg font-semibold tracking-tight text-[var(--ic-ink)] sm:text-xl'>
                  {storeName}
                </span>
              </span>
            </>
          ) : (
            <span className='font-[family-name:var(--font-ic-display)] text-xl font-semibold tracking-tight text-[var(--ic-ink)] sm:text-2xl'>
              {storeName}
            </span>
          )}
        </Link>

        <div className='flex shrink-0 items-center gap-2'>
          <a
            href='#products'
            className='hidden rounded-lg px-3 py-2 text-sm font-medium text-[var(--ic-muted)] transition-colors hover:bg-[var(--ic-primary-light)] hover:text-[var(--ic-secondary)] sm:inline-flex'
          >
            {navShopLabel}
          </a>
          <Link
            href={cartHref}
            prefetch={false}
            aria-label={cartAria}
            className={cn(
              'relative inline-flex size-11 items-center justify-center rounded-lg border border-[var(--ic-border)] bg-[var(--ic-surface)] text-[var(--ic-ink)] transition-colors hover:border-[color-mix(in_srgb,var(--ic-secondary)_40%,transparent)] hover:text-[var(--ic-secondary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ic-secondary)]/40',
            )}
          >
            <ShoppingBag className='size-5' aria-hidden strokeWidth={2} />
            {mounted && count > 0 ? (
              <span
                aria-hidden
                className='absolute -right-1 -top-1 inline-flex min-w-[1.1rem] items-center justify-center rounded-md border-2 border-[var(--ic-primary)] bg-[var(--ic-accent)] px-1 py-0.5 text-[10px] font-bold leading-none text-[var(--ic-on-secondary)]'
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
