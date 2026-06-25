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
            'group toast !min-h-0 !gap-2 !py-3 !px-4 group-[.toaster]:rounded-2xl group-[.toaster]:border group-[.toaster]:border-[rgba(43,43,43,0.08)] group-[.toaster]:bg-white/95 group-[.toaster]:text-[#2B2B2B] group-[.toaster]:shadow-[0_8px_28px_rgba(43,43,43,0.12)] group-[.toaster]:backdrop-blur-md',
          title: 'group-[.toast]:text-sm group-[.toast]:font-semibold group-[.toast]:leading-tight',
          description:
            'group-[.toast]:text-xs group-[.toast]:leading-snug group-[.toast]:text-[#6E6A66]',
          actionButton:
            'group-[.toast]:bg-[#B76E5D] group-[.toast]:text-white',
          cancelButton:
            'group-[.toast]:bg-[#F5F1EB] group-[.toast]:text-[#2B2B2B]',
          success:
            'group-[.toaster]:!bg-white/95 group-[.toaster]:!text-[#2B2B2B] group-[.toaster]:!border-[rgba(43,43,43,0.08)] [&_[data-icon]]:!text-[#7D8F69] [&_[data-description]]:!text-[#6E6A66]',
          error:
            'group-[.toaster]:!bg-white/95 group-[.toaster]:!text-[#2B2B2B] group-[.toaster]:!border-[rgba(220,38,38,0.18)] [&_[data-icon]]:!text-[#DC2626] [&_[data-description]]:!text-[#6E6A66]',
          closeButton:
            '!absolute !top-2 !right-2 !left-auto ![transform:none] !size-6 !rounded-full !border-transparent !bg-transparent !text-[#6E6A66] hover:!bg-[#F5F1EB] hover:!text-[#2B2B2B] transition-colors',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
