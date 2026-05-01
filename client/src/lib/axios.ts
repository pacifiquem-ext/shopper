import React from 'react'
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { toast } from 'sonner'
import { useAuthStore } from '@/store/auth.store'

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/v1',
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
  (config: InternalAxiosRequestConfig) => {
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
    if (
      response.config.method &&
      ['post', 'put', 'patch', 'delete'].includes(response.config.method.toLowerCase())
    ) {
      const nestedMessage = response.data?.data?.message
      const rootMessage = response.data?.message
      const messageToDisplay = nestedMessage || rootMessage
      if (messageToDisplay && messageToDisplay !== 'Created') {
        toast.success(messageToDisplay)
      } else if (nestedMessage) {
        toast.success(nestedMessage)
      }
    }
    return response.data
  },
  async (error: any) => {
    const originalRequest = error.config

    // Attempt token refresh once on 401, but not for the refresh endpoint itself
    if (
      error.response?.status === 401 &&
      !originalRequest._retried &&
      !originalRequest.url?.includes('/auth/refresh')
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

      // Refresh failed — redirect to login
      if (typeof window !== 'undefined') {
        const locale = window.location.pathname.split('/')[1] || 'en'
        window.location.href = `/${locale}/login`
      }
      return Promise.reject(error)
    }

    // Suppress error toasts for requests that were retried (avoids double-toast)
    if (originalRequest?._retried && error.response?.status === 401) {
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
