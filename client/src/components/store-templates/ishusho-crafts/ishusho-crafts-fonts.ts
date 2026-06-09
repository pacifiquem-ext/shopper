import { Fraunces, Outfit } from 'next/font/google'

export const ishushoCraftsDisplayFont = Fraunces({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-ic-display',
  display: 'swap',
})

export const ishushoCraftsBodyFont = Outfit({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-ic-sans',
  display: 'swap',
})

export const ishushoCraftsFontClassName = `${ishushoCraftsDisplayFont.variable} ${ishushoCraftsBodyFont.variable}`
