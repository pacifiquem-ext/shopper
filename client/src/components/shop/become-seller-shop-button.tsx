import { Store } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Link } from '@/i18n/navigation'
import { merchantSignupHref } from '@/lib/auth-return-url'
import { cn } from '@/lib/utils'

interface BecomeSellerShopButtonProps {
  label: string
  /** `left` = default (shop listing). `nearCart` = fixed to the left of the cart (product page). */
  position?: 'left' | 'nearCart'
  className?: string
}

export function BecomeSellerShopButton({ label, position = 'left', className }: BecomeSellerShopButtonProps) {
  const positionClass =
    position === 'nearCart'
      ? 'right-[calc(1.25rem+3.5rem+0.75rem)] left-auto sm:right-[calc(1.5rem+3.5rem+0.75rem)]'
      : 'left-5 right-auto sm:left-6'

  return (
    <Button
      asChild
      type='button'
      className={cn(
        'fixed top-5 z-50 h-12 gap-2 rounded-full border border-[#B76E5D]/25 bg-[#B76E5D] px-4 text-sm font-semibold text-white shadow-[0_8px_28px_rgba(183,110,93,0.35),0_2px_6px_rgba(43,43,43,0.08)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#A66250] hover:shadow-[0_12px_32px_rgba(183,110,93,0.4)] active:scale-95 sm:top-6 sm:h-14 sm:px-5',
        positionClass,
        className,
      )}
    >
      <Link
        href={merchantSignupHref() as '/signup'}
        prefetch={false}
        className='inline-flex items-center gap-2'
      >
        <Store className='size-4 shrink-0 sm:size-5' aria-hidden strokeWidth={2} />
        <span className='max-w-[9.5rem] truncate sm:max-w-none'>{label}</span>
      </Link>
    </Button>
  )
}
