import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { Check, X, Download, AlertCircle, ZoomIn } from 'lucide-react'
import { useState } from 'react'

type PaymentVerificationModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  orderId: string
  imageUrl: string | null
  isConfirmed: boolean
  onConfirm: () => void
  onReject: () => void
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
  const [zoomOpen, setZoomOpen] = useState(false)

  const handleConfirm = () => {
    onConfirm()
    onOpenChange(false)
  }

  const handleReject = () => {
    onReject()
    onOpenChange(false)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl border-gray-200 bg-white">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Payment Verification</DialogTitle>
            <DialogDescription className="text-gray-600">
              Review and verify payment proof for order {orderId}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4">
            {!imageUrl ? (
              <div className="flex items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 p-12">
                <div className="text-center">
                  <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-3 text-sm font-medium text-gray-500">
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

                <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
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
                      className="h-10 rounded-lg bg-white px-4 text-gray-900 hover:bg-gray-100"
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
                      className="h-10 rounded-lg border-white bg-white/90 px-4 text-gray-900 hover:bg-white"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  </div>
                </div>

                {!isConfirmed && (
                  <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">Verify this payment?</p>
                      <p className="mt-0.5 text-xs text-gray-600">
                        Confirm if the payment proof is legitimate
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        onClick={handleReject}
                        variant="outline"
                        className="h-9 rounded-lg border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
                      >
                        <X className="mr-2 h-4 w-4" />
                        Reject
                      </Button>
                      <Button
                        type="button"
                        onClick={handleConfirm}
                        className="h-9 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                      >
                        <Check className="mr-2 h-4 w-4" />
                        Confirm Payment
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
        <DialogContent className="max-w-5xl border-gray-200 bg-white">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Payment Proof - Full Size</DialogTitle>
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
