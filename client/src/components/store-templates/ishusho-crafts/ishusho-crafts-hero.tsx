import { ArrowRight, Sparkles } from 'lucide-react'

import { Link } from '@/i18n/navigation'

type IshushoCraftsHeroProps = {
  storeName: string
  tagline: string
  storefrontLabel: string
  ctaShop: string
  ctaBrowse: string
  itemsCountLabel: string
}

function HeroDecorPanel() {
  const cells = [
    'col-span-2 row-span-2',
    'col-span-1 row-span-1',
    'col-span-1 row-span-1',
    'col-span-2 row-span-1',
  ]

  return (
    <div
      className='pointer-events-none hidden lg:grid lg:grid-cols-2 lg:grid-rows-3 lg:gap-3'
      aria-hidden
    >
      {cells.map((span, index) => (
        <div
          key={index}
          className={`${span} overflow-hidden rounded-2xl border border-[var(--ic-border)] bg-[var(--ic-surface)] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]`}
          style={{
            background:
              index === 0
                ? 'linear-gradient(145deg, color-mix(in srgb, var(--ic-secondary) 22%, var(--ic-surface)), var(--ic-primary-light))'
                : index % 2 === 0
                  ? 'linear-gradient(160deg, var(--ic-primary-light), color-mix(in srgb, var(--ic-accent) 12%, var(--ic-surface)))'
                  : 'linear-gradient(200deg, var(--ic-surface), color-mix(in srgb, var(--ic-secondary) 8%, var(--ic-primary-light)))',
          }}
        />
      ))}
    </div>
  )
}

export function IshushoCraftsHero({
  storeName,
  tagline,
  storefrontLabel,
  ctaShop,
  ctaBrowse,
  itemsCountLabel,
}: IshushoCraftsHeroProps) {
  return (
    <section className='ic-hero relative overflow-hidden border-b border-[var(--ic-border)] bg-[var(--ic-bg)] text-left text-[var(--ic-ink)]'>
      <div
        className='pointer-events-none absolute inset-0 opacity-100'
        aria-hidden
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 85% 15%, color-mix(in srgb, var(--ic-secondary) 14%, transparent), transparent 55%), radial-gradient(ellipse 70% 55% at 10% 90%, color-mix(in srgb, var(--ic-accent) 10%, transparent), transparent 50%)',
        }}
      />

      <div className='relative mx-auto max-w-screen-2xl px-4 py-12 sm:px-6 sm:py-14 lg:px-8 lg:py-16'>
        <div className='grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(220px,340px)] lg:gap-12'>
          <div className='max-w-2xl'>
            <p className='inline-flex items-center gap-2 rounded-lg border border-[var(--ic-border)] bg-[var(--ic-surface)]/80 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--ic-secondary)] backdrop-blur-sm'>
              <Sparkles className='size-3.5 shrink-0' aria-hidden strokeWidth={2.25} />
              {storefrontLabel}
            </p>

            <h1 className='mt-5 font-[family-name:var(--font-ic-display)] text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-[3.25rem]'>
              <span className='bg-gradient-to-br from-[var(--ic-ink)] to-[var(--ic-muted)] bg-clip-text text-transparent'>
                {storeName}
              </span>
            </h1>

            <p className='mt-4 max-w-lg text-base leading-relaxed text-[var(--ic-muted)] sm:text-lg'>
              {tagline}
            </p>

            <p className='mt-4 inline-flex items-center rounded-lg border border-[var(--ic-border)] bg-[var(--ic-primary-light)]/60 px-3 py-1.5 text-sm font-semibold tabular-nums text-[var(--ic-secondary)]'>
              {itemsCountLabel}
            </p>

            <div className='mt-8 flex flex-wrap items-center gap-3'>
              <Link
                href='#products'
                className='ic-cta-primary inline-flex h-11 items-center justify-center gap-2 rounded-lg px-6 text-sm font-semibold transition-transform hover:-translate-y-0.5 active:scale-[0.98]'
              >
                {ctaShop}
                <ArrowRight className='size-4' aria-hidden strokeWidth={2.5} />
              </Link>
              <a
                href='#products'
                className='inline-flex h-11 items-center justify-center rounded-lg border border-[var(--ic-border)] bg-[var(--ic-surface)]/50 px-6 text-sm font-semibold text-[var(--ic-ink)] transition-colors hover:border-[color-mix(in_srgb,var(--ic-secondary)_45%,transparent)] hover:bg-[var(--ic-primary-light)] active:scale-[0.98]'
              >
                {ctaBrowse}
              </a>
            </div>
          </div>

          <HeroDecorPanel />
        </div>
      </div>
    </section>
  )
}
