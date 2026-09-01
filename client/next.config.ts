import bundleAnalyzer from '@next/bundle-analyzer'
import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin()
const withBundleAnalyzer = bundleAnalyzer({ enabled: process.env.ANALYZE === 'true' })

const nextConfig: NextConfig = {
  transpilePackages: ['@shopper/shared'],

  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    })
    return config
  },

  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },

  typedRoutes: true,

  async rewrites() {
    // Browser → same-origin /backend/* → Nest (avoids local CORS entirely)
    const target = (process.env.API_PROXY_TARGET || 'http://127.0.0.1:3001').replace(
      /\/+$/,
      '',
    )
    return [
      {
        source: '/backend/:path*',
        destination: `${target}/:path*`,
      },
    ]
  },

  eslint: {
    ignoreDuringBuilds: process.env.NODE_ENV === 'production',
  },

  typescript: {
    ignoreBuildErrors: process.env.NODE_ENV === 'production',
  },

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.dummyjson.com' },
      { protocol: 'https', hostname: 'fakestoreapi.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'picsum.photos' },
    ],
  },
}

export default withBundleAnalyzer(withNextIntl(nextConfig))
