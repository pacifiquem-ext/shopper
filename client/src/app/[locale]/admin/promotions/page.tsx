'use client'

import { useCallback, useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import * as Button from '@/components/alignui/button'
import { Card } from '@/components/alignui/card'
import { EmptyState } from '@/components/alignui/empty'
import * as Input from '@/components/alignui/input'
import * as Label from '@/components/alignui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/alignui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/alignui/table'
import { TurningZeroLoader } from '@/components/ui/turning-zero-loader'
import { adminService, type AdminPromoApi } from '@/services/admin.service'

export default function AdminPromotionsPage() {
  const t = useTranslations('admin')
  const [rows, setRows] = useState<AdminPromoApi[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(false)
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [type, setType] = useState<'PERCENT' | 'FIXED'>('PERCENT')
  const [value, setValue] = useState(10)

  const load = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const res = await adminService.getPromotions()
      const data = (res as { data?: AdminPromoApi[] })?.data ?? res
      setRows(Array.isArray(data) ? data : [])
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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim() || !name.trim() || value <= 0) {
      toast.error(t('promoValidation'))
      return
    }
    setSaving(true)
    try {
      await adminService.createPromotion({
        code: code.trim().toUpperCase(),
        name: name.trim(),
        type,
        value,
        startsAt: new Date().toISOString(),
      })
      toast.success(t('promoCreated'))
      setCode('')
      setName('')
      setValue(10)
      await load()
    } catch {
      // interceptor
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <div>
        <h1 className="text-title-h5 text-text-strong-950">{t('promotionsTitle')}</h1>
        <p className="mt-1 text-paragraph-sm text-text-sub-600">{t('promotionsSubtitle')}</p>
      </div>

      <Card className="p-6">
        <h2 className="text-label-md text-text-strong-950">{t('createPlatformPromo')}</h2>
        <form onSubmit={handleCreate} className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label.Root htmlFor="admin-promo-code">{t('promoCode')}</Label.Root>
            <Input.Root>
              <Input.Wrapper>
                <Input.Input
                  id="admin-promo-code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="uppercase"
                />
              </Input.Wrapper>
            </Input.Root>
          </div>
          <div className="space-y-2">
            <Label.Root htmlFor="admin-promo-name">{t('promoName')}</Label.Root>
            <Input.Root>
              <Input.Wrapper>
                <Input.Input
                  id="admin-promo-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </Input.Wrapper>
            </Input.Root>
          </div>
          <div className="space-y-2">
            <Label.Root>{t('promoType')}</Label.Root>
            <Select value={type} onValueChange={(v) => setType(v as 'PERCENT' | 'FIXED')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PERCENT">{t('typePercent')}</SelectItem>
                <SelectItem value="FIXED">{t('typeFixed')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label.Root htmlFor="admin-promo-value">{t('promoValue')}</Label.Root>
            <Input.Root>
              <Input.Wrapper>
                <Input.Input
                  id="admin-promo-value"
                  type="number"
                  min={1}
                  value={value}
                  onChange={(e) => setValue(Number(e.target.value) || 0)}
                />
              </Input.Wrapper>
            </Input.Root>
          </div>
          <div className="sm:col-span-2">
            <Button.Root type="submit" variant="primary" disabled={saving}>
              {saving ? t('saving') : t('createPromo')}
            </Button.Root>
          </div>
        </form>
      </Card>

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
              <TableHead>{t('promoCode')}</TableHead>
              <TableHead>{t('promoName')}</TableHead>
              <TableHead>{t('promoValue')}</TableHead>
              <TableHead>{t('colStatus')}</TableHead>
              <TableHead className="text-right">{t('colActions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => {
              const promoType = row.type ?? row.discountType
              const promoValue = row.value ?? row.discountValue ?? 0
              return (
                <TableRow key={row.id}>
                  <TableCell className="font-semibold">{row.code}</TableCell>
                  <TableCell>{row.name ?? '—'}</TableCell>
                  <TableCell>
                    {promoType === 'PERCENT' ? `${promoValue}%` : `${promoValue} RWF`}
                  </TableCell>
                  <TableCell>{row.status ?? (row.active ? 'ACTIVE' : '—')}</TableCell>
                  <TableCell className="text-right">
                    <Button.Root
                      type="button"
                      size="xsmall"
                      variant="neutral"
                      mode="stroke"
                      onClick={async () => {
                        try {
                          await adminService.deletePromotion(row.id)
                          toast.success(t('promoDeleted'))
                          await load()
                        } catch {
                          // interceptor
                        }
                      }}
                    >
                      {t('delete')}
                    </Button.Root>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
