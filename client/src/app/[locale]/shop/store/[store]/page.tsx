import { fetchCatalogGroups } from '@/services/catalog.service'

import { ShopPage, generateMetadata } from '../../shop-catalog'

export const dynamic = 'force-dynamic'

export { generateMetadata }

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; store: string }>
  searchParams: Promise<{ q?: string; category?: string; sort?: string }>
}) {
  const { store, ...rest } = await params
  const storeParams = Promise.resolve({ ...rest })
  const mergedSearchParams = Promise.resolve({
    ...(await searchParams),
    store,
  })

  return <ShopPage params={storeParams} searchParams={mergedSearchParams} catalogBasePath={`/shop/store/${store}`} />
}

