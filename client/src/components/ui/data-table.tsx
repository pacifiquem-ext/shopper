'use client'

import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import * as React from 'react'

type RowId = string | number

export type DataTableColumn<T> = {
  id: string
  header: React.ReactNode
  cell: (row: T) => React.ReactNode
  className?: string
  headerClassName?: string
}

type DataTableProps<T> = {
  data: T[]
  columns: DataTableColumn<T>[]
  getRowId: (row: T) => RowId
  enableSelection?: boolean
  defaultSelectedIds?: RowId[]
  onSelectionChange?: (selectedIds: RowId[], selectedRows: T[]) => void
  emptyState?: React.ReactNode
  enablePagination?: boolean
  defaultPageSize?: number
  pageSizeOptions?: number[]
  className?: string
}

export function DataTable<T>({
  data,
  columns,
  getRowId,
  enableSelection = false,
  defaultSelectedIds,
  onSelectionChange,
  emptyState,
  enablePagination = false,
  defaultPageSize = 10,
  pageSizeOptions = [10, 20, 50],
  className,
}: DataTableProps<T>) {
  const t = useTranslations('common')
  
  const [selected, setSelected] = React.useState<Set<RowId>>(
    () => new Set(defaultSelectedIds ?? [])
  )

  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(defaultPageSize)

  React.useEffect(() => {
    setPage(1)
  }, [pageSize])

  const rowsById = React.useMemo(() => {
    const map = new Map<RowId, T>()
    for (const row of data) {
      map.set(getRowId(row), row)
    }
    return map
  }, [data, getRowId])

  const selectedIds = React.useMemo(() => Array.from(selected), [selected])

  React.useEffect(() => {
    if (!onSelectionChange) return
    const selectedRows: T[] = []
    for (const id of selectedIds) {
      const row = rowsById.get(id)
      if (row) selectedRows.push(row)
    }
    onSelectionChange(selectedIds, selectedRows)
  }, [onSelectionChange, rowsById, selectedIds])

  const allIds = React.useMemo(() => data.map(getRowId), [data, getRowId])
  const allSelected = enableSelection && allIds.length > 0 && allIds.every((id) => selected.has(id))
  const someSelected = enableSelection && selected.size > 0 && !allSelected

  const toggleAll = (checked: boolean) => {
    if (!enableSelection) return
    if (!checked) {
      setSelected(new Set())
      return
    }
    setSelected(new Set(allIds))
  }

  const toggleOne = (id: RowId, checked: boolean) => {
    if (!enableSelection) return
    setSelected((prev) => {
      const next = new Set(prev)
      if (checked) next.add(id)
      else next.delete(id)
      return next
    })
  }

  const total = data.length
  const totalPages = enablePagination ? Math.max(1, Math.ceil(total / pageSize)) : 1
  const safePage = enablePagination ? Math.min(page, totalPages) : 1
  const startIndex = enablePagination ? (safePage - 1) * pageSize : 0
  const endIndex = enablePagination ? Math.min(startIndex + pageSize, total) : total
  const pageData = enablePagination ? data.slice(startIndex, endIndex) : data

  const canPrev = enablePagination && safePage > 1
  const canNext = enablePagination && safePage < totalPages

  const showingText = t('table.showing', {
    from: total === 0 ? 0 : startIndex + 1,
    to: endIndex,
    total,
  })

  return (
    <div className={cn('w-full', className)}>
      <Table>
        <TableHeader>
          <TableRow className="bg-white hover:bg-white">
            {enableSelection && (
              <TableHead className="w-[44px] px-3">
                <Checkbox
                  checked={allSelected ? true : someSelected ? 'indeterminate' : false}
                  onCheckedChange={(v) => toggleAll(Boolean(v))}
                  className="border-gray-300"
                />
              </TableHead>
            )}
            {columns.map((col) => (
              <TableHead
                key={col.id}
                className={cn('h-11 text-xs font-semibold text-gray-500', col.headerClassName)}
              >
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {pageData.length === 0 ? (
            <TableRow className="hover:bg-white">
              <TableCell
                colSpan={columns.length + (enableSelection ? 1 : 0)}
                className="py-14 text-center text-sm text-gray-500"
              >
                {emptyState ?? null}
              </TableCell>
            </TableRow>
          ) : (
            pageData.map((row) => {
              const id = getRowId(row)
              const isSelected = selected.has(id)

              return (
                <TableRow
                  key={String(id)}
                  data-state={isSelected ? 'selected' : undefined}
                  className="border-gray-100 hover:bg-brand-50/40 data-[state=selected]:bg-brand-50/60 data-[state=selected]:text-gray-900"
                >
                  {enableSelection && (
                    <TableCell className="w-[44px] px-3">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(v) => toggleOne(id, Boolean(v))}
                        className="border-gray-300"
                      />
                    </TableCell>
                  )}
                  {columns.map((col) => (
                    <TableCell key={col.id} className={cn('py-3 text-sm text-gray-800', col.className)}>
                      {col.cell(row)}
                    </TableCell>
                  ))}
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>

      {enablePagination && (
        <div className="flex flex-col gap-3 border-t border-gray-100 px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs font-medium text-gray-500">{showingText}</div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <div className="flex items-center gap-2">
              <div className="text-xs font-medium text-gray-500">
                {t('table.rowsPerPage')}
              </div>
              <Select value={String(pageSize)} onValueChange={(v) => setPageSize(Number(v))}>
                <SelectTrigger className="h-8 w-[90px] rounded-lg border-gray-200 bg-white text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-gray-200 bg-white text-gray-900">
                  {pageSizeOptions.map((opt) => (
                    <SelectItem key={opt} value={String(opt)}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => canPrev && setPage((p) => Math.max(1, p - 1))}
                disabled={!canPrev}
                className="h-8 rounded-lg border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-700 transition-colors hover:bg-brand-50 hover:text-brand-900 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {t('table.previous')}
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }).slice(0, 5).map((_, idx) => {
                  const p = idx + 1
                  const active = p === safePage
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPage(p)}
                      className={cn(
                        'h-8 w-8 rounded-lg border text-xs font-semibold transition-colors',
                        active
                          ? 'border-brand-200 bg-brand-50 text-brand-900'
                          : 'border-gray-200 bg-white text-gray-700 hover:bg-brand-50 hover:text-brand-900'
                      )}
                    >
                      {p}
                    </button>
                  )
                })}
              </div>

              <button
                type="button"
                onClick={() => canNext && setPage((p) => Math.min(totalPages, p + 1))}
                disabled={!canNext}
                className="h-8 rounded-lg border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-700 transition-colors hover:bg-brand-50 hover:text-brand-900 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {t('table.next')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
