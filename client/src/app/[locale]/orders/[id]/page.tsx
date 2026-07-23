'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { Link } from '@/i18n/navigation'
import * as Button from '@/components/alignui/button'
import { Card } from '@/components/alignui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { TurningZeroLoader } from '@/components/ui/turning-zero-loader'
import { ordersService, type OrderApi } from '@/services/orders.service'
import { validateImageUrl } from '@/lib/image-validation'
import { mediaService } from '@/services/media.service'

export default function PublicOrderStatusPage() {
  const t = useTranslations('orders')
  const params = useParams()
  const id = String(params?.id ?? '')
  const [order, setOrder] = useState<OrderApi | null>(null)
  const [loading, setLoading] = useState(true)
  const [proofUrl, setProofUrl] = useState('')
  const [uploadingFile, setUploadingFile] = useState(false)
  const [reference, setReference] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [phone, setPhone] = useState('')

  const load = async (lookupPhone?: string) => {
    if (!id) return
    setLoading(true)
    try {
      const res = await ordersService.getPublicOrder(id, lookupPhone || phone || undefined)
      const data = (res as { data?: OrderApi })?.data ?? (res as unknown as OrderApi)
      setOrder(data)
      if (data?.payment?.paymentProofUrl) {
        setProofUrl(data.payment.paymentProofUrl)
      }
    } catch {
      setOrder(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const q = new URLSearchParams(window.location.search).get('phone')
      if (q) {
        setPhone(q)
        void load(q)
        return
      }
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const handleUpload = async () => {
    if (!order) return
    const url = proofUrl.trim()
    if (!url) {
      toast.error(t('proofRequired'))
      return
    }
    setSubmitting(true)
    try {
      const validation = await validateImageUrl(url)
      if (!validation.ok) {
        toast.error(t('proofImageInvalid'))
        return
      }
      const proofPhone = phone.trim()
      if (!proofPhone) {
        toast.error(t('phoneLookup'))
        return
      }
      await ordersService.uploadProof(order.id, {
        paymentProofUrl: url,
        reference: reference.trim() || undefined,
        phone: proofPhone,
      })
      toast.success(t('proofUploaded'))
      await load()
    } catch {
      // interceptor may toast; fallback message
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-weak-50">
        <TurningZeroLoader />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center gap-4 px-4">
        <Card className="space-y-4 p-6">
          <h1 className="text-title-h6 text-text-strong-950">{t('notFoundTitle')}</h1>
          <p className="text-paragraph-sm text-text-sub-600">{t('notFoundBody')}</p>
          <div className="space-y-2">
            <Label htmlFor="order-phone">{t('phoneLookup')}</Label>
            <Input
              id="order-phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+250788123456"
            />
            <Button.Root type="button" variant="primary" onClick={() => load(phone)}>
              {t('retryLookup')}
            </Button.Root>
          </div>
          <Button.Root asChild variant="neutral" mode="stroke">
            <Link href="/shop">{t('backToShop')}</Link>
          </Button.Root>
        </Card>
      </div>
    )
  }

  const paymentStatus = order.payment?.status ?? 'PENDING'

  return (
    <div className="min-h-screen bg-bg-weak-50 px-4 py-10">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
        <div>
          <p className="text-label-xs uppercase tracking-[0.12em] text-primary-base">
            {t('eyebrow')}
          </p>
          <h1 className="mt-1 text-title-h5 text-text-strong-950">
            {t('title', { orderNumber: order.orderNumber })}
          </h1>
          <p className="mt-2 text-paragraph-sm text-text-sub-600">
            {t('statusLine', { status: paymentStatus })}
          </p>
        </div>

        <Card className="space-y-3 p-6">
          <h2 className="text-label-md text-text-strong-950">{t('summaryTitle')}</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-text-sub-600">{t('total')}</dt>
              <dd className="font-semibold tabular-nums text-text-strong-950">
                {order.total.toLocaleString()} RWF
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-text-sub-600">{t('customer')}</dt>
              <dd className="text-text-strong-950">{order.customerName || order.customerPhone}</dd>
            </div>
          </dl>
          <ul className="divide-y divide-stroke-soft-200 border-t border-stroke-soft-200 pt-3">
            {order.lineItems.map((line) => (
              <li key={line.id} className="flex justify-between gap-3 py-2 text-sm">
                <span className="text-text-sub-600">
                  {line.productName} × {line.quantity}
                </span>
                <span className="font-medium tabular-nums text-text-strong-950">
                  {line.total.toLocaleString()} RWF
                </span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="space-y-4 p-6">
          <h2 className="text-label-md text-text-strong-950">{t('payTitle')}</h2>
          <p className="text-paragraph-sm text-text-sub-600">{t('payInstructions')}</p>
          {order.payment?.paymentProofUrl ? (
            <div className="space-y-2">
              <p className="text-sm font-medium text-text-strong-950">{t('proofSubmitted')}</p>
              <img
                src={order.payment.paymentProofUrl}
                alt={t('proofAlt')}
                className="max-h-64 rounded-xl border border-stroke-soft-200 object-contain"
              />
            </div>
          ) : (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="proof-url">{t('proofUrl')}</Label>
                <Input
                  id="proof-url"
                  value={proofUrl}
                  onChange={(e) => setProofUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="proof-ref">{t('reference')}</Label>
                <Input
                  id="proof-ref"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder={t('referencePlaceholder')}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="proof-file">{t('proofFileLabel')}</Label>
                <Input
                  id="proof-file"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    setUploadingFile(true)
                    try {
                      const uploaded = await mediaService.uploadPublicProof(file)
                      setProofUrl(uploaded.url)
                      toast.success(t('proofFileUploaded'))
                    } catch (err) {
                      toast.error(err instanceof Error ? err.message : t('proofImageInvalid'))
                    } finally {
                      setUploadingFile(false)
                    }
                  }}
                />
              </div>
              <Button.Root
                type="button"
                variant="primary"
                disabled={submitting}
                onClick={handleUpload}
              >
                {submitting || uploadingFile ? t('uploading') : t('uploadProof')}
              </Button.Root>
            </div>
          )}
        </Card>

        <Link
          href="/shop"
          className="inline-flex h-10 items-center justify-center rounded-10 bg-bg-white-0 px-3.5 text-label-sm text-text-sub-600 shadow-regular-xs ring-1 ring-inset ring-stroke-soft-200"
        >
          {t('backToShop')}
        </Link>
      </div>
    </div>
  )
}
