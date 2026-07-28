'use client'

import { useEffect } from 'react'

import { persistStoreContext } from '@/lib/store-context'

type StoreContextSyncProps = {
  slug: string
}

export function StoreContextSync({ slug }: StoreContextSyncProps) {
  useEffect(() => {
    persistStoreContext(slug)
  }, [slug])

  return null
}
