// middleware.ts
import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

export default createMiddleware(routing)

export const config = {
  // Match all pathnames except:
  // - api / backend proxy / trpc / Next internals
  // - static files with a dot (favicon.ico, etc.)
  matcher: '/((?!api|backend|trpc|_next|_vercel|.*\\..*).*)',
}
