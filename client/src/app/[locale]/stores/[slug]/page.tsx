import { ShopPage, generateMetadata as shopGenerateMetadata } from '../../shop/shop-catalog'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  return shopGenerateMetadata({ params: Promise.resolve({ locale }) })
}

/**
 * Store profile inside the marketplace (products of one seller).
 * Not a multi-tenant subdomain website.
 */
export default async function StoreProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; slug: string }>
  searchParams: Promise<{ q?: string; category?: string; sort?: string }>
}) {
  const { locale, slug } = await params
  const query = await searchParams

  return (
    <ShopPage
      params={Promise.resolve({ locale })}
      searchParams={Promise.resolve({ ...query, store: slug })}
      catalogBasePath={`/stores/${encodeURIComponent(slug)}`}
    />
  )
}
