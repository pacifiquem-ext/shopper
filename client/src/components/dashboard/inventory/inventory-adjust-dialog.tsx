'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

interface InventoryAdjustDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'restock' | 'adjust'
  quantity: string
  onQuantityChange: (value: string) => void
  onConfirm: () => void | Promise<void>
  productId: string | null
}

export function InventoryAdjustDialog({
  open,
  onOpenChange,
  mode,
  quantity,
  onQuantityChange,
  onConfirm,
  productId,
}: InventoryAdjustDialogProps) {
  const t = useTranslations('dashboard')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleOpenChange = (next: boolean) => {
    if (!next && isSubmitting) return
    onOpenChange(next)
  }

  const handleConfirm = async () => {
    if (isSubmitting) return
    setIsSubmitting(true)
    try {
      await onConfirm()
    } catch {
      // axios interceptor toasts; keep dialog open
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="w-[calc(100vw-24px)] max-w-lg rounded-2xl border border-stroke-soft-200 bg-white p-0 shadow-xl">
        <div className="border-b border-stroke-soft-200 px-6 py-4">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-text-strong-950">
              {mode === 'restock'
                ? t('inventory.adjustDialog.restockTitle')
                : t('inventory.adjustDialog.adjustTitle')}
            </DialogTitle>
            <DialogDescription className="mt-1 text-sm text-text-sub-600">
              {productId ? t('inventory.adjustDialog.subtitle') : ''}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="space-y-4 px-6 py-6">
          <div className="grid gap-2">
            <Label className="text-sm font-semibold text-text-sub-600">
              {t('inventory.adjustDialog.quantity')}
            </Label>
            <Input
              value={quantity}
              onChange={(e) => onQuantityChange(e.target.value)}
              inputMode="numeric"
              placeholder={
                mode === 'restock'
                  ? t('inventory.adjustDialog.restockPlaceholder')
                  : t('inventory.adjustDialog.adjustPlaceholder')
              }
              disabled={isSubmitting}
              className="h-10 rounded-xl border-primary-base/20 bg-white"
            />
          </div>

          <div className="rounded-2xl border border-stroke-soft-200 bg-bg-weak-50 p-4 text-sm text-text-sub-600">
            <div className="text-xs font-semibold text-text-soft-400">
              {t('inventory.adjustDialog.noteTitle')}
            </div>
            <div className="mt-1 text-sm text-text-sub-600">
              {t('inventory.adjustDialog.noteBody')}
            </div>
          </div>
        </div>

        <div className="border-t border-stroke-soft-200 px-6 py-4">
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
              className="h-10 rounded-xl border-stroke-soft-200 bg-white text-text-sub-600 hover:bg-primary-alpha-10 hover:text-primary-base disabled:opacity-50"
            >
              {t('inventory.adjustDialog.cancel')}
            </Button>
            <Button
              type="button"
              onClick={() => void handleConfirm()}
              disabled={isSubmitting}
              className="h-10 rounded-xl bg-primary-base text-white hover:bg-primary-darker disabled:opacity-50"
            >
              {isSubmitting
                ? t('inventory.adjustDialog.submitting')
                : mode === 'restock'
                  ? t('inventory.adjustDialog.confirmRestock')
                  : t('inventory.adjustDialog.confirmAdjust')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
