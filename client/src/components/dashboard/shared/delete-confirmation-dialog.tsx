'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { AlertTriangle, Trash2 } from 'lucide-react'

interface DeleteItem {
  icon?: React.ReactNode
  label: string
  value?: string | number
}

interface DeleteConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  title: string
  description: string
  itemName: string
  warningMessage: string
  impactTitle?: string
  impactMessage?: string
  deleteItems?: DeleteItem[]
  permanentlyRemoveLabel?: string
  confirmButtonText?: string
  cancelButtonText?: string
  isLoading?: boolean
}

export function DeleteConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  itemName,
  warningMessage,
  impactTitle,
  impactMessage,
  deleteItems = [],
  permanentlyRemoveLabel = 'This will permanently remove:',
  confirmButtonText = 'Delete',
  cancelButtonText = 'Cancel',
  isLoading = false,
}: DeleteConfirmationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md overflow-hidden rounded-2xl border border-stroke-soft-200 bg-white p-0 shadow-xl">
        <div className="border-b border-stroke-soft-200 px-6 py-4">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-error-alpha-10">
                <AlertTriangle className="h-6 w-6 text-error-base" />
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold text-text-strong-950">{title}</DialogTitle>
                <DialogDescription className="mt-1 text-sm text-text-sub-600">
                  {description}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="px-6 py-4">
          <div className="space-y-4">
            <div className="rounded-xl border border-error-base/20 bg-error-alpha-10 p-4">
              <p className="text-sm font-medium text-error-darker">
                {warningMessage} <span className="font-bold">{itemName}</span>
              </p>
              {deleteItems.length > 0 && (
                <>
                  <p className="mt-2 text-sm text-error-darker">
                    {permanentlyRemoveLabel}
                  </p>
                  <ul className="mt-2 space-y-1 text-sm text-error-darker">
                    {deleteItems.map((item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="mt-0.5 text-error-base">•</span>
                        <span>
                          {item.label}
                          {item.value !== undefined && ` (${item.value})`}
                        </span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>

            {impactTitle && impactMessage && (
              <div className="rounded-xl border border-warning-base/20 bg-warning-alpha-10 p-4">
                <div className="flex gap-3">
                  <AlertTriangle className="h-5 w-5 shrink-0 text-warning-base" />
                  <div>
                    <p className="text-sm font-medium text-warning-darker">
                      {impactTitle}
                    </p>
                    <p className="mt-1 text-sm text-warning-darker">
                      {impactMessage}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-stroke-soft-200 px-6 py-4">
          <div className="flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="h-10 rounded-xl border-stroke-soft-200 bg-white text-text-sub-600 hover:bg-bg-weak-50"
            >
              {cancelButtonText}
            </Button>
            <Button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className="h-10 rounded-xl bg-error-base text-static-white hover:bg-error-darker"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {confirmButtonText}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
