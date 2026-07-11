'use client'

import { useTheme } from 'next-themes'
import { Toaster as Sonner } from 'sonner'

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className='toaster group'
      richColors={false}
      toastOptions={{
        classNames: {
          toast:
            'group toast !min-h-0 !gap-2 !py-3 !px-4 group-[.toaster]:rounded-2xl group-[.toaster]:border group-[.toaster]:border-stroke-soft-200 group-[.toaster]:bg-white/95 group-[.toaster]:text-[#171717] group-[.toaster]:shadow-regular-md group-[.toaster]:backdrop-blur-md',
          title: 'group-[.toast]:text-sm group-[.toast]:font-semibold group-[.toast]:leading-tight',
          description:
            'group-[.toast]:text-xs group-[.toast]:leading-snug group-[.toast]:text-[#5c5c5c]',
          actionButton:
            'group-[.toast]:bg-[#1daf61] group-[.toast]:text-white',
          cancelButton:
            'group-[.toast]:bg-[#f7f7f7] group-[.toast]:text-[#171717]',
          success:
            'group-[.toaster]:!bg-white/95 group-[.toaster]:!text-[#171717] group-[.toaster]:!border-stroke-soft-200 [&_[data-icon]]:!text-[#1daf61] [&_[data-description]]:!text-[#5c5c5c]',
          error:
            'group-[.toaster]:!bg-white/95 group-[.toaster]:!text-[#171717] group-[.toaster]:!border-[rgba(220,38,38,0.18)] [&_[data-icon]]:!text-[#DC2626] [&_[data-description]]:!text-[#5c5c5c]',
          closeButton:
            '!absolute !top-2 !right-2 !left-auto ![transform:none] !size-6 !rounded-full !border-transparent !bg-transparent !text-[#5c5c5c] hover:!bg-[#f7f7f7] hover:!text-[#171717] transition-colors',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
