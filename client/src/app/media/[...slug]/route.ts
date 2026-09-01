/**
 * Fallback for leftover local /media/stores and /media/payments seed paths.
 * Store identity and payment context live in the surrounding UI, not on the image.
 */

const STOREFRONTS: Record<string, string> = {
  harvest: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
  northline: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80',
  atelier: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80',
  pharmacy: 'https://images.unsplash.com/photo-1586015555751-63bb77f4322a?auto=format&fit=crop&w=800&q=80',
  beauty: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80',
  sports: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80',
  pantry: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=800&q=80',
}

const DEFAULT_STORE =
  'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80'
const RECEIPT =
  'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=800&q=80'

function storefrontFor(slug: string[]): string {
  const hay = slug.join(' ').toLowerCase()
  for (const [key, url] of Object.entries(STOREFRONTS)) {
    if (hay.includes(key)) return url
  }
  return DEFAULT_STORE
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string[] }> },
) {
  const { slug } = await params
  const kind = slug[0] ?? ''
  const target = kind === 'payments' ? RECEIPT : storefrontFor(slug)
  return Response.redirect(target, 302)
}
