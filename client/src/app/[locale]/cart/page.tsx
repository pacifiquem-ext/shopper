import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

import { CartPageClient } from '@/components/shop/cart-page-client'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'cart' })

  return {
    title: t('title'),
    description: t('subtitle'),
  }
}

export default function CartPage() {
  return <CartPageClient />
}
