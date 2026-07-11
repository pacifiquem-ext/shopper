'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { RiShoppingBag3Line } from '@remixicon/react'
import { Link } from '@/i18n/navigation'
import { CART_EVENT, readCart } from '@/lib/cart-storage'

type Props = {
  storeName: string
  logoUrl: string | null
  searchAria: string
  cartHref?: string
}

function getCartCount(): number {
  return readCart().reduce((sum, item) => sum + item.quantity, 0)
}

export function ClassicMarketNavbar({
  storeName,
  logoUrl,
  searchAria,
  cartHref = '/cart',
}: Props) {
  const tCart = useTranslations('cart')
  const [count, setCount] = useState(0)

  useEffect(() => {
    const sync = () => setCount(getCartCount())
    sync()
    window.addEventListener(CART_EVENT, sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(CART_EVENT, sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  const cartAria =
    count > 0 ? tCart('cartIconAriaWithCount', { count }) : tCart('cartIconAria')

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--kc-border)] bg-[var(--kc-surface)]/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-screen-2xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" prefetch={false} className="flex min-w-0 items-center gap-3">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt=""
              className="size-9 rounded-10 object-cover ring-1 ring-[var(--kc-border)]"
            />
          ) : (
            <span className="flex size-9 items-center justify-center rounded-10 bg-[var(--kc-secondary)] text-sm font-bold text-[var(--kc-on-primary)]">
              {storeName.trim().charAt(0).toUpperCase() || 'S'}
            </span>
          )}
          <span className="truncate text-sm font-semibold text-[var(--kc-ink)] sm:text-base">
            {storeName}
          </span>
        </Link>

        <p className="sr-only">{searchAria}</p>

        <Link
          href={cartHref}
          prefetch={false}
          aria-label={cartAria}
          className="relative inline-flex size-11 items-center justify-center rounded-10 border border-[var(--kc-border)] bg-[var(--kc-surface)] text-[var(--kc-ink)] transition hover:bg-[var(--kc-primary-light)]"
        >
          <RiShoppingBag3Line className="size-5" />
          {count > 0 ? (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--kc-secondary)] px-1 text-[10px] font-bold text-white">
              {count > 99 ? '99+' : count}
            </span>
          ) : null}
        </Link>
      </div>
    </header>
  )
}
