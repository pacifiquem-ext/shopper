import { Star } from 'lucide-react'

import { cn } from '@/lib/utils'

interface StarRatingProps {
  rating: number
  reviewsLabel?: string
  ariaLabel: string
  size?: number
  className?: string
}

export function StarRating({
  rating,
  reviewsLabel,
  ariaLabel,
  size = 14,
  className,
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
      <span className='text-[#2B2B2B]'>{clamped.toFixed(1)}</span>

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
          className='absolute inset-y-0 left-0 inline-flex overflow-hidden text-[#7D8F69]'
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

      {reviewsLabel ? (
        <>
          <span aria-hidden className='size-1 rounded-full bg-[rgba(43,43,43,0.15)]' />
          <span className='font-normal text-[#6E6A66]'>{reviewsLabel}</span>
        </>
      ) : null}
    </div>
  )
}
