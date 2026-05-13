const RESERVED_FIRST_PART = new Set(['www', 'localhost'])

const SUBDOMAIN_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function normalizeStoreSubdomain(value: string | null | undefined): string | null {
  const candidate = value?.trim().toLowerCase()
  if (!candidate || RESERVED_FIRST_PART.has(candidate)) return null
  return SUBDOMAIN_PATTERN.test(candidate) ? candidate : null
}

export function isProductId(value: string): boolean {
  return UUID_PATTERN.test(value)
}

/**
 * Extract a store subdomain from an HTTP `Host` header.
 *
 * Returns `null` for:
 * - missing/empty host
 * - raw IPv4/IPv6 hosts (`127.0.0.1`, `[::1]`)
 * - apex hosts (`onlineshop.rw`, `localhost:3000`)
 * - reserved first parts (`www`, `localhost`)
 *
 * Mirrors the logic in `server/src/common/tenant/tenant.middleware.ts` so the
 * frontend resolves the same tenant the backend would.
 */
export function extractSubdomain(host: string | null | undefined): string | null {
  if (!host) return null

  const hostWithoutPort = host.split(':')[0]
  if (!hostWithoutPort) return null

  const isIpv4 = /^\d{1,3}(\.\d{1,3}){3}$/.test(hostWithoutPort)
  if (isIpv4) return null

  const isIpv6 = hostWithoutPort.startsWith('[') || hostWithoutPort.includes(':')
  if (isIpv6) return null

  const parts = hostWithoutPort.split('.').filter(Boolean)
  if (parts.length === 0) return null

  const candidate = normalizeStoreSubdomain(parts[0])
  if (!candidate) return null

  // Multi-segment apex (e.g. `kigalifashion.onlineshop.rw`)
  if (parts.length > 2) {
    return candidate
  }

  // Two-segment localhost (e.g. `kigalifashion.localhost`)
  if (parts.length === 2 && parts[1].toLowerCase() === 'localhost') {
    return candidate
  }

  return null
}
