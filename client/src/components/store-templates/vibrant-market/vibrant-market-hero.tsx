import { ArrowRight, Sparkles, TrendingUp } from 'lucide-react'

import { Link } from '@/i18n/navigation'

type VibrantMarketHeroProps = {
  eyebrow: string
  storeName: string
  tagline: string
  ctaStartShopping: string
  ctaTrendingNow: string
  trendingHref: string
}

function splitStoreName(name: string): { first: string; rest: string } {
  const trimmed = name.trim()
  const space = trimmed.indexOf(' ')
  if (space === -1) {
    return { first: trimmed, rest: '' }
  }
  return { first: trimmed.slice(0, space), rest: trimmed.slice(space + 1).trim() }
}

export function VibrantMarketHero({
  eyebrow,
  storeName,
  tagline,
  ctaStartShopping,
  ctaTrendingNow,
  trendingHref,
}: VibrantMarketHeroProps) {
  const { first, rest } = splitStoreName(storeName)

  return (
    <section className='relative overflow-hidden border-b border-[var(--vm-border)] bg-[var(--vm-surface)]'>
      <div
        className='pointer-events-none absolute inset-0 opacity-90'
        aria-hidden
        style={{
          background:
            'radial-gradient(ellipse 90% 70% at 100% 0%, color-mix(in srgb, var(--vm-secondary) 12%, transparent), transparent 55%), radial-gradient(ellipse 70% 60% at 0% 100%, color-mix(in srgb, var(--vm-accent) 8%, transparent), transparent 50%)',
        }}
      />
      <div className='relative mx-auto max-w-screen-2xl px-3 py-10 sm:px-4 sm:py-12 lg:px-5 lg:py-14'>
        <div className='max-w-2xl'>
          <p className='inline-flex items-center gap-2 rounded-full border border-[var(--vm-secondary)]/25 bg-[var(--vm-primary-light)] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--vm-secondary)] sm:text-xs'>
            <Sparkles className='size-3.5 shrink-0' aria-hidden />
            {eyebrow}
          </p>

          <h1 className='mt-4 text-3xl font-black leading-[1.05] tracking-tight text-[var(--vm-ink)] sm:text-4xl lg:text-[2.75rem] lg:leading-[1.08]'>
            <span>{first}</span>
            {rest ? (
              <>
                {' '}
                <span className='text-[var(--vm-secondary)]'>{rest}</span>
              </>
            ) : null}
          </h1>

          <p className='mt-4 max-w-lg text-base leading-relaxed text-[var(--vm-muted)] sm:text-lg'>
            {tagline}
          </p>

          <div className='mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center'>
            <Link
              href='#products'
              className='inline-flex h-12 items-center justify-center gap-2 rounded-10 bg-[var(--vm-secondary)] px-6 text-sm font-bold text-[var(--vm-on-primary)] shadow-[0_8px_24px_color-mix(in_srgb,var(--vm-secondary)_35%,transparent)] transition-transform hover:-translate-y-0.5 hover:brightness-105 active:scale-[0.98] sm:h-[3.25rem] sm:px-7 sm:text-base'
            >
              {ctaStartShopping}
              <ArrowRight className='size-4 shrink-0' aria-hidden strokeWidth={2.5} />
            </Link>
            <Link
              href={trendingHref}
              className='inline-flex h-12 items-center justify-center gap-2 rounded-10 border border-[var(--vm-border)] bg-[var(--vm-surface)] px-6 text-sm font-bold text-[var(--vm-primary)] transition-colors hover:border-[var(--vm-secondary)]/40 hover:bg-[var(--vm-primary-light)] active:scale-[0.98] sm:h-[3.25rem] sm:px-7 sm:text-base'
            >
              <TrendingUp className='size-4 shrink-0 text-[var(--vm-secondary)]' aria-hidden strokeWidth={2.25} />
              {ctaTrendingNow}
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
