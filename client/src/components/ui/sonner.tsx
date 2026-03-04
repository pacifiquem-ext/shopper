'use client'

import { useTheme } from 'next-themes'
import { Toaster as Sonner } from 'sonner'

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg',
          title: 'group-[.toast]:font-bold group-[.toast]:text-base',
          description: 'group-[.toast]:text-muted-foreground group-[.toast]:text-sm',
          actionButton: 'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
          cancelButton: 'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
          success:
            'group-[.toaster]:!bg-success-primary group-[.toaster]:!text-success-foreground group-[.toaster]:!border-success-secondary [&_[data-description]]:!text-success-foreground/90 [&_[data-close-button]]:!bg-transparent hover:[&_[data-close-button]]:!bg-white/20 [&_svg]:!text-success-foreground',
          error:
            'group-[.toaster]:!bg-error-primary group-[.toaster]:!text-error-foreground group-[.toaster]:!border-error-secondary [&_[data-description]]:!text-error-foreground/90 [&_[data-close-button]]:!bg-transparent hover:[&_[data-close-button]]:!bg-white/20 [&_svg]:!text-error-foreground',
          closeButton:
            '!absolute !top-2 !right-2 !left-auto ![transform:none] !bg-transparent !border-transparent !text-inherit hover:!bg-black/5 dark:hover:!bg-white/10 transition-colors',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
