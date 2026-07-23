'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import * as Button from '@/components/alignui/button'
import { Card } from '@/components/alignui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TurningZeroLoader } from '@/components/ui/turning-zero-loader'
import {
  promotionsService,
  type CreatePromoPayload,
  type PromoCodeApi,
} from '@/services/promotions.service'

export default function DashboardPromotionsPage() {
  const t = useTranslations('dashboard.promotionsPage')
  const [items, setItems] = useState<PromoCodeApi[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<CreatePromoPayload>({
    code: '',
    name: '',
    type: 'PERCENT',
    value: 10,
    startsAt: new Date().toISOString(),
  })

  const load = async () => {
    setLoading(true)
    try {
      const res = await promotionsService.list()
      const data = (res as { data?: PromoCodeApi[] })?.data ?? res
      setItems(Array.isArray(data) ? data : [])
    } catch {
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.code.trim() || !form.name.trim() || form.value <= 0) {
      toast.error(t('validation'))
      return
    }
    setSaving(true)
    try {
      await promotionsService.create({
        ...form,
        code: form.code.trim().toUpperCase(),
        name: form.name.trim() || form.code.trim().toUpperCase(),
        startsAt: form.startsAt || new Date().toISOString(),
      })
      toast.success(t('created'))
      setForm({
        code: '',
        name: '',
        type: 'PERCENT',
        value: 10,
        startsAt: new Date().toISOString(),
      })
      await load()
    } catch {
      // interceptor
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-strong-950 sm:text-3xl">
          {t('title')}
        </h1>
        <p className="mt-2 text-sm text-text-sub-600">{t('subtitle')}</p>
      </div>

      <Card className="p-6">
        <h2 className="text-label-md text-text-strong-950">{t('createTitle')}</h2>
        <form onSubmit={handleCreate} className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="promo-code">{t('code')}</Label>
            <Input
              id="promo-code"
              value={form.code}
              onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
              placeholder={t('codePlaceholder')}
              className="uppercase"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="promo-name">{t('name')}</Label>
            <Input
              id="promo-name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder={t('namePlaceholder')}
            />
          </div>
          <div className="space-y-2">
            <Label>{t('discountType')}</Label>
            <Select
              value={form.type}
              onValueChange={(v) =>
                setForm((f) => ({ ...f, type: v as 'PERCENT' | 'FIXED' }))
              }
            >
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
            <Label htmlFor="promo-value">{t('discountValue')}</Label>
            <Input
              id="promo-value"
              type="number"
              min={1}
              value={form.value}
              onChange={(e) =>
                setForm((f) => ({ ...f, value: Number(e.target.value) || 0 }))
              }
            />
          </div>
          <div className="flex items-end">
            <Button.Root type="submit" variant="primary" disabled={saving} className="w-full sm:w-auto">
              {saving ? t('saving') : t('create')}
            </Button.Root>
          </div>
        </form>
      </Card>

      <Card className="p-6">
        <h2 className="text-label-md text-text-strong-950">{t('listTitle')}</h2>
        {loading ? (
          <div className="flex justify-center py-12">
            <TurningZeroLoader />
          </div>
        ) : items.length === 0 ? (
          <p className="mt-4 text-sm text-text-sub-600">{t('empty')}</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-stroke-soft-200 px-4 py-3"
              >
                <div>
                  <p className="font-semibold text-text-strong-950">{item.code}</p>
                  <p className="text-xs text-text-sub-600">
                    {(item.type ?? item.discountType) === 'PERCENT'
                      ? t('percentOff', { value: item.value ?? item.discountValue ?? 0 })
                      : t('fixedOff', { value: item.value ?? item.discountValue ?? 0 })}
                    {' · '}
                    {(item.active ?? item.status === 'ACTIVE') ? t('active') : t('inactive')}
                  </p>
                </div>
                {(item.active ?? item.status === 'ACTIVE') ? (
                  <Button.Root
                    type="button"
                    variant="neutral"
                    mode="stroke"
                    size="small"
                    onClick={async () => {
                      try {
                        await promotionsService.deactivate(item.id)
                        toast.success(t('deactivated'))
                        await load()
                      } catch {
                        // interceptor
                      }
                    }}
                  >
                    {t('deactivate')}
                  </Button.Root>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
