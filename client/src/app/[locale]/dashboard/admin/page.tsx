'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  CheckCircle2,
  XCircle,
  Search,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Store,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { TurningZeroLoader } from '@/components/ui/turning-zero-loader'
import { adminService, type AdminStoreApi, type AdminStoreKycApi } from '@/services/admin.service'
import { useAuthStore } from '@/store/auth.store'
import { useTranslations } from 'next-intl'

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  SUBMITTED: { label: 'Submitted', className: 'border-blue-200 bg-blue-50 text-blue-700' },
  UNDER_REVIEW: { label: 'Under Review', className: 'border-amber-200 bg-amber-50 text-amber-700' },
  APPROVED: { label: 'Approved', className: 'border-emerald-200 bg-emerald-50 text-emerald-700' },
  REJECTED: { label: 'Rejected', className: 'border-red-200 bg-red-50 text-red-700' },
  DRAFT: { label: 'Draft', className: 'border-stroke-soft-200 bg-bg-weak-50 text-text-sub-600' },
  SUSPENDED: { label: 'Suspended', className: 'border-orange-200 bg-orange-50 text-orange-700' },
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-RW', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export default function AdminPage() {
  const { user } = useAuthStore()
  const tA11y = useTranslations('common.a11y')

  const [stores, setStores] = useState<AdminStoreApi[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [kycData, setKycData] = useState<Record<string, AdminStoreKycApi>>({})
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  const isAdmin = user?.role === 'PLATFORM_ADMIN'

  useEffect(() => {
    if (!isAdmin) return
    async function load() {
      setIsLoading(true)
      try {
        const res = await adminService.getStores({ status: statusFilter || undefined, take: 50 })
        const data = (res as any)?.data ?? res
        setStores(Array.isArray(data?.data) ? data.data : [])
        setTotal(data?.total ?? 0)
      } catch {
        // interceptor shows toast
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [statusFilter, isAdmin])

  const handleToggleExpand = async (id: string) => {
    if (expandedId === id) {
      setExpandedId(null)
      return
    }
    setExpandedId(id)
    if (!kycData[id]) {
      try {
        const res = await adminService.getStoreKyc(id)
        const data = (res as any)?.data ?? res
        if (data) setKycData((prev) => ({ ...prev, [id]: data }))
      } catch {
        // ignore
      }
    }
  }

  const handleApprove = async (id: string) => {
    try {
      await adminService.approveStore(id)
      setStores((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status: 'APPROVED' } : s)),
      )
    } catch {
      // interceptor shows toast
    }
  }

  const handleReject = async (id: string) => {
    try {
      await adminService.rejectStore(id, rejectReason || undefined)
      setStores((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status: 'REJECTED' } : s)),
      )
      setRejectingId(null)
      setRejectReason('')
    } catch {
      // interceptor shows toast
    }
  }

  const filtered = search
    ? stores.filter(
        (s) =>
          s.registeredName.toLowerCase().includes(search.toLowerCase()) ||
          s.displayName.toLowerCase().includes(search.toLowerCase()) ||
          s.subdomain.toLowerCase().includes(search.toLowerCase()) ||
          s.user.fullName.toLowerCase().includes(search.toLowerCase()),
      )
    : stores

  const statusOptions = ['', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'DRAFT', 'SUSPENDED']

  if (!isAdmin) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-gray-400">
        <ShieldAlert className="h-16 w-16 opacity-30" />
        <h2 className="text-lg font-semibold text-text-sub-600">Access Denied</h2>
        <p className="text-sm">This page is restricted to platform administrators.</p>
      </div>
    )
  }

  return (
    <div className="flex w-full max-w-7xl flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-text-strong-950">Admin — Stores</h1>
        <p className="mt-2 text-text-soft-400">Review and manage all submitted stores.</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {(['SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'] as const).map((s) => {
          const cfg = STATUS_CONFIG[s]
          const count = stores.filter((st) => st.status === s).length
          return (
            <div
              key={s}
              className="flex items-center gap-3 rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-4 shadow-regular-xs"
            >
              <div className={cn('h-3 w-3 rounded-full border', cfg.className)} />
              <div>
                <div className="text-xs text-text-soft-400">{cfg.label}</div>
                <div className="text-xl font-bold text-text-strong-950">{isLoading ? '—' : count}</div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by store name, subdomain, or owner..."
            className="h-10 rounded-xl border-stroke-soft-200 pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {statusOptions.map((s) => (
            <Button
              key={s}
              type="button"
              size="sm"
              variant={statusFilter === s ? 'default' : 'outline'}
              onClick={() => setStatusFilter(s)}
              className={cn(
                'h-9 rounded-lg text-xs',
                statusFilter === s
                  ? 'bg-primary-base text-white hover:bg-primary-darker'
                  : 'border-stroke-soft-200 text-text-sub-600 hover:bg-bg-weak-50',
              )}
            >
              {s === '' ? 'All' : STATUS_CONFIG[s]?.label ?? s}
            </Button>
          ))}
        </div>
      </div>

      {/* Store list */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-stroke-soft-200 bg-white">
            <TurningZeroLoader size="md" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 rounded-2xl border border-stroke-soft-200 bg-white text-gray-400">
            <Store className="h-12 w-12 opacity-30" />
            <p className="text-sm font-medium">No stores found</p>
          </div>
        ) : (
          filtered.map((store) => {
            const cfg = STATUS_CONFIG[store.status] ?? STATUS_CONFIG.DRAFT
            const isExpanded = expandedId === store.id
            const kyc = kycData[store.id]
            const canAction = store.status === 'SUBMITTED' || store.status === 'UNDER_REVIEW'

            return (
              <div
                key={store.id}
                className="overflow-hidden rounded-2xl border border-stroke-soft-200 bg-bg-white-0 shadow-regular-xs"
              >
                {/* Header row */}
                <div className="flex items-center justify-between gap-4 p-5">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-bg-weak-50">
                      <Store className="h-5 w-5 text-text-sub-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-text-strong-950">{store.displayName}</span>
                        <Badge
                          className={cn(
                            'rounded-full border px-2 py-0.5 text-xs font-medium',
                            cfg.className,
                          )}
                        >
                          {cfg.label}
                        </Badge>
                      </div>
                      <div className="mt-0.5 text-xs text-text-soft-400">
                        {store.subdomain}.onlineshop.rw · Owner: {store.user.fullName} · {fmtDate(store.createdAt)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {canAction && rejectingId !== store.id && (
                      <>
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => handleApprove(store.id)}
                          className="h-8 rounded-lg bg-emerald-600 px-3 text-xs text-white hover:bg-emerald-700"
                        >
                          <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                          Approve
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => setRejectingId(store.id)}
                          className="h-8 rounded-lg border-red-200 px-3 text-xs text-red-600 hover:bg-red-50"
                        >
                          <XCircle className="mr-1 h-3.5 w-3.5" />
                          Reject
                        </Button>
                      </>
                    )}
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => handleToggleExpand(store.id)}
                      aria-expanded={isExpanded}
                      aria-label={
                        isExpanded ? tA11y('collapseDetails') : tA11y('expandDetails')
                      }
                      className="h-8 w-8 rounded-lg p-0 text-text-soft-400 hover:bg-bg-weak-50"
                    >
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" aria-hidden />
                      ) : (
                        <ChevronDown className="h-4 w-4" aria-hidden />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Inline reject form */}
                {rejectingId === store.id && (
                  <div className="flex items-center gap-3 border-t border-stroke-soft-200 bg-red-50 px-5 py-3">
                    <Input
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="Rejection reason (optional)..."
                      className="h-9 flex-1 rounded-lg border-red-200 bg-white text-sm"
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => handleReject(store.id)}
                      className="h-9 rounded-lg bg-red-600 px-4 text-xs text-white hover:bg-red-700"
                    >
                      Confirm Reject
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => { setRejectingId(null); setRejectReason('') }}
                      className="h-9 rounded-lg px-3 text-xs text-text-sub-600"
                    >
                      Cancel
                    </Button>
                  </div>
                )}

                {/* KYC expansion */}
                {isExpanded && (
                  <div className="border-t border-stroke-soft-200 bg-bg-weak-50 px-5 py-4">
                    {!kyc ? (
                      <div className="py-4 text-center text-sm text-gray-400">
                        <TurningZeroLoader size="sm" className="mx-auto" />
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
                        <div>
                          <div className="text-xs font-semibold uppercase tracking-wide text-gray-400">Registered Name</div>
                          <div className="mt-1 font-medium text-gray-800">{kyc.registeredName}</div>
                        </div>
                        <div>
                          <div className="text-xs font-semibold uppercase tracking-wide text-gray-400">Owner</div>
                          <div className="mt-1 font-medium text-gray-800">{kyc.kyc?.ownerFullName}</div>
                          <div className="text-xs text-text-soft-400">{kyc.kyc?.ownerEmail}</div>
                          <div className="text-xs text-text-soft-400">{kyc.kyc?.ownerPhoneNumber}</div>
                        </div>
                        <div>
                          <div className="text-xs font-semibold uppercase tracking-wide text-gray-400">Industry</div>
                          <div className="mt-1 font-medium text-gray-800">{kyc.kyc?.industrySector?.name}</div>
                          <div className="text-xs text-text-soft-400">{kyc.kyc?.businessCategory?.name}</div>
                        </div>
                        {kyc.kyc?.businessAddress && (
                          <div>
                            <div className="text-xs font-semibold uppercase tracking-wide text-gray-400">Business Address</div>
                            <div className="mt-1 font-medium text-gray-800">
                              {kyc.kyc.businessAddress.physicalAddress}
                            </div>
                            <div className="text-xs text-text-soft-400">
                              {kyc.kyc.businessAddress.sector}, {kyc.kyc.businessAddress.district}
                            </div>
                          </div>
                        )}
                        {store.rejectionReason && (
                          <div className="col-span-full">
                            <div className="text-xs font-semibold uppercase tracking-wide text-red-400">Rejection Reason</div>
                            <div className="mt-1 text-sm text-red-600">{store.rejectionReason}</div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {!isLoading && filtered.length > 0 && (
        <p className="text-xs text-gray-400">
          Showing {filtered.length} of {total} stores
        </p>
      )}
    </div>
  )
}
