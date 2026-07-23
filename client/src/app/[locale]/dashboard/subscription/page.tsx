import { redirect } from 'next/navigation'

export default async function SubscriptionPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  redirect(`/${locale}/dashboard/store-settings` as never)
}
