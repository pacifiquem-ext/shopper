'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
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
import { adminService } from '@/services/admin.service'

type CategoryRow = {
  id: string
  slug?: string
  nameEn?: string
  nameRw?: string
  name?: string
  sortOrder?: number
  isActive?: boolean
  _count?: { attributeDefs?: number; products?: number }
  attributeDefs?: unknown[]
  productCount?: number
  attributeKeys?: string[]
}

export default function AdminCategoriesPage() {
  const t = useTranslations('admin')
  const [rows, setRows] = useState<CategoryRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      try {
        const res = await adminService.getCategories()
        const data = (res as { data?: unknown })?.data ?? res
        if (!cancelled) setRows(Array.isArray(data) ? (data as CategoryRow[]) : [])
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
        <h1 className="text-title-h5 text-text-strong-950">{t('categoriesTitle')}</h1>
        <p className="mt-1 text-paragraph-sm text-text-sub-600">{t('categoriesSubtitle')}</p>
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
        <EmptyState title={t('emptyTable')} />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('catSlug')}</TableHead>
              <TableHead>{t('catNameEn')}</TableHead>
              <TableHead>{t('catNameRw')}</TableHead>
              <TableHead>{t('catAttributes')}</TableHead>
              <TableHead>{t('catStatus')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-semibold">{row.slug ?? '—'}</TableCell>
                <TableCell>{row.nameEn ?? row.name ?? '—'}</TableCell>
                <TableCell>{row.nameRw ?? '—'}</TableCell>
                <TableCell>
                  {row._count?.attributeDefs ??
                    row.attributeDefs?.length ??
                    row.attributeKeys?.length ??
                    0}
                </TableCell>
                <TableCell>
                  {row.isActive === false ? t('inactive') : t('active')}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
