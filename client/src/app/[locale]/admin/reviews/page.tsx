'use client'

import { useCallback, useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import * as Button from '@/components/alignui/button'
import { Card } from '@/components/alignui/card'
import { EmptyState } from '@/components/alignui/empty'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/alignui/table'
import { TurningZeroLoader } from '@/components/ui/turning-zero-loader'
import { adminService, type AdminReviewApi } from '@/services/admin.service'

function unwrapList(res: unknown): AdminReviewApi[] {
  const data = (res as { data?: unknown })?.data ?? res
  if (Array.isArray(data)) return data as AdminReviewApi[]
  if (data && typeof data === 'object' && Array.isArray((data as { data?: unknown }).data)) {
    return (data as { data: AdminReviewApi[] }).data
  }
  return []
}

export default function AdminReviewsPage() {
  const t = useTranslations('admin')
  const [rows, setRows] = useState<AdminReviewApi[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const res = await adminService.getReviews({ status: 'PENDING' })
      setRows(unwrapList(res))
    } catch {
      setError(true)
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const moderate = async (id: string, action: 'approve' | 'reject') => {
    setBusyId(id)
    try {
      if (action === 'approve') await adminService.approveReview(id)
      else await adminService.rejectReview(id)
      toast.success(action === 'approve' ? t('reviewApproved') : t('reviewRejected'))
      await load()
    } catch {
      // interceptor
    } finally {
      setBusyId(null)
    }
  }

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
        <EmptyState title={t('emptyTable')} description={t('reviewsEmptyHint')} />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('colProduct')}</TableHead>
              <TableHead>{t('colRating')}</TableHead>
              <TableHead>{t('colComment')}</TableHead>
              <TableHead>{t('colStatus')}</TableHead>
              <TableHead className="text-right">{t('colActions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell>
                  {row.productName ?? row.product?.name ?? '—'}
                  <span className="mt-0.5 block text-paragraph-xs text-text-sub-600">
                    {row.storeName ?? row.store?.displayName ?? ''}
                  </span>
                </TableCell>
                <TableCell>{row.rating}/5</TableCell>
                <TableCell className="max-w-xs truncate">
                  {row.title ?? row.body ?? row.comment ?? '—'}
                </TableCell>
                <TableCell>{row.status}</TableCell>
                <TableCell className="text-right">
                  <div className="inline-flex gap-2">
                    <Button.Root
                      type="button"
                      size="xsmall"
                      variant="primary"
                      disabled={busyId === row.id}
                      onClick={() => void moderate(row.id, 'approve')}
                    >
                      {t('approve')}
                    </Button.Root>
                    <Button.Root
                      type="button"
                      size="xsmall"
                      variant="error"
                      mode="stroke"
                      disabled={busyId === row.id}
                      onClick={() => void moderate(row.id, 'reject')}
                    >
                      {t('reject')}
                    </Button.Root>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
