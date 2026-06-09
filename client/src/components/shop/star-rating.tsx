import { Star } from 'lucide-react'

import { cn } from '@/lib/utils'

interface StarRatingProps {
  rating: number
  ariaLabel: string
  size?: number
  className?: string
  filledClassName?: string
}

export function StarRating({
  rating,
  ariaLabel,
  size = 14,
  className,
  filledClassName = 'text-amber-400',
}: StarRatingProps) {
  const clamped = Math.max(0, Math.min(5, rating))
  const fillPercent = (clamped / 5) * 100

  return (
    <div
      className={cn(
        'flex items-center gap-1.5 text-[11px] font-medium tracking-tight tabular-nums',
        className,
      )}
      role='img'
      aria-label={ariaLabel}
    >
      <span className='relative inline-flex' aria-hidden>
        <span className='inline-flex text-[#EAE4DC]'>
          {Array.from({ length: 5 }).map((_, index) => (
            <Star
              key={`bg-${index}`}
              style={{ width: size, height: size }}
              fill='currentColor'
              strokeWidth={0}
            />
          ))}
        </span>
        <span
          className={cn('absolute inset-y-0 left-0 inline-flex overflow-hidden', filledClassName)}
          style={{ width: `${fillPercent}%` }}
        >
          {Array.from({ length: 5 }).map((_, index) => (
            <Star
              key={`fg-${index}`}
              style={{ width: size, height: size, flex: '0 0 auto' }}
              fill='currentColor'
              strokeWidth={0}
            />
          ))}
        </span>
      </span>
    </div>
  )
}
