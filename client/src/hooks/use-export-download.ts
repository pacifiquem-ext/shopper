'use client'

import { downloadBlob } from '@/lib/download-blob'
import { useCallback, useState } from 'react'

export function useExportDownload() {
  const [isExporting, setIsExporting] = useState(false)

  const download = useCallback(async (fetchBlob: () => Promise<Blob>, filename: string) => {
    if (isExporting) return

    setIsExporting(true)
    try {
      const blob = await fetchBlob()
      downloadBlob(blob, filename)
    } catch {
      // Axios interceptor shows error toasts
    } finally {
      setIsExporting(false)
    }
  }, [isExporting])

  return { isExporting, download }
}
