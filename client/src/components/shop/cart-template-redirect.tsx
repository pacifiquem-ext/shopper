'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

import { useRouter } from '@/i18n/navigation'
import { readStoreContextFromStorage } from '@/lib/store-context'
import { normalizeStoreSubdomain } from '@/lib/host'
import { STORE_TEMPLATE_IDS, type StoreTemplateId } from '@/lib/store-templates'

type CartTemplateRedirectProps = {
  template: StoreTemplateId
}

/**
 * When cart opens as `/cart` without `?store=`, redirect using the last browsed store
 * so the server can render the correct storefront template.
 */
export function CartTemplateRedirect({ template }: CartTemplateRedirectProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (template !== STORE_TEMPLATE_IDS.DEFAULT) return

    const fromQuery = normalizeStoreSubdomain(searchParams.get('store'))
    if (fromQuery) return

    const fromStorage = normalizeStoreSubdomain(readStoreContextFromStorage())
    if (!fromStorage) return

    router.replace(`/cart?store=${encodeURIComponent(fromStorage)}`)
  }, [template, router, searchParams])

  return null
}
