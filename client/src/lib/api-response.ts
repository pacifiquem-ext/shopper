/**
 * Response helpers — canonical implementation lives in @onlineshop/shared
 * so server envelopes and client unwrapping stay aligned.
 */
export {
  extractApiData as extractApiPayload,
  extractOffsetPageItems as extractPaginatedItems,
  extractEntity,
  isApiSuccessResponse,
  type ApiResponse,
  type ApiSuccessResponse,
  type ApiErrorResponse,
  type OffsetPage,
  type ApiOffsetPageResponse,
} from '@onlineshop/shared'
