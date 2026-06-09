import { ShopPage, generateMetadata } from './shop-catalog'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'rw' }]
}

export { generateMetadata }

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ q?: string; category?: string; sort?: string; store?: string }>
}) {
  return <ShopPage params={params} searchParams={searchParams} compactHero />
}
