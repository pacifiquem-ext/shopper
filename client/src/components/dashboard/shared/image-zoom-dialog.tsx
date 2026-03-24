'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface ImageZoomDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  imageUrl: string | null
  title: string
  subtitle: string
  altText: string
  emptyText: string
}

export function ImageZoomDialog({
  open,
  onOpenChange,
  imageUrl,
  title,
  subtitle,
  altText,
  emptyText,
}: ImageZoomDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-24px)] max-w-5xl overflow-hidden rounded-2xl border border-gray-200 bg-white p-0 shadow-xl">
        <div className="border-b border-gray-100 px-6 py-4">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-gray-900">{title}</DialogTitle>
            <DialogDescription className="mt-1 text-sm text-gray-600">{subtitle}</DialogDescription>
          </DialogHeader>
        </div>
        <div className="bg-black">
          {imageUrl ? (
            <img src={imageUrl} alt={altText} className="max-h-[70vh] w-full object-contain" />
          ) : (
            <div className="flex h-[50vh] items-center justify-center text-white">{emptyText}</div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
