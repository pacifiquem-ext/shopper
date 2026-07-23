'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Card } from '@/components/alignui/card'
import { TurningZeroLoader } from '@/components/ui/turning-zero-loader'
import { adminService } from '@/services/admin.service'

export default function AdminReviewsPage() {
  const t = useTranslations('admin')
  const [rows, setRows] = useState<Array<Record<string, unknown>>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      try {
        const res = await adminService.getReviews()
        const data = (res as { data?: unknown })?.data ?? res
        if (!cancelled) setRows(Array.isArray(data) ? (data as Array<Record<string, unknown>>) : [])
      } catch {
        if (!cancelled) setError(true)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <div>
        <h1 className="text-title-h5 text-text-strong-950">{t('reviewsTitle')}</h1>
        <p className="mt-1 text-paragraph-sm text-text-sub-600">{t('reviewsSubtitle')}</p>
      </div>
      {loading ? (
        <div className="flex justify-center py-16">
          <TurningZeroLoader />
        </div>
      ) : error ? (
        <Card className="p-6">
          <p className="text-paragraph-sm text-text-sub-600">{t('tableUnavailable')}</p>
        </Card>
      ) : rows.length === 0 ? (
        <p className="text-center text-text-sub-600">{t('emptyTable')}</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-stroke-soft-200 bg-bg-white-0">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-stroke-soft-200 bg-bg-weak-50 text-text-sub-600">
              <tr>
                {Object.keys(rows[0] ?? {})
                  .slice(0, 6)
                  .map((key) => (
                    <th key={key} className="px-4 py-3 font-medium">
                      {key}
                    </th>
                  ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={String(row.id ?? i)} className="border-b border-stroke-soft-200 last:border-0">
                  {Object.keys(rows[0] ?? {})
                    .slice(0, 6)
                    .map((key) => (
                      <td key={key} className="px-4 py-3 text-text-strong-950">
                        {String(row[key] ?? '—')}
                      </td>
                    ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
