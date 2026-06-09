type IshushoCraftsPromoStripProps = {
  messages: string[]
  ariaLabel: string
}

export function IshushoCraftsPromoStrip({ messages, ariaLabel }: IshushoCraftsPromoStripProps) {
  if (messages.length === 0) return null

  const track = [...messages, ...messages]

  return (
    <div
      className='overflow-hidden border-b border-[var(--ic-border)] bg-[var(--ic-primary)]'
      role='region'
      aria-label={ariaLabel}
    >
      <div className='ic-promo-track flex w-max items-center gap-10 py-2.5 pl-4'>
        {track.map((message, index) => (
          <span
            key={`${message}-${index}`}
            className='inline-flex shrink-0 items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--ic-secondary)] sm:text-xs'
          >
            <span
              className='size-1.5 shrink-0 rounded-sm bg-[var(--ic-accent)]'
              aria-hidden
            />
            {message}
          </span>
        ))}
      </div>
    </div>
  )
}
