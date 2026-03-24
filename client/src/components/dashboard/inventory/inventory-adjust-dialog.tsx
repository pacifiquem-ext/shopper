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

interface InventoryAdjustDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'restock' | 'adjust'
  quantity: string
  onQuantityChange: (value: string) => void
  onConfirm: () => void
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-24px)] max-w-lg rounded-2xl border border-gray-200 bg-white p-0 shadow-xl">
        <div className="border-b border-gray-100 px-6 py-4">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-gray-900">
              {mode === 'restock'
                ? t('inventory.adjustDialog.restockTitle')
                : t('inventory.adjustDialog.adjustTitle')}
            </DialogTitle>
            <DialogDescription className="mt-1 text-sm text-gray-600">
              {productId ? t('inventory.adjustDialog.subtitle') : ''}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="space-y-4 px-6 py-6">
          <div className="grid gap-2">
            <Label className="text-sm font-semibold text-gray-700">
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
              className="h-10 rounded-xl border-brand-200 bg-white"
            />
          </div>

          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <div className="text-xs font-semibold text-gray-500">
              {t('inventory.adjustDialog.noteTitle')}
            </div>
            <div className="mt-1 text-sm text-gray-700">
              {t('inventory.adjustDialog.noteBody')}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 px-6 py-4">
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-10 rounded-xl border-gray-200 bg-white text-gray-700 hover:bg-brand-50 hover:text-brand-900"
            >
              {t('inventory.adjustDialog.cancel')}
            </Button>
            <Button
              type="button"
              onClick={onConfirm}
              className="h-10 rounded-xl bg-brand-900 text-white hover:bg-brand-800"
            >
              {mode === 'restock'
                ? t('inventory.adjustDialog.confirmRestock')
                : t('inventory.adjustDialog.confirmAdjust')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
