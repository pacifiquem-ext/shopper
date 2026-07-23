'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CheckCircle2, XCircle, Search, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TurningZeroLoader } from '@/components/ui/turning-zero-loader'
import { adminService, type AdminStoreApi, type AdminStoreKycApi } from '@/services/admin.service'

export default function AdminStoresPage() {
  const t = useTranslations('admin')
  const [stores, setStores] = useState<AdminStoreApi[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [kycData, setKycData] = useState<Record<string, AdminStoreKycApi>>({})
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  useEffect(() => {
    async function load() {
      setIsLoading(true)
      try {
        const res = await adminService.getStores({
          status: statusFilter || undefined,
          search: search || undefined,
          take: 50,
        })
        const data = (res as { data?: { data?: AdminStoreApi[]; total?: number } })?.data ?? res
        const payload = data as { data?: AdminStoreApi[]; total?: number }
        setStores(Array.isArray(payload?.data) ? payload.data : [])
        setTotal(payload?.total ?? 0)
      } catch {
        // interceptor
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [statusFilter, search])

  const handleToggleExpand = async (id: string) => {
    if (expandedId === id) {
      setExpandedId(null)
      return
    }
    setExpandedId(id)
    if (!kycData[id]) {
      try {
        const res = await adminService.getStoreKyc(id)
        const kyc = (res as { data?: AdminStoreKycApi })?.data ?? (res as unknown as AdminStoreKycApi)
        setKycData((prev) => ({ ...prev, [id]: kyc }))
      } catch {
        // interceptor
      }
    }
  }

  const handleApprove = async (id: string) => {
    try {
      await adminService.approveStore(id)
      setStores((prev) => prev.map((s) => (s.id === id ? { ...s, status: 'APPROVED' } : s)))
    } catch {
      // interceptor
    }
  }

  const handleReject = async (id: string) => {
    try {
      await adminService.rejectStore(id, rejectReason || undefined)
      setStores((prev) => prev.map((s) => (s.id === id ? { ...s, status: 'REJECTED' } : s)))
      setRejectingId(null)
      setRejectReason('')
    } catch {
      // interceptor
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <div>
        <h1 className="text-title-h5 text-text-strong-950">{t('storesTitle')}</h1>
        <p className="mt-1 text-paragraph-sm text-text-sub-600">
          {t('storesSubtitle', { count: total })}
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-soft-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('searchStores')}
            className="pl-9"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 rounded-lg border border-stroke-soft-200 bg-bg-white-0 px-3 text-sm"
        >
          <option value="">{t('allStatuses')}</option>
          <option value="SUBMITTED">SUBMITTED</option>
          <option value="UNDER_REVIEW">UNDER_REVIEW</option>
          <option value="APPROVED">APPROVED</option>
          <option value="REJECTED">REJECTED</option>
        </select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <TurningZeroLoader />
        </div>
      ) : stores.length === 0 ? (
        <p className="text-center text-text-sub-600">{t('noStores')}</p>
      ) : (
        <ul className="space-y-3">
          {stores.map((store) => {
            const open = expandedId === store.id
            return (
              <li
                key={store.id}
                className="rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-text-strong-950">{store.displayName}</p>
                    <p className="text-xs text-text-sub-600">
                      {store.slug ?? store.subdomain}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">{store.status}</Badge>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleExpand(store.id)}
                    >
                      {open ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                    </Button>
                    {store.status !== 'APPROVED' ? (
                      <Button type="button" size="sm" onClick={() => handleApprove(store.id)}>
                        <CheckCircle2 className="mr-1 size-4" />
                        {t('approve')}
                      </Button>
                    ) : null}
                    {store.status !== 'REJECTED' ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        onClick={() => setRejectingId(store.id)}
                      >
                        <XCircle className="mr-1 size-4" />
                        {t('reject')}
                      </Button>
                    ) : null}
                  </div>
                </div>
                {open && kycData[store.id] ? (
                  <div className="mt-4 grid gap-2 rounded-xl bg-bg-weak-50 p-3 text-sm text-text-sub-600 sm:grid-cols-2">
                    <p>{kycData[store.id].ownerFullName}</p>
                    <p>{kycData[store.id].ownerEmail}</p>
                    <p>{kycData[store.id].ownerPhoneNumber}</p>
                    <p>{kycData[store.id].country}</p>
                  </div>
                ) : null}
                {rejectingId === store.id ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Input
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder={t('rejectReason')}
                    />
                    <Button type="button" variant="destructive" onClick={() => handleReject(store.id)}>
                      {t('confirmReject')}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setRejectingId(null)}>
                      {t('cancel')}
                    </Button>
                  </div>
                ) : null}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
