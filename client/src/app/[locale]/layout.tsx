import { Toaster } from '@/components/ui/toaster'

import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import type React from 'react'
import '../../styles/globals.css'

import { rootMetadata } from '#/config/root-metadata'
import { routing } from '@/i18n/routing'
import { hasLocale } from 'next-intl'
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

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={geist.className}>
        <RootWrapper locale={locale}>{children}</RootWrapper>
        <Toaster />
      </body>
    </html>
  )
}

export const metadata: Metadata = { ...rootMetadata }
