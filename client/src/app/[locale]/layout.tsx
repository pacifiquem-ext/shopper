import { Toaster as SonnerToaster } from '@/components/ui/sonner'

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import type React from 'react'
import '../../styles/globals.css'

import { rootMetadata } from '#/config/root-metadata'
import { routing } from '@/i18n/routing'
import { hasLocale } from 'next-intl'
import { getMessages, getTimeZone, getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { RootWrapper } from './root-wrapper'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
})

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  const messages = await getMessages()
  const timeZone = await getTimeZone()
  const t = await getTranslations({ locale, namespace: 'common' })

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${inter.variable} ${inter.className} font-sans antialiased`}>
        <a
          href="#main-content"
          className="bg-primary-base text-static-white focus:ring-primary-base absolute left-4 top-4 z-[100] -translate-y-[200%] rounded-10 px-4 py-2 text-label-sm shadow-regular-md transition-transform focus:translate-y-0 focus:outline-none focus:ring-2 focus:ring-offset-2"
        >
          {t('a11y.skipToMain')}
        </a>
        <RootWrapper locale={locale} messages={messages} timeZone={timeZone}>
          {children}
        </RootWrapper>
        <SonnerToaster position="top-right" duration={3000} closeButton />
      </body>
    </html>
  )
}

export const metadata: Metadata = { ...rootMetadata }
