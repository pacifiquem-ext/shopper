import { getTranslations } from 'next-intl/server'

export default async function ProductsPage() {
  const t = await getTranslations('dashboard')

  return (
    <div className="flex w-full max-w-6xl flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">{t('nav.products')}</h1>
        <p className="mt-2 text-gray-500">Manage what you sell.</p>
      </div>

      <div className="flex min-h-[400px] items-center justify-center rounded-xl border border-gray-200 bg-white p-8 text-gray-500 shadow-sm">
        Products list placeholder
      </div>
    </div>
  )
}
