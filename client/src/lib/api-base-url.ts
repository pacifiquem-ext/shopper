/**
 * Resolve Nest API root (must include `/v1`).
 *
 * Local default: same-origin Next rewrite `/backend/v1` → Nest `:3001/v1`
 * so the browser never hits CORS. RSC uses absolute `NEXT_INTERNAL_API_URL`.
 */
const DEFAULT_PUBLIC = '/backend/v1'
const DEFAULT_INTERNAL = 'http://127.0.0.1:3001/v1'

function ensureV1(raw: string): string {
  const trimmed = raw.trim().replace(/\/+$/, '')
  if (!trimmed) return DEFAULT_PUBLIC
  if (/\/v\d+$/i.test(trimmed)) return trimmed
  return `${trimmed}/v1`
}

export function getPublicApiBaseUrl(): string {
  return ensureV1(process.env.NEXT_PUBLIC_API_URL || DEFAULT_PUBLIC)
}

/** Absolute base for Server Components / Route Handlers talking to Nest. */
export function getInternalApiBaseUrl(): string {
  const internal = process.env.NEXT_INTERNAL_API_URL?.trim()
  if (internal) return ensureV1(internal)

  const pub = process.env.NEXT_PUBLIC_API_URL?.trim()
  // Relative public URL cannot be used from Node RSC — fall back to local Nest.
  if (!pub || pub.startsWith('/')) return DEFAULT_INTERNAL
  return ensureV1(pub)
}

export function resolveApiBaseUrl(forServer: boolean): string {
  return forServer ? getInternalApiBaseUrl() : getPublicApiBaseUrl()
}
