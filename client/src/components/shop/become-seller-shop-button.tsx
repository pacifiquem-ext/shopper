import { Store } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Link } from '@/i18n/navigation'
import { merchantSignupHref } from '@/lib/auth-return-url'
import { cn } from '@/lib/utils'

interface BecomeSellerShopButtonProps {
  label: string
  /** `left` = default (shop listing). `nearCart` = aligned beside the cart control. */
  position?: 'left' | 'nearCart'
  className?: string
}

export function BecomeSellerShopButton({
  label,
  position = 'left',
  className,
}: BecomeSellerShopButtonProps) {
  return (
    <div className='pointer-events-none fixed inset-x-0 top-4 z-50 sm:top-6'>
      <div className='mx-auto flex w-full max-w-screen-2xl px-3 sm:px-4 lg:px-5'>
        <div
          className={cn(
            'pointer-events-auto flex w-full',
            position === 'nearCart' ? 'justify-end' : 'justify-start',
          )}
        >
          <Button
            asChild
            type='button'
            className={cn(
              'h-10 gap-0 rounded-full border border-[#B76E5D]/25 bg-[#B76E5D] px-0 text-sm font-semibold text-white shadow-[0_8px_28px_rgba(183,110,93,0.35),0_2px_6px_rgba(43,43,43,0.08)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#A66250] hover:shadow-[0_12px_32px_rgba(183,110,93,0.4)] active:scale-95 sm:h-11 sm:gap-2 sm:px-5',
              position === 'nearCart' && 'mr-12 sm:mr-14',
              className,
            )}
          >
            <Link
              href={merchantSignupHref() as '/signup'}
              prefetch={false}
              aria-label={label}
              className='inline-flex size-full items-center justify-center gap-2 px-3 sm:px-0'
            >
              <Store className='size-4 shrink-0 sm:size-5' aria-hidden strokeWidth={2} />
              <span className='hidden sm:inline'>{label}</span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
