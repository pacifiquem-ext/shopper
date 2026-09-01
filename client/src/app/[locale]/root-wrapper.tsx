'use client'

// import { useScan } from 'react-scan'

import { NextIntlClientProvider } from 'next-intl'
import React from 'react'
import { ShopperSignals } from '../../components/shop/shopper-signals'
import { ThemeProvider } from '../../components/theme-provider'

export const RootWrapper = ({
  children,
  locale,
  messages,
  timeZone,
}: {
  children: React.ReactNode
  locale: string
  messages: Record<string, unknown>
  timeZone: string
}) => {
  // uncomment if you  want to use react-scan, this can be annoying sometimes - so by default it's disabled
  //   useScan({ enabled: process.env.NODE_ENV === 'development' })
  return (
    <>
      <ThemeProvider attribute="class" defaultTheme="light" disableTransitionOnChange>
        <NextIntlClientProvider locale={locale} messages={messages} timeZone={timeZone}>
          <ShopperSignals />
          {children}
        </NextIntlClientProvider>
      </ThemeProvider>
    </>
  )
}
