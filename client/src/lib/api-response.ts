/** Unwrap NestJS API envelope after axios returns `response.data`. */
export function extractApiPayload<T>(res: unknown): T | null {
  if (res == null || typeof res !== 'object') return null
  const record = res as Record<string, unknown>
  if ('data' in record) return record.data as T
  return res as T
}

/** Paginated list: `{ data: T[] }` or envelope `{ data: { data: T[] } }`. */
export function extractPaginatedItems<T>(res: unknown): T[] {
  const payload = extractApiPayload<unknown>(res)
  if (Array.isArray(payload)) return payload as T[]
  if (payload && typeof payload === 'object' && Array.isArray((payload as { data?: unknown }).data)) {
    return (payload as { data: T[] }).data
  }
  return []
}

/** Single entity: envelope or nested `{ data: entity }`. */
export function extractEntity<T>(res: unknown): T | null {
  const payload = extractApiPayload<unknown>(res)
  if (payload == null) return null
  if (typeof payload === 'object' && 'data' in (payload as object) && !Array.isArray(payload)) {
    return ((payload as { data?: T }).data ?? null) as T | null
  }
  return payload as T
}
