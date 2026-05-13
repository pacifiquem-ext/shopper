'use client'

import { Heart } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { cn } from '@/lib/utils'

type WishlistItem = {
  productId: string
  name: string
  image: string | null
  price: number | null
  storeName: string
}

const WISHLIST_KEY = 'onlineshop.wishlist.v1'
const WISHLIST_EVENT = 'onlineshop:wishlist-updated'

function readWishlist(): WishlistItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(WISHLIST_KEY)
    return raw ? (JSON.parse(raw) as WishlistItem[]) : []
  } catch {
    return []
  }
}

function writeWishlist(items: WishlistItem[]) {
  window.localStorage.setItem(WISHLIST_KEY, JSON.stringify(items))
  window.dispatchEvent(new CustomEvent(WISHLIST_EVENT, { detail: items }))
}

export interface WishlistButtonProps {
  item: WishlistItem
  label: string
  toastSavedLabel?: string
  toastRemovedLabel?: string
  className?: string
  variant?: 'glass' | 'solid'
}

export function WishlistButton({
  item,
  label,
  toastSavedLabel = 'Saved to wishlist',
  toastRemovedLabel = 'Removed from wishlist',
  className,
  variant = 'glass',
}: WishlistButtonProps) {
  const [active, setActive] = useState(false)
  const [pulse, setPulse] = useState(false)

  useEffect(() => {
    const sync = () => {
      const list = readWishlist()
      setActive(list.some((entry) => entry.productId === item.productId))
    }
    sync()

    const handler = () => sync()
    window.addEventListener(WISHLIST_EVENT, handler)
    window.addEventListener('storage', handler)
    return () => {
      window.removeEventListener(WISHLIST_EVENT, handler)
      window.removeEventListener('storage', handler)
    }
  }, [item.productId])

  const handleClick = (event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()

    const list = readWishlist()
    const exists = list.some((entry) => entry.productId === item.productId)
    const next = exists
      ? list.filter((entry) => entry.productId !== item.productId)
      : [...list, item]

    writeWishlist(next)
    setActive(!exists)

    if (!exists) {
      setPulse(true)
      window.setTimeout(() => setPulse(false), 520)
    }

    toast.success(exists ? toastRemovedLabel : toastSavedLabel, {
      description: item.name,
      icon: <Heart className='size-4' />,
    })
  }

  const baseClasses =
    variant === 'glass'
      ? 'border border-[rgba(43,43,43,0.08)] bg-white/75 text-[#2B2B2B] backdrop-blur-md hover:border-[#B76E5D]/40 hover:bg-white shadow-[0_2px_6px_rgba(43,43,43,0.06)]'
      : 'bg-[#2B2B2B] text-white hover:bg-[#2B2B2B]/90'

  return (
    <button
      type='button'
      aria-pressed={active}
      aria-label={label}
      title={label}
      onClick={handleClick}
      className={cn(
        'relative inline-flex size-10 items-center justify-center rounded-full transition-all duration-300 ease-out hover:-translate-y-0.5 active:scale-90',
        baseClasses,
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          'pointer-events-none absolute inset-0 rounded-full ring-2 ring-[#B76E5D]/0 transition-all duration-500',
          pulse ? 'scale-150 opacity-0 ring-[#B76E5D]/70' : 'scale-100 opacity-0',
        )}
      />
      <Heart
        aria-hidden
        className={cn(
          'size-[18px] transition-all duration-300 ease-out',
          active
            ? 'fill-[#B76E5D] text-[#B76E5D] scale-110'
            : 'fill-transparent text-[#2B2B2B]',
          pulse && 'animate-[os-heart-pop_520ms_cubic-bezier(0.2,0.8,0.2,1)_both]',
        )}
      />
    </button>
  )
}
