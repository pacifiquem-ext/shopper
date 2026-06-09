import { Link } from '@/i18n/navigation'
import { MERCHANT_ONBOARDING_PATH, withReturnUrl } from '@/lib/auth-return-url'
import { cn } from '@/lib/utils'
import { User } from 'lucide-react'
import React from 'react'

interface AuthCardProps {
  children: React.ReactNode
  activeTab: 'login' | 'signup' | 'forgot-password' | 'reset-password'
  returnUrl?: string | null
}

export function AuthCard({ children, activeTab, returnUrl }: AuthCardProps) {
  const loginHref = withReturnUrl('/login', returnUrl)
  const signupHref = withReturnUrl('/signup', returnUrl ?? MERCHANT_ONBOARDING_PATH)
  return (
    <div className="bg-brand-800 relative flex min-h-[550px] w-full max-w-[950px] flex-col overflow-hidden rounded-[2rem] shadow-2xl md:flex-row">
      <div className="bg-brand-500 relative hidden w-[40%] overflow-hidden md:block">
        <div className="bg-brand-600 absolute top-0 left-0 h-[150%] w-[150%] origin-top-left -translate-x-10 translate-y-10 -rotate-45 shadow-xl" />
        <div className="bg-brand-700 absolute top-0 left-0 h-[150%] w-[150%] origin-top-left -translate-x-20 translate-y-40 -rotate-45 shadow-xl" />
        <div className="bg-brand-800 absolute top-0 left-0 h-[150%] w-[150%] origin-top-left -translate-x-30 translate-y-72 -rotate-45 shadow-xl" />

        <div className="absolute inset-y-0 right-0 z-20 flex w-40 flex-col justify-center space-y-6">
          {(activeTab === 'login' || activeTab === 'signup') && (
            <>
              <Link
                href={loginHref}
                className={cn(
                  'group relative flex w-full items-center justify-end rounded-l-full py-4 pr-8 text-sm font-bold tracking-wider transition-all duration-300',
                  activeTab === 'login'
                    ? 'text-foreground dark:bg-card bg-white shadow-[-10px_0_20px_-5px_rgba(0,0,0,0.1)]'
                    : 'text-white/70 hover:text-white'
                )}
              >
                Log In
                {activeTab === 'login' && (
                  <>
                    <div className="absolute -top-4 right-0 h-4 w-4 rounded-br-full bg-transparent shadow-[10px_10px_0_10px_white] dark:shadow-[10px_10px_0_10px_var(--card)]" />
                    <div className="absolute right-0 -bottom-4 h-4 w-4 rounded-tr-full bg-transparent shadow-[10px_-10px_0_10px_white] dark:shadow-[10px_-10px_0_10px_var(--card)]" />
                  </>
                )}
              </Link>

              <Link
                href={signupHref}
                className={cn(
                  'group relative flex w-full items-center justify-end rounded-l-full py-4 pr-8 text-sm font-bold tracking-wider transition-all duration-300',
                  activeTab === 'signup'
                    ? 'text-foreground dark:bg-card bg-white shadow-[-10px_0_20px_-5px_rgba(0,0,0,0.1)]'
                    : 'text-white/70 hover:text-white'
                )}
              >
                Sign Up
                {activeTab === 'signup' && (
                  <>
                    <div className="absolute -top-4 right-0 h-4 w-4 rounded-br-full bg-transparent shadow-[10px_10px_0_10px_white] dark:shadow-[10px_10px_0_10px_var(--card)]" />
                    <div className="absolute right-0 -bottom-4 h-4 w-4 rounded-tr-full bg-transparent shadow-[10px_-10px_0_10px_white] dark:shadow-[10px_-10px_0_10px_var(--card)]" />
                  </>
                )}
              </Link>
            </>
          )}

          {activeTab === 'forgot-password' && (
            <div
              className={cn(
                'group relative flex w-full items-center justify-end rounded-l-full py-4 pr-6 text-right text-sm leading-tight font-bold tracking-wider transition-all duration-300',
                'text-foreground dark:bg-card bg-white shadow-[-10px_0_20px_-5px_rgba(0,0,0,0.1)]'
              )}
            >
              Forgot
              <br />
              Password
              <div className="absolute -top-4 right-0 h-4 w-4 rounded-br-full bg-transparent shadow-[10px_10px_0_10px_white] dark:shadow-[10px_10px_0_10px_var(--card)]" />
              <div className="absolute right-0 -bottom-4 h-4 w-4 rounded-tr-full bg-transparent shadow-[10px_-10px_0_10px_white] dark:shadow-[10px_-10px_0_10px_var(--card)]" />
            </div>
          )}

          {activeTab === 'reset-password' && (
            <div
              className={cn(
                'group relative flex w-full items-center justify-end rounded-l-full py-4 pr-6 text-right text-sm leading-tight font-bold tracking-wider transition-all duration-300',
                'text-foreground dark:bg-card bg-white shadow-[-10px_0_20px_-5px_rgba(0,0,0,0.1)]'
              )}
            >
              Reset
              <br />
              Password
              <div className="absolute -top-4 right-0 h-4 w-4 rounded-br-full bg-transparent shadow-[10px_10px_0_10px_white] dark:shadow-[10px_10px_0_10px_var(--card)]" />
              <div className="absolute right-0 -bottom-4 h-4 w-4 rounded-tr-full bg-transparent shadow-[10px_-10px_0_10px_white] dark:shadow-[10px_-10px_0_10px_var(--card)]" />
            </div>
          )}
        </div>
      </div>

      <div className="dark:bg-card relative z-10 flex w-full flex-col items-center justify-center bg-white p-8 md:w-[60%] md:p-12 lg:p-16">
        <div className="mb-8 flex w-full justify-center space-x-4 md:hidden">
          {(activeTab === 'login' || activeTab === 'signup') && (
            <>
              <Link
                href={loginHref}
                className={cn(
                  'rounded-full px-6 py-2 text-sm font-bold tracking-wider transition-colors',
                  activeTab === 'login'
                    ? 'bg-brand-700 text-white'
                    : 'bg-brand-50 text-brand-700 hover:text-brand-800 dark:bg-brand-900/30'
                )}
              >
                Log in
              </Link>
              <Link
                href={signupHref}
                className={cn(
                  'rounded-full px-6 py-2 text-sm font-bold tracking-wider transition-colors',
                  activeTab === 'signup'
                    ? 'bg-brand-700 text-white'
                    : 'bg-brand-50 text-brand-700 hover:text-brand-800 dark:bg-brand-900/30'
                )}
              >
                Sign Up
              </Link>
            </>
          )}

          {activeTab === 'forgot-password' && (
            <div className="bg-brand-700 rounded-full px-6 py-2 text-sm font-bold tracking-wider text-white">
              Forgot Password
            </div>
          )}

          {activeTab === 'reset-password' && (
            <div className="bg-brand-700 rounded-full px-6 py-2 text-sm font-bold tracking-wider text-white">
              Reset Password
            </div>
          )}
        </div>

        {(activeTab === 'login' || activeTab === 'signup') && (
          <div className="mb-8 flex flex-col items-center space-y-4">
            <div className="from-brand-500 to-brand-700 flex h-20 w-20 items-center justify-center rounded-full bg-linear-to-br text-white shadow-lg">
              <User size={40} className="drop-shadow-sm" />
            </div>
            <h2 className="text-brand-800 dark:text-brand-400 text-center text-2xl font-bold tracking-widest uppercase">
              {activeTab === 'login' && 'Login'}
              {activeTab === 'signup' && 'Sign Up'}
            </h2>
          </div>
        )}

        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  )
}
