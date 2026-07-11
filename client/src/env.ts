import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(['development', 'test', 'production']),
    ANALYZE: z.string().optional(),
    CI: z.string().optional(),
    SKIP_ENV_VALIDATION: z.string().optional(),
    /** Nest target for Next rewrites + RSC (never exposed to the browser). */
    NEXT_INTERNAL_API_URL: z.string().optional(),
    API_PROXY_TARGET: z.string().optional(),
  },
  client: {
    /** Browser API root. Prefer `/backend/v1` locally (Next rewrite). */
    NEXT_PUBLIC_API_URL: z.string().min(1).optional(),
    NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  },
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    ANALYZE: process.env.ANALYZE,
    CI: process.env.CI,
    SKIP_ENV_VALIDATION: process.env.SKIP_ENV_VALIDATION,
    NEXT_INTERNAL_API_URL: process.env.NEXT_INTERNAL_API_URL,
    API_PROXY_TARGET: process.env.API_PROXY_TARGET,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },
  emptyStringAsUndefined: true,
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
})
