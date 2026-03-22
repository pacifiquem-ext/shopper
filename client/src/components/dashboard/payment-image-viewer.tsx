import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Check, X, ZoomIn, Download, AlertCircle } from 'lucide-react'
import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

type PaymentImageViewerProps = {
  imageUrl: string | null
  isConfirmed: boolean
  onConfirm: () => void
  onReject: () => void
  confirmLabel: string
  rejectLabel: string
  title: string
  noImageText: string
}

export function PaymentImageViewer({
  imageUrl,
  isConfirmed,
  onConfirm,
  onReject,
  confirmLabel,
  rejectLabel,
  title,
  noImageText,
}: PaymentImageViewerProps) {
  const [zoomOpen, setZoomOpen] = useState(false)

  if (!imageUrl) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        <div className="mt-4 flex items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 p-8">
          <div className="text-center">
            <AlertCircle className="mx-auto h-10 w-10 text-gray-400" />
            <p className="mt-2 text-sm font-medium text-gray-500">{noImageText}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          {isConfirmed && (
            <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
              <Check className="h-3.5 w-3.5" />
              <span>Verified</span>
            </div>
          )}
        </div>

        <div className="mt-4 space-y-3">
          <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
            <img
              src={imageUrl}
              alt="Payment proof"
              className="h-64 w-full object-contain transition-transform duration-200 group-hover:scale-105"
            />
            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/0 opacity-0 transition-all duration-200 group-hover:bg-black/40 group-hover:opacity-100">
              <Button
                type="button"
                size="sm"
                onClick={() => setZoomOpen(true)}
                className="h-9 rounded-lg bg-white text-gray-900 hover:bg-gray-100"
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
                  link.download = 'payment-proof.jpg'
                  link.click()
                }}
                className="h-9 rounded-lg border-white bg-white/90 text-gray-900 hover:bg-white"
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {!isConfirmed && (
            <div className="flex items-center gap-2">
              <Button
                type="button"
                onClick={onConfirm}
                className="flex-1 h-9 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
              >
                <Check className="mr-2 h-4 w-4" />
                {confirmLabel}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onReject}
                className="flex-1 h-9 rounded-lg border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
              >
                <X className="mr-2 h-4 w-4" />
                {rejectLabel}
              </Button>
            </div>
          )}
        </div>
      </div>

      <Dialog open={zoomOpen} onOpenChange={setZoomOpen}>
        <DialogContent className="max-w-4xl border-gray-200 bg-white">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Payment Proof</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <img
              src={imageUrl}
              alt="Payment proof - full size"
              className="w-full rounded-lg"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
