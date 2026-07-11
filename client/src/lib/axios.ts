import React from 'react'
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { toast } from 'sonner'
import { MERCHANT_ONBOARDING_PATH } from '@/lib/auth-return-url'
import { useAuthStore } from '@/store/auth.store'
import { getPublicApiBaseUrl } from '@/lib/api-base-url'

export const api = axios.create({
  baseURL: getPublicApiBaseUrl(),
  timeout: 100000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Track in-flight refresh to prevent parallel refresh storms
let isRefreshing = false
let refreshQueue: Array<(token: string | null) => void> = []

function drainQueue(token: string | null) {
  refreshQueue.forEach((cb) => cb(token))
  refreshQueue = []
}

function isStoreOnboardingPage(): boolean {
  if (typeof window === 'undefined') return false
  return /\/store(\/|\?|$)/.test(window.location.pathname)
}

function isSilentOnboardingRequest(url?: string): boolean {
  if (!url) return false
  return (
    url.includes('/onboarding/check-subdomain') || url.includes('/onboarding/draft')
  )
}

function isDashboardPage(): boolean {
  if (typeof window === 'undefined') return false
  return /\/dashboard(\/|$)/.test(window.location.pathname)
}

let redirectingToOnboarding = false
let authHydrationPromise: Promise<void> | null = null
let lastNetworkErrorToastAt = 0

const PUBLIC_API_PREFIXES = [
  '/auth/login',
  '/auth/signup',
  '/auth/verify',
  '/auth/refresh',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/catalog/',
  '/onboarding/check-subdomain',
]

function isPublicApiRequest(url?: string): boolean {
  if (!url) return false
  return PUBLIC_API_PREFIXES.some((prefix) => url.includes(prefix))
}

function waitForAuthHydration(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve()
  if (useAuthStore.persist.hasHydrated()) return Promise.resolve()

  if (!authHydrationPromise) {
    authHydrationPromise = new Promise((resolve) => {
      useAuthStore.persist.onFinishHydration(() => resolve())
    })
  }

  return authHydrationPromise
}

function redirectToStoreOnboarding(): void {
  if (typeof window === 'undefined' || isStoreOnboardingPage() || redirectingToOnboarding) return
  redirectingToOnboarding = true
  const locale = window.location.pathname.split('/')[1] || 'en'
  window.location.href = `/${locale}${MERCHANT_ONBOARDING_PATH}`
}

async function doRefresh(): Promise<string | null> {
  const { refreshToken, logout } = useAuthStore.getState()
  if (!refreshToken) return null
  try {
    const res = await axios.post(
      `${api.defaults.baseURL}/auth/refresh`,
      { refreshToken },
      { headers: { 'Content-Type': 'application/json' } },
    )
    const newToken: string | undefined =
      res.data?.data?.accessToken ?? res.data?.accessToken
    if (!newToken) return null
    useAuthStore.setState({ accessToken: newToken })
    return newToken
  } catch {
    logout()
    return null
  }
}

api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined' && !isPublicApiRequest(config.url)) {
      await waitForAuthHydration()
    }

    const { accessToken } = useAuthStore.getState()
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }
    return config
  },
  (error: Error) => Promise.reject(error),
)

api.interceptors.response.use(
  (response) => {
    return response.data
  },
  async (error: any) => {
    const originalRequest = error.config

    // Attempt token refresh once on 401, but not for the refresh endpoint itself
    if (
      error.response?.status === 401 &&
      !originalRequest._retried &&
      !originalRequest.url?.includes('/auth/refresh') &&
      !isSilentOnboardingRequest(originalRequest.url)
    ) {
      originalRequest._retried = true

      if (isRefreshing) {
        // Queue this request until the in-flight refresh completes
        return new Promise((resolve, reject) => {
          refreshQueue.push((token) => {
            if (!token) return reject(error)
            originalRequest.headers.Authorization = `Bearer ${token}`
            resolve(api(originalRequest))
          })
        })
      }

      isRefreshing = true
      const newToken = await doRefresh()
      isRefreshing = false
      drainQueue(newToken)

      if (newToken) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return api(originalRequest)
      }

      // Refresh failed — redirect to login (never interrupt the store onboarding wizard)
      if (typeof window !== 'undefined' && !isStoreOnboardingPage()) {
        const locale = window.location.pathname.split('/')[1] || 'en'
        window.location.href = `/${locale}/login`
      }
      return Promise.reject(error)
    }

    // Suppress error toasts for requests that were retried (avoids double-toast)
    if (originalRequest?._retried && error.response?.status === 401) {
      return Promise.reject(error)
    }

    if (
      error.response?.status === 401 &&
      isStoreOnboardingPage() &&
      isSilentOnboardingRequest(originalRequest?.url)
    ) {
      return Promise.reject(error)
    }

    // No response — server unreachable, CORS, or request aborted (e.g. page navigation)
    if (!error.response) {
      const isCancelled =
        error.code === 'ERR_CANCELED' ||
        error.name === 'CanceledError' ||
        error.message === 'canceled'

      if (isCancelled) {
        return Promise.reject(error)
      }

      const isNetwork =
        error.code === 'ERR_NETWORK' ||
        error.message === 'Network Error' ||
        error.message === 'Failed to fetch'

      const now = Date.now()
      if (isNetwork && !error.config?._retried && now - lastNetworkErrorToastAt > 5000) {
        lastNetworkErrorToastAt = now
        toast.error('Cannot connect to API server', {
          description:
            'Ensure the API is running (`pnpm dev` from the repo root). Local browser calls go to /backend/v1 (Next rewrite → Nest :3001).',
        })
      }

      return Promise.reject(error)
    }

    const errorData = error.response?.data
    const status = error.response?.status

    let title = 'An unexpected error occurred'
    if (status) {
      if (status >= 200 && status < 300) title = 'Success'
      else if (status === 400) title = 'Bad Request'
      else if (status === 401) title = 'Unauthorized'
      else if (status === 403) title = 'Forbidden'
      else if (status === 404) title = 'Not Found'
      else if (status === 409) title = 'Data Conflict'
      else if (status >= 500) title = 'Server Error'
    }

    let errorsList: string[] = []
    let descriptionMessage = ''

    if (errorData) {
      if (typeof errorData.message === 'string') {
        descriptionMessage = errorData.message
      } else if (Array.isArray(errorData.message) && errorData.message.length > 0) {
        errorsList = errorData.message
      }
      if (Array.isArray(errorData.error) && errorData.error.length > 0) {
        errorsList = errorData.error
      }
    } else if (error.message) {
      descriptionMessage = error.message
    }

    const needsStoreOnboarding =
      status === 403 &&
      isDashboardPage() &&
      typeof descriptionMessage === 'string' &&
      descriptionMessage.toLowerCase().includes('store onboarding')

    if (needsStoreOnboarding) {
      toast.error('Complete store setup', {
        description: 'Finish onboarding to use the dashboard.',
      })
      redirectToStoreOnboarding()
      return Promise.reject(error)
    }

    if (errorsList.length > 0) {
      toast.error(title, {
        description: React.createElement(
          'ul',
          { className: 'list-disc pl-4 mt-1 space-y-1 text-sm text-[inherit]' },
          errorsList.map((err, i) => React.createElement('li', { key: i }, err)),
        ),
      })
    } else {
      toast.error(title, { description: descriptionMessage || undefined })
    }

    return Promise.reject(error)
  },
)
