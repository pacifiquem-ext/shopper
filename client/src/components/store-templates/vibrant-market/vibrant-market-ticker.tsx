'use client'

import { Sparkles, Truck, Zap } from 'lucide-react'

type VibrantMarketTickerProps = {
  messages: string[]
  ariaLabel: string
}

const TICKER_ICONS = [Truck, Zap, Sparkles] as const

export function VibrantMarketTicker({ messages, ariaLabel }: VibrantMarketTickerProps) {
  if (messages.length === 0) return null

  const loop = [...messages, ...messages]

  return (
    <div
      className='overflow-hidden border-b border-[var(--vm-border)] bg-[color-mix(in_srgb,var(--vm-accent)_11%,var(--vm-surface))]'
      role='region'
      aria-label={ariaLabel}
    >
      <div className='vm-ticker-track flex w-max items-center gap-10 py-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--vm-accent)] sm:gap-12 sm:py-2.5 sm:text-[11px]'>
        {loop.map((message, index) => {
          const Icon = TICKER_ICONS[index % TICKER_ICONS.length]
          return (
            <span key={`${message}-${index}`} className='inline-flex shrink-0 items-center gap-2'>
              <Icon className='size-3 shrink-0 opacity-80' aria-hidden strokeWidth={2.25} />
              {message}
            </span>
          )
        })}
      </div>
    </div>
  )
}
