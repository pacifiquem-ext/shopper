import { RiArrowRightLine, RiSparkling2Line } from '@remixicon/react'
import { Link } from '@/i18n/navigation'

type Props = {
  storeName: string
  tagline: string
  eyebrow: string
  ctaShop: string
  ctaBrowse: string
}

export function ClassicMarketHero({ storeName, tagline, eyebrow, ctaShop, ctaBrowse }: Props) {
  return (
    <section className="relative overflow-hidden border-b border-[var(--kc-border)] bg-[var(--kc-surface)]">
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          background:
            'radial-gradient(ellipse 80% 70% at 90% -10%, color-mix(in srgb, var(--kc-secondary) 16%, transparent), transparent 55%), radial-gradient(ellipse 60% 50% at 0% 100%, color-mix(in srgb, var(--kc-accent) 8%, transparent), transparent 50%)',
        }}
      />
      <div className="relative mx-auto grid max-w-screen-2xl gap-10 px-4 py-12 sm:px-6 sm:py-14 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:px-8 lg:py-16">
        <div className="max-w-xl">
          <p className="inline-flex items-center gap-2 rounded-full bg-[color-mix(in_srgb,var(--kc-secondary)_12%,transparent)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--kc-secondary)]">
            <RiSparkling2Line className="size-3.5" />
            {eyebrow}
          </p>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-[var(--kc-ink)] sm:text-5xl lg:text-[3.25rem] lg:leading-[1.08]">
            {storeName}
          </h1>
          <p className="mt-4 max-w-md text-base leading-relaxed text-[var(--kc-muted)] sm:text-lg">
            {tagline}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="#products"
              className="inline-flex h-11 items-center gap-2 rounded-10 bg-[var(--kc-secondary)] px-5 text-sm font-semibold text-[var(--kc-on-primary)] shadow-[0_8px_24px_color-mix(in_srgb,var(--kc-secondary)_28%,transparent)] transition hover:-translate-y-0.5 hover:brightness-105 active:scale-[0.98]"
            >
              {ctaShop}
              <RiArrowRightLine className="size-4" />
            </Link>
            <a
              href="#products"
              className="inline-flex h-11 items-center rounded-10 border border-[var(--kc-border)] bg-[var(--kc-surface)] px-5 text-sm font-semibold text-[var(--kc-ink)] transition hover:bg-[var(--kc-primary-light)] active:scale-[0.98]"
            >
              {ctaBrowse}
            </a>
          </div>
        </div>

        <div className="relative hidden lg:block" aria-hidden>
          <div className="grid grid-cols-2 gap-3">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`overflow-hidden rounded-20 border border-[var(--kc-border)] bg-[var(--kc-primary-light)] shadow-[0_1px_2px_rgba(23,23,23,0.04)] ${i === 0 ? 'row-span-2 min-h-[240px]' : 'min-h-[112px]'}`}
                style={{
                  background:
                    i === 0
                      ? 'linear-gradient(145deg, color-mix(in srgb, var(--kc-secondary) 18%, white), var(--kc-primary-light))'
                      : i % 2
                        ? 'linear-gradient(160deg, white, color-mix(in srgb, var(--kc-accent) 10%, white))'
                        : 'linear-gradient(200deg, var(--kc-primary-light), color-mix(in srgb, var(--kc-secondary) 8%, white))',
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
