import { Toaster } from '@/components/ui/toaster'
import { Toaster as SonnerToaster } from '@/components/ui/sonner'

import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import type React from 'react'
import '../../styles/globals.css'

import { rootMetadata } from '#/config/root-metadata'
import { routing } from '@/i18n/routing'
import { hasLocale } from 'next-intl'
import { getMessages, getTimeZone } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { RootWrapper } from './root-wrapper'

const geist = Geist({ subsets: ['latin'] })

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

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={geist.className}>
        <RootWrapper locale={locale} messages={messages} timeZone={timeZone}>
          {children}
        </RootWrapper>
        <Toaster />
        <SonnerToaster position="top-right" duration={3000} closeButton />
      </body>
    </html>
  )
}

export const metadata: Metadata = { ...rootMetadata }
