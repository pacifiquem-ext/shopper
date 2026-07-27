import type { Metadata } from 'next'

export const rootMetadata: Metadata = {
  title: {
    default: 'Shopper',
    template: '%s | Shopper',
  },
  description:
    'Discover products from trusted local stores in Rwanda. Launch your storefront, manage orders, and grow on Shopper.',
  keywords: ['Shopper', 'Rwanda', 'ecommerce', 'marketplace', 'local stores'],
  authors: [{ name: 'Shopper' }],
  creator: 'Shopper',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://github.com/pacifiquem-ext/shopper',
    title: 'Shopper',
    description:
      'Discover products from trusted local stores in Rwanda. Launch your storefront, manage orders, and grow.',
    siteName: 'Shopper',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shopper',
    description:
      'Discover products from trusted local stores in Rwanda. Launch your storefront, manage orders, and grow.',
    creator: '@shopper',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}
