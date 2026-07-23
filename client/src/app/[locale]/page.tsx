import { MarketplaceHome } from '@/components/shop/marketplace-home'
import { ShopPage } from './shop/shop-catalog'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

export default async function HomePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ q?: string; category?: string; sort?: string; store?: string }>
}) {
  const query = await searchParams
  const hasFilters = Boolean(query.q || query.category || query.sort || query.store)

  if (hasFilters) {
    return (
      <ShopPage params={params} searchParams={searchParams} compactHero catalogBasePath='/' />
    )
  }

  return <MarketplaceHome />
}
