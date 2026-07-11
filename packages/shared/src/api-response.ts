/**
 * Canonical NestJS HTTP envelope produced by ResponseInterceptor.
 * Client axios interceptor returns `response.data`, which is this shape.
 */
export interface ApiSuccessResponse<T = unknown> {
  statusCode: number
  message: string
  timestamp: string
  data: T
}

/** Alias used across the client service layer. */
export type ApiResponse<T = unknown> = ApiSuccessResponse<T>

export interface ApiErrorResponse {
  statusCode: number
  message: string
  timestamp: string
  error?: string | string[] | Record<string, unknown>
}

/**
 * Offset pagination payload nested under `data` for list endpoints
 * (products, orders, payments, inventory, admin stores).
 */
export interface OffsetPage<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export type ApiOffsetPageResponse<T> = ApiSuccessResponse<OffsetPage<T>>

/** Optional metadata-style pagination (reserved; prefer OffsetPage for v1 lists). */
export interface PaginationMetadata {
  currentPage: number
  itemsPerPage: number
  totalItems: number
  totalPages: number
}

export interface ItemsPage<T> {
  items: T[]
  metadata: PaginationMetadata
}

export type ApiItemsPageResponse<T> = ApiSuccessResponse<ItemsPage<T>>

export function isApiSuccessResponse<T = unknown>(
  value: unknown,
): value is ApiSuccessResponse<T> {
  if (value == null || typeof value !== 'object') return false
  const v = value as Record<string, unknown>
  return (
    typeof v.statusCode === 'number' &&
    typeof v.message === 'string' &&
    typeof v.timestamp === 'string' &&
    'data' in v
  )
}

/** Unwrap Nest envelope (or pass-through if already unwrapped). */
export function extractApiData<T>(res: unknown): T | null {
  if (res == null) return null
  if (isApiSuccessResponse<T>(res)) return res.data as T
  return res as T
}

/** Paginated list: envelope → OffsetPage → items array. */
export function extractOffsetPageItems<T>(res: unknown): T[] {
  const payload = extractApiData<unknown>(res)
  if (Array.isArray(payload)) return payload as T[]
  if (
    payload &&
    typeof payload === 'object' &&
    Array.isArray((payload as OffsetPage<T>).data)
  ) {
    return (payload as OffsetPage<T>).data
  }
  if (
    payload &&
    typeof payload === 'object' &&
    Array.isArray((payload as ItemsPage<T>).items)
  ) {
    return (payload as ItemsPage<T>).items
  }
  return []
}

/** Single entity: envelope or nested `{ data: entity }`. */
export function extractEntity<T>(res: unknown): T | null {
  const payload = extractApiData<unknown>(res)
  if (payload == null) return null
  if (
    typeof payload === 'object' &&
    !Array.isArray(payload) &&
    'data' in (payload as object) &&
    !('statusCode' in (payload as object))
  ) {
    return ((payload as { data?: T }).data ?? null) as T | null
  }
  return payload as T
}
