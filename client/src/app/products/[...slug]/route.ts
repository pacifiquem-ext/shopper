function escapeXml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function titleFromSlug(slug: string[]): string {
  const file = slug.join('/').split('/').pop() ?? 'product'
  return file.replace(/\.(jpg|jpeg|png|webp|gif)$/i, '').replace(/-/g, ' ')
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string[] }> },
) {
  const { slug } = await params
  const title = titleFromSlug(slug)
  const safeTitle = escapeXml(title)

  // SVG placeholder (served for /products/*.jpg paths from seeded data)
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f5f3ff"/>
      <stop offset="45%" stop-color="#fff7ed"/>
      <stop offset="100%" stop-color="#ecfeff"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="30%" r="60%">
      <stop offset="0%" stop-color="#7794e7" stop-opacity="0.22"/>
      <stop offset="70%" stop-color="#7794e7" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1024" height="1024" rx="96" fill="url(#bg)"/>
  <rect width="1024" height="1024" rx="96" fill="url(#glow)"/>
  <g opacity="0.08">
    <path d="M140 790 C260 690, 360 720, 460 640 C560 560, 640 540, 884 424" fill="none" stroke="#111827" stroke-width="18"/>
    <path d="M140 688 C280 596, 380 610, 474 544 C580 468, 700 430, 884 334" fill="none" stroke="#111827" stroke-width="12"/>
  </g>
  <g>
    <rect x="92" y="756" width="840" height="148" rx="44" fill="#0b1220" fill-opacity="0.78"/>
    <text x="132" y="836" font-family="ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial" font-size="44" fill="#ffffff" font-weight="650">${safeTitle}</text>
    <text x="132" y="882" font-family="ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial" font-size="22" fill="#e5e7eb" opacity="0.9">Placeholder image (upload real product photos later)</text>
  </g>
  <g opacity="0.16">
    <circle cx="210" cy="230" r="72" fill="#0b1220"/>
    <circle cx="290" cy="202" r="22" fill="#0b1220"/>
    <circle cx="280" cy="268" r="18" fill="#0b1220"/>
  </g>
</svg>`

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      // Cache a bit in dev to reduce spam; safe for placeholders
      'Cache-Control': 'public, max-age=300',
    },
  })
}

