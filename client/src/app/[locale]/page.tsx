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
  return (
    <ShopPage params={params} searchParams={searchParams} compactHero catalogBasePath='/' />
  )
}
