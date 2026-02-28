import { getTranslations } from 'next-intl/server'

export default async function HomePage() {
  const t = await getTranslations('hero')
  console.log('page: title', t('title'))

  return (
    <div>
      <p className='text-2xl font-bold'>Welcome to Online Shop</p>
    </div>
  )
}
