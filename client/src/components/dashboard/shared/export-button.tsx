'use client'

import { Button, type ButtonProps } from '@/components/ui/button'
import { useExportDownload } from '@/hooks/use-export-download'
import { Download } from 'lucide-react'
import { TurningZeroLoader } from '@/components/ui/turning-zero-loader'
import { useTranslations } from 'next-intl'

type ExportButtonProps = {
  fetchBlob: () => Promise<Blob>
  filename: string
  label: string
  className?: string
  iconClassName?: string
} & Pick<ButtonProps, 'variant' | 'size'>

export function ExportButton({
  fetchBlob,
  filename,
  label,
  className,
  iconClassName,
  variant = 'outline',
  size = 'default',
}: ExportButtonProps) {
  const t = useTranslations('dashboard')
  const { isExporting, download } = useExportDownload()

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={className}
      disabled={isExporting}
      aria-busy={isExporting}
      onClick={() => download(fetchBlob, filename)}
    >
      {isExporting ? (
        <TurningZeroLoader size="xs" className={iconClassName} />
      ) : (
        <Download className={iconClassName} aria-hidden />
      )}
      {isExporting ? t('header.exporting') : label}
    </Button>
  )
}
