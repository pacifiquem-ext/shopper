import type { Metadata } from 'next'

export const rootMetadata: Metadata = {
  title: {
    default: 'OnlineShop.rw',
    template: '%s | OnlineShop.rw',
  },
  description:
    'Discover products from trusted local stores in Rwanda. Launch your storefront, manage orders, and grow on OnlineShop.rw.',
  keywords: ['OnlineShop.rw', 'Rwanda', 'ecommerce', 'marketplace', 'local stores'],
  authors: [{ name: 'OnlineShop.rw' }],
  creator: 'OnlineShop.rw',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://onlineshop.rw',
    title: 'OnlineShop.rw',
    description:
      'Discover products from trusted local stores in Rwanda. Launch your storefront, manage orders, and grow.',
    siteName: 'OnlineShop.rw',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OnlineShop.rw',
    description:
      'Discover products from trusted local stores in Rwanda. Launch your storefront, manage orders, and grow.',
    creator: '@onlineshoprw',
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
