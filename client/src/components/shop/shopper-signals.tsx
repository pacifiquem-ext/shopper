'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'

import { CART_EVENT, type CartItem } from '@/lib/cart-storage'
import {
  SHOPPER_SIGNAL_EVENT,
  catalogAuthHeaders,
  emitShopperSignal,
  getShopperVisitorId,
  type ShopperClientSignal,
} from '@/lib/shopper-profile'
import { getPublicApiBaseUrl } from '@/lib/api-base-url'

const FLUSH_MS = 4000

export function ShopperSignals() {
  const pathname = usePathname()
  const queue = useRef<ShopperClientSignal[]>([])
  const seenPath = useRef<string>('')

  useEffect(() => {
    getShopperVisitorId()
  }, [])

  useEffect(() => {
    const enqueue = (signal: ShopperClientSignal) => {
      queue.current.push(signal)
    }

    const onSignal = (event: Event) => {
      const detail = (event as CustomEvent<ShopperClientSignal>).detail
      if (detail?.type) enqueue(detail)
    }
    const onCart = (event: Event) => {
      const items = (event as CustomEvent<CartItem[]>).detail ?? []
      const latest = items[items.length - 1]
      if (!latest) return
      enqueue({
        type: 'ADD_CART',
        productId: latest.productId,
        storeId: latest.storeId,
        price: latest.price,
      })
    }
    const onWishlist = () => {
      enqueue({ type: 'WISHLIST' })
    }

    window.addEventListener(SHOPPER_SIGNAL_EVENT, onSignal)
    window.addEventListener(CART_EVENT, onCart)
    window.addEventListener('shopper:wishlist-updated', onWishlist)

    const flush = async () => {
      if (queue.current.length === 0) return
      const events = queue.current.splice(0, queue.current.length)
      try {
        await fetch(`${getPublicApiBaseUrl()}/catalog/signals`, {
          method: 'POST',
          headers: {
            ...(await catalogAuthHeaders()),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            visitorId: getShopperVisitorId(),
            events,
          }),
          keepalive: true,
        })
      } catch {
        queue.current.unshift(...events)
      }
    }

    const timer = window.setInterval(() => {
      void flush()
    }, FLUSH_MS)
    const onHide = () => {
      void flush()
    }
    document.addEventListener('visibilitychange', onHide)
    window.addEventListener('pagehide', onHide)

    return () => {
      window.removeEventListener(SHOPPER_SIGNAL_EVENT, onSignal)
      window.removeEventListener(CART_EVENT, onCart)
      window.removeEventListener('shopper:wishlist-updated', onWishlist)
      document.removeEventListener('visibilitychange', onHide)
      window.removeEventListener('pagehide', onHide)
      window.clearInterval(timer)
      void flush()
    }
  }, [])

  useEffect(() => {
    if (!pathname) return
    const search = new URLSearchParams(window.location.search).get('q')?.trim()
    const key = `${pathname}?${search ?? ''}`
    if (seenPath.current === key) return
    seenPath.current = key
    if (search) emitShopperSignal({ type: 'SEARCH', query: search })
    const storeMatch = pathname.match(/\/stores\/([^/?#]+)/)
    const productMatch = pathname.match(/\/shop\/([^/?#]+)/)
    if (storeMatch?.[1] && storeMatch[1] !== 'undefined') {
      emitShopperSignal({ type: 'VIEW_STORE', storeId: decodeURIComponent(storeMatch[1]) })
    } else if (productMatch?.[1] && productMatch[1] !== 'undefined') {
      emitShopperSignal({ type: 'VIEW_PRODUCT', productId: decodeURIComponent(productMatch[1]) })
    }
  }, [pathname])

  return null
}
