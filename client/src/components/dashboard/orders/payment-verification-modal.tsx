'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Check, X, Download, AlertCircle, ZoomIn, Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

type PaymentVerificationModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  orderId: string
  imageUrl: string | null
  isConfirmed: boolean
  onConfirm: () => void | Promise<void>
  onReject: (reason?: string) => void | Promise<void>
}

export function PaymentVerificationModal({
  open,
  onOpenChange,
  orderId,
  imageUrl,
  isConfirmed,
  onConfirm,
  onReject,
}: PaymentVerificationModalProps) {
  const t = useTranslations('dashboard')
  const [zoomOpen, setZoomOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [showRejectReason, setShowRejectReason] = useState(false)

  const handleOpenChange = (next: boolean) => {
    if (!next && isSubmitting) return
    onOpenChange(next)
  }

  const handleConfirm = async () => {
    if (isSubmitting) return
    setIsSubmitting(true)
    try {
      await onConfirm()
      onOpenChange(false)
    } catch {
      // axios interceptor toasts; keep modal open
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReject = async () => {
    if (isSubmitting) return
    if (!showRejectReason) {
      setShowRejectReason(true)
      return
    }
    setIsSubmitting(true)
    try {
      await onReject(rejectReason.trim() || undefined)
      onOpenChange(false)
      setShowRejectReason(false)
      setRejectReason('')
    } catch {
      // axios interceptor toasts; keep modal open
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-2xl border-stroke-soft-200 bg-white">
          <DialogHeader>
            <DialogTitle className="text-text-strong-950">{t('orders.paymentModal.title')}</DialogTitle>
            <DialogDescription className="text-text-sub-600">
              {t('orders.paymentModal.description', { orderId })}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4">
            {!imageUrl ? (
              <div className="flex items-center justify-center rounded-xl border-2 border-dashed border-stroke-soft-200 bg-bg-weak-50 p-12">
                <div className="text-center">
                  <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-3 text-sm font-medium text-text-soft-400">
                    No payment proof uploaded yet
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    Customer hasn't submitted payment proof
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {isConfirmed && (
                  <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-3">
                    <Check className="h-5 w-5 text-emerald-600" />
                    <div>
                      <p className="text-sm font-semibold text-emerald-900">Payment Verified</p>
                      <p className="text-xs text-emerald-700">This payment has been confirmed</p>
                    </div>
                  </div>
                )}

                <div className="group relative overflow-hidden rounded-xl border border-stroke-soft-200 bg-bg-weak-50">
                  <img
                    src={imageUrl}
                    alt="Payment proof"
                    className="h-96 w-full object-contain transition-transform duration-200 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 flex items-center justify-center gap-3 bg-black/0 opacity-0 transition-all duration-200 group-hover:bg-black/40 group-hover:opacity-100">
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => setZoomOpen(true)}
                      className="h-10 rounded-lg bg-white px-4 text-text-strong-950 hover:bg-bg-weak-50"
                    >
                      <ZoomIn className="mr-2 h-4 w-4" />
                      View Full Size
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const link = document.createElement('a')
                        link.href = imageUrl
                        link.download = `payment-proof-${orderId}.jpg`
                        link.click()
                      }}
                      className="h-10 rounded-lg border-white bg-white/90 px-4 text-text-strong-950 hover:bg-white"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  </div>
                </div>

                {!isConfirmed && (
                  <div className="flex flex-col gap-3 rounded-lg border border-stroke-soft-200 bg-bg-weak-50 p-4 sm:flex-row sm:items-center">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-text-strong-950">{t('orders.paymentModal.verifyTitle')}</p>
                      <p className="mt-0.5 text-xs text-text-sub-600">
                        {t('orders.paymentModal.verifyBody')}
                      </p>
                      {showRejectReason ? (
                        <input
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          placeholder={t('orders.paymentModal.rejectReasonPlaceholder')}
                          className="mt-2 h-9 w-full rounded-lg border border-stroke-soft-200 bg-white px-3 text-sm"
                        />
                      ) : null}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        onClick={() => void handleReject()}
                        disabled={isSubmitting}
                        variant="outline"
                        className="h-9 rounded-lg border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 disabled:opacity-50"
                      >
                        {isSubmitting ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <X className="mr-2 h-4 w-4" />
                        )}
                        {t('orders.paymentModal.reject')}
                      </Button>
                      <Button
                        type="button"
                        onClick={() => void handleConfirm()}
                        disabled={isSubmitting}
                        className="h-9 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
                      >
                        {isSubmitting ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Check className="mr-2 h-4 w-4" />
                        )}
                        {t('orders.paymentModal.confirm')}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={zoomOpen} onOpenChange={setZoomOpen}>
        <DialogContent className="max-w-5xl border-stroke-soft-200 bg-white">
          <DialogHeader>
            <DialogTitle className="text-text-strong-950">Payment Proof - Full Size</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {imageUrl && (
              <img
                src={imageUrl}
                alt="Payment proof - full size"
                className="w-full rounded-lg"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
