import ShopPage from './shop/page'

export default async function HomePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ q?: string; category?: string; sort?: string }>
}) {
  return <ShopPage params={params} searchParams={searchParams} />
}
