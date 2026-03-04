import React from 'react'
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { toast } from 'sonner'
import { useAuthStore } from '@/store/auth.store'

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const { accessToken } = useAuthStore.getState()

    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }
    return config
  },
  (error: Error) => {
    return Promise.reject(error)
  }
)

api.interceptors.response.use(
  (response) => {
    if (
      response.config.method &&
      ['post', 'put', 'patch', 'delete'].includes(response.config.method.toLowerCase())
    ) {
      // Backend generic wrapper has `.message` ("Created"), but our custom payload is inside `.data.message`
      const nestedMessage = response.data?.data?.message
      const rootMessage = response.data?.message

      const messageToDisplay = nestedMessage || rootMessage

      // Avoid showing generic HTTP messages if possible, but show if it's the only one
      if (messageToDisplay && messageToDisplay !== 'Created') {
        toast.success(messageToDisplay)
      } else if (nestedMessage) {
        toast.success(nestedMessage)
      }
    }
    return response.data
  },
  (error: any) => {
    // Safely extract backend error data
    const errorData = error.response?.data
    const status = error.response?.status

    // Map HTTP Status to standardized Title
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

      // If backend explicitly passes an array of validation errors
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
          errorsList.map((err, i) => React.createElement('li', { key: i }, err))
        ),
      })
    } else {
      toast.error(title, {
        description: descriptionMessage || undefined,
      })
    }

    if (error.response?.status === 401) {
      useAuthStore.getState().logout()
    }

    return Promise.reject(error)
  }
)
