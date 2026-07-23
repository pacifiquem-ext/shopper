import { getPublicApiBaseUrl } from '@/lib/api-base-url'
import { api } from '@/lib/axios'
import type { ApiResponse } from '@onlineshop/shared'

export type UploadedImage = {
  key: string
  url: string
  mimeType: string
  sizeBytes: number
  width: number
  height: number
}

export const mediaService = {
  async uploadAuthenticated(
    file: File,
    purpose: 'product' | 'logo' | 'proof' | 'general' = 'product',
  ): Promise<UploadedImage> {
    const form = new FormData()
    form.append('file', file)
    const res = (await api.post(`/media/upload?purpose=${purpose}`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })) as ApiResponse<UploadedImage>
    return (res as { data?: UploadedImage }).data ?? (res as unknown as UploadedImage)
  },

  async uploadPublicProof(file: File): Promise<UploadedImage> {
    const root = getPublicApiBaseUrl()
    const form = new FormData()
    form.append('file', file)
    const res = await fetch(`${root}/media/upload/public?purpose=proof`, {
      method: 'POST',
      body: form,
    })
    const body = (await res.json().catch(() => ({}))) as {
      data?: UploadedImage
      message?: string
    }
    if (!res.ok) {
      throw new Error(
        typeof body.message === 'string' ? body.message : `Upload failed (${res.status})`,
      )
    }
    return body.data ?? (body as unknown as UploadedImage)
  },
}
