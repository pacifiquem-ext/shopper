import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(['development', 'test', 'production']),
    DATABASE_URL: z.string().url(),
    ANALYZE: z.string().optional(),
    CI: z.string().optional(),
    SKIP_ENV_VALIDATION: z.string().optional(),
  },
  client: {
    NEXT_PUBLIC_API_URL: z.string().url().optional(),
  },
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL,
    ANALYZE: process.env.ANALYZE,
    CI: process.env.CI,
    SKIP_ENV_VALIDATION: process.env.SKIP_ENV_VALIDATION,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
})
