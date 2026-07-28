import { redirect } from '@/i18n/navigation'

export default async function StorePathRedirect({
  params,
}: {
  params: Promise<{ locale: string; store: string }>
}) {
  const { locale, store } = await params
  redirect({ href: `/stores/${encodeURIComponent(store)}`, locale })
}
