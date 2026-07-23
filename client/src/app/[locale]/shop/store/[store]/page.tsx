import { redirect } from '@/i18n/navigation'

/** Legacy storefront path → marketplace store profile. */
export default async function LegacyStoreStorefrontRedirect({
  params,
}: {
  params: Promise<{ locale: string; store: string }>
}) {
  const { locale, store } = await params
  redirect({ href: `/stores/${encodeURIComponent(store)}`, locale })
}
