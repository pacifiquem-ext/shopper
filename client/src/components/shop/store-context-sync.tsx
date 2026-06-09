'use client'

import { useEffect } from 'react'

import { persistStoreContext } from '@/lib/store-context'

type StoreContextSyncProps = {
  subdomain: string
}

/** Remembers which store storefront the user is browsing (for themed cart, etc.). */
export function StoreContextSync({ subdomain }: StoreContextSyncProps) {
  useEffect(() => {
    persistStoreContext(subdomain)
  }, [subdomain])

  return null
}
