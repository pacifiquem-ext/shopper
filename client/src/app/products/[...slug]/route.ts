/**
 * Fallback for leftover local /products/*.jpg seed paths.
 * Redirects to a real catalog photo so the marketplace never shows
 * the old labeled SVG placeholders.
 */

const DJ = 'https://cdn.dummyjson.com/product-images'

const HINTS: Array<{ keys: string[]; url: string }> = [
  { keys: ['coffee', 'bean', 'nescafe'], url: `${DJ}/groceries/nescafe-coffee/1.webp` },
  { keys: ['rice'], url: `${DJ}/groceries/rice/1.webp` },
  { keys: ['honey'], url: `${DJ}/groceries/honey-jar/1.webp` },
  { keys: ['oil', 'palm'], url: `${DJ}/groceries/cooking-oil/1.webp` },
  { keys: ['pepper', 'chili', 'spice', 'jollof'], url: `${DJ}/groceries/green-chili-pepper/1.webp` },
  { keys: ['headphone', 'airpod', 'audio'], url: `${DJ}/mobile-accessories/apple-airpods-max-silver/1.webp` },
  { keys: ['charger'], url: `${DJ}/mobile-accessories/apple-iphone-charger/1.webp` },
  { keys: ['phone'], url: `${DJ}/smartphones/iphone-5s/1.webp` },
  { keys: ['tee', 'tshirt', 'shirt'], url: `${DJ}/mens-shirts/gigabyte-aorus-men-tshirt/1.webp` },
  { keys: ['wallet', 'leather'], url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=900&q=80' },
  { keys: ['speaker'], url: `${DJ}/mobile-accessories/amazon-echo-plus/1.webp` },
  { keys: ['dress'], url: `${DJ}/tops/gray-dress/1.webp` },
  { keys: ['shoe', 'slip', 'sneaker'], url: `${DJ}/mens-shoes/puma-future-rider-trainers/1.webp` },
  { keys: ['shea', 'beauty', 'butter'], url: `${DJ}/skin-care/olay-ultra-moisture-shea-butter-body-wash/1.webp` },
  { keys: ['table'], url: `${DJ}/furniture/bedside-table-african-cherry/1.webp` },
  { keys: ['vase', 'pot'], url: `${DJ}/home-decoration/plant-pot/1.webp` },
  { keys: ['bag', 'tote'], url: `${DJ}/womens-bags/blue-women's-handbag/1.webp` },
  { keys: ['yoga', 'mat', 'block'], url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=900&q=80' },
  { keys: ['vitamin', 'thermo', 'aid'], url: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=900&q=80' },
]

function resolveUrl(slug: string[]): string {
  const hay = slug.join(' ').toLowerCase()
  for (const hint of HINTS) {
    if (hint.keys.some((key) => hay.includes(key))) return hint.url
  }
  const seed = slug.join('-').replace(/\.(jpg|jpeg|png|webp|gif)$/i, '') || 'product'
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/900/1100`
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string[] }> },
) {
  const { slug } = await params
  return Response.redirect(resolveUrl(slug), 302)
}
