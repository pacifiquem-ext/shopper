'use client'

import { useCallback, useState } from 'react'

import type { ProductCardLabels } from '@/components/shop/product-card'
import type { CatalogProductPublic } from '@/services/catalog.service'

export type ProductQuickViewCell = {
  product: CatalogProductPublic
  labels: ProductCardLabels
}

export function useProductQuickView() {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState<ProductQuickViewCell | null>(null)

  const openQuickView = useCallback(
    (product: CatalogProductPublic, labels: ProductCardLabels) => {
      setActive({ product, labels })
      setOpen(true)
    },
    [],
  )

  const handleOpenChange = useCallback((next: boolean) => {
    setOpen(next)
    if (!next) setActive(null)
  }, [])

  return { open, active, openQuickView, handleOpenChange }
}
