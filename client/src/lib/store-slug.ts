const RESERVED_SLUGS = new Set(['www', 'localhost'])

const STORE_SLUG_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function normalizeStoreSlug(value: string | null | undefined): string | null {
  const candidate = value?.trim().toLowerCase()
  if (!candidate || RESERVED_SLUGS.has(candidate)) return null
  return STORE_SLUG_PATTERN.test(candidate) ? candidate : null
}

export function isProductId(value: string): boolean {
  return UUID_PATTERN.test(value)
}
