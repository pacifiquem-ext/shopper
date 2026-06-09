import { Check, MapPin, Package, ShieldCheck, Store, Truck } from 'lucide-react'

import { Link } from '@/i18n/navigation'
import { Button } from '@/components/ui/button'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { cn } from '@/lib/utils'
import type { CatalogProductPublic } from '@/services/catalog.service'

export type ProductDetailsTheme = 'default' | 'vibrant-market' | 'ishusho-crafts'

function formatRwf(amount: number): string {
  return new Intl.NumberFormat('en-RW', { maximumFractionDigits: 0 }).format(amount)
}

function themeTokens(theme: ProductDetailsTheme) {
  if (theme === 'vibrant-market') {
    return {
      ink: 'text-[var(--vm-ink)]',
      muted: 'text-[var(--vm-muted)]',
      border: 'border-[var(--vm-border)]',
      surface: 'bg-[var(--vm-surface)]',
      surfaceSoft: 'bg-[var(--vm-primary-light)]',
      accent: 'text-[var(--vm-secondary)]',
      accentBg: 'bg-[var(--vm-secondary)]',
      accentHover: 'hover:brightness-95',
      icon: 'text-[var(--vm-accent)]',
      shadow: 'shadow-[0_6px_22px_rgba(15,23,42,0.08)]',
      ctaShadow: 'shadow-[0_8px_22px_color-mix(in_srgb,var(--vm-secondary)_26%,transparent)]',
      badge: 'border-[var(--vm-border)] bg-[var(--vm-primary-light)] text-[var(--vm-accent)]',
      mediaEmpty: 'bg-[var(--vm-primary-light)]',
    }
  }
  if (theme === 'ishusho-crafts') {
    return {
      ink: 'text-[var(--ic-ink)]',
      muted: 'text-[var(--ic-muted)]',
      border: 'border-[var(--ic-border)]',
      surface: 'bg-[var(--ic-surface)]',
      surfaceSoft: 'bg-[var(--ic-primary-light)]/80',
      accent: 'text-[var(--ic-secondary)]',
      accentBg: 'bg-[var(--ic-secondary)]',
      accentHover: 'hover:brightness-105',
      icon: 'text-[var(--ic-accent)]',
      shadow: 'shadow-[0_8px_32px_rgba(0,0,0,0.35)]',
      ctaShadow: 'shadow-[0_8px_24px_color-mix(in_srgb,var(--ic-secondary)_28%,transparent)]',
      badge: 'border-[var(--ic-border)] bg-[var(--ic-primary-light)] text-[var(--ic-secondary)]',
      mediaEmpty: 'bg-[var(--ic-primary-light)]',
    }
  }
  return {
    ink: 'text-[#2B2B2B]',
    muted: 'text-[#6E6A66]',
    border: 'border-[rgba(43,43,43,0.08)]',
    surface: 'bg-white/60 backdrop-blur-md',
    surfaceSoft: 'bg-[#EAE4DC]/55',
    accent: 'text-[#7D8F69]',
    accentBg: 'bg-[#B76E5D]',
    accentHover: 'hover:bg-[#A66250]',
    icon: 'text-[#7D8F69]',
    shadow: 'shadow-[0_1px_2px_rgba(43,43,43,0.03)]',
    ctaShadow: 'shadow-[0_8px_22px_rgba(183,110,93,0.28)]',
    badge: 'border-[rgba(43,43,43,0.08)] bg-white/60 text-[#2B2B2B]',
    mediaEmpty: 'bg-[#EAE4DC]',
  }
}

type ProductDetailsBodyProps = {
  product: CatalogProductPublic
  theme: ProductDetailsTheme
  t: (key: string, values?: Record<string, string | number>) => string
}

export function ProductDetailsBody({ product, theme, t }: ProductDetailsBodyProps) {
  const tokens = themeTokens(theme)
  const img = product.primaryImage ?? product.images[0]
  const hasDiscount =
    product.compareAtFrom != null &&
    product.priceFrom != null &&
    product.compareAtFrom > product.priceFrom

  const titleClass =
    theme === 'ishusho-crafts'
      ? 'font-[family-name:var(--font-ic-display)] text-3xl font-semibold md:text-4xl'
      : theme === 'vibrant-market'
        ? 'text-3xl font-black md:text-4xl'
        : 'text-3xl font-bold md:text-4xl'

  return (
    <div className='mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 py-10 lg:grid-cols-[1.15fr_0.85fr]'>
      <div className='space-y-4'>
        <div
          className={cn(
            'group overflow-hidden rounded-[1.75rem] border transition-shadow duration-500',
            tokens.border,
            tokens.surface,
            tokens.shadow,
            theme === 'default' && 'os-soft-pop hover:shadow-[0_2px_4px_rgba(43,43,43,0.04),0_24px_48px_rgba(43,43,43,0.10)]',
          )}
        >
          <AspectRatio ratio={1}>
            {img ? (
              <img
                src={img}
                alt={product.name}
                className={cn(
                  'size-full object-cover',
                  theme === 'default' &&
                    'transition-transform duration-[900ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover:scale-[1.04]',
                )}
              />
            ) : (
              <div
                className={cn(
                  'flex size-full items-center justify-center',
                  tokens.mediaEmpty,
                  tokens.muted,
                )}
              >
                <Package className='size-12' aria-hidden strokeWidth={1.25} />
              </div>
            )}
          </AspectRatio>
        </div>

        {product.tags.length ? (
          <div className='flex flex-wrap gap-2'>
            {product.tags.slice(0, 10).map((tag) => (
              <span
                key={tag}
                className={cn(
                  'inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium',
                  tokens.border,
                  tokens.surface,
                  tokens.muted,
                )}
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      <div className='space-y-6'>
        <div className={cn('space-y-3', theme === 'default' && 'os-fade-up')} style={theme === 'default' ? { animationDelay: '60ms' } : undefined}>
          <div className='flex flex-wrap items-center gap-2'>
            <span
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em]',
                tokens.badge,
              )}
            >
              <Store className={cn('size-3.5', tokens.icon)} aria-hidden strokeWidth={2.25} />
              {product.store.displayName}
            </span>
            <span
              className={cn(
                'inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em]',
                tokens.border,
                tokens.surfaceSoft,
                tokens.muted,
              )}
            >
              {product.category}
            </span>
          </div>
          <h1 className={cn('leading-tight tracking-tight', titleClass, tokens.ink)}>
            {product.name}
          </h1>
          {product.description ? (
            <p className={cn('text-[15px] leading-relaxed', tokens.muted)}>{product.description}</p>
          ) : null}
        </div>

        <div
          className={cn(
            'rounded-[1.5rem] border p-6 transition-shadow duration-500',
            tokens.border,
            tokens.surface,
            tokens.shadow,
            theme === 'default' && 'os-fade-up hover:shadow-[0_2px_4px_rgba(43,43,43,0.04),0_16px_36px_rgba(43,43,43,0.06)]',
          )}
          style={theme === 'default' ? { animationDelay: '110ms' } : undefined}
        >
          <div className='flex items-end justify-between gap-4'>
            <div className='space-y-1'>
              <p className={cn('text-xs font-semibold uppercase tracking-[0.12em]', tokens.muted)}>
                {t('startingFrom')}
              </p>
              {product.priceFrom != null ? (
                <div className='flex items-baseline gap-3'>
                  <p className={cn('text-3xl font-bold tracking-tight tabular-nums', tokens.ink)}>
                    {formatRwf(product.priceFrom)}
                    <span
                      className={cn(
                        'ml-1.5 text-[11px] font-semibold uppercase tracking-[0.1em]',
                        tokens.muted,
                      )}
                    >
                      RWF
                    </span>
                  </p>
                  {hasDiscount ? (
                    <p className={cn('text-sm font-medium tabular-nums line-through', tokens.muted)}>
                      {formatRwf(product.compareAtFrom as number)} RWF
                    </p>
                  ) : null}
                </div>
              ) : (
                <p className={cn('text-lg', tokens.muted)}>—</p>
              )}
            </div>

            <Button
              type='button'
              className={cn(
                'h-12 px-6',
                theme === 'ishusho-crafts' && `rounded-lg ${tokens.accentBg} ${tokens.accentHover} ${tokens.ctaShadow} text-[var(--ic-on-secondary)]`,
                theme !== 'ishusho-crafts' && 'rounded-full',
                theme === 'vibrant-market' && `${tokens.accentBg} ${tokens.accentHover} ${tokens.ctaShadow} text-white`,
                theme === 'default' && `${tokens.accentBg} ${tokens.accentHover} ${tokens.ctaShadow} text-white transition-transform hover:-translate-y-0.5 active:scale-[0.98]`,
              )}
            >
              {t('addToCart')}
            </Button>
          </div>

          <div className={cn('my-5 h-px', tokens.border)} aria-hidden />

          <ul className={cn('grid gap-3 text-sm', tokens.ink)}>
            <li className='flex items-center gap-2.5'>
              <span
                className={cn(
                  'inline-flex size-6 items-center justify-center rounded-full border',
                  tokens.border,
                  tokens.surfaceSoft,
                )}
              >
                <Check className={cn('size-3.5', tokens.icon)} aria-hidden strokeWidth={2.5} />
              </span>
              {t('fromStore', { name: product.store.displayName })}
            </li>
            {product.deliveryEnabled ? (
              <li className='flex items-center gap-2.5'>
                <span
                  className={cn(
                    'inline-flex size-6 items-center justify-center rounded-full border',
                    tokens.border,
                    tokens.surfaceSoft,
                  )}
                >
                  <Truck className={cn('size-3.5', tokens.icon)} aria-hidden strokeWidth={2.25} />
                </span>
                {t('deliveryEnabled')}
              </li>
            ) : (
              <li className={cn('flex items-center gap-2.5', tokens.muted)}>
                <span
                  className={cn(
                    'inline-flex size-6 items-center justify-center rounded-full border',
                    tokens.border,
                    tokens.surfaceSoft,
                  )}
                >
                  <Truck className={cn('size-3.5', tokens.muted)} aria-hidden strokeWidth={2.25} />
                </span>
                {t('deliveryDisabled')}
              </li>
            )}
            {product.deliveryLocation ? (
              <li className='flex items-center gap-2.5'>
                <span
                  className={cn(
                    'inline-flex size-6 items-center justify-center rounded-full border',
                    tokens.border,
                    tokens.surfaceSoft,
                  )}
                >
                  <MapPin className={cn('size-3.5', tokens.icon)} aria-hidden strokeWidth={2.25} />
                </span>
                {t('deliveryLocation', { location: product.deliveryLocation })}
              </li>
            ) : null}
          </ul>
        </div>

        <div
          className={cn(
            'overflow-hidden rounded-[1.5rem] border',
            tokens.border,
            tokens.surface,
            tokens.shadow,
            theme === 'default' && 'os-fade-up',
          )}
          style={theme === 'default' ? { animationDelay: '160ms' } : undefined}
        >
          <Accordion type='single' collapsible>
            <AccordionItem value='variants' className='border-b-0 px-6'>
              <AccordionTrigger className={cn('hover:no-underline', tokens.ink)}>
                {t('variants')}
              </AccordionTrigger>
              <AccordionContent className='pb-6'>
                <div className='grid gap-3'>
                  {product.variants.map((v) => (
                    <div
                      key={v.id}
                      className={cn(
                        'flex flex-wrap items-center justify-between gap-2 rounded-2xl border px-4 py-3',
                        tokens.border,
                        tokens.surfaceSoft,
                      )}
                    >
                      <div className='min-w-0'>
                        <p className={cn('font-semibold', tokens.ink)}>{v.title}</p>
                        <p className={cn('text-xs', tokens.muted)}>{v.sku}</p>
                      </div>
                      <div className='flex items-center gap-3'>
                        <p className={cn('font-semibold tabular-nums', tokens.ink)}>
                          {formatRwf(v.price)}
                          <span
                            className={cn(
                              'ml-1 text-[10px] font-semibold uppercase tracking-[0.1em]',
                              tokens.muted,
                            )}
                          >
                            RWF
                          </span>
                        </p>
                        {v.inventory ? (
                          <span
                            className={cn(
                              'inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em]',
                              tokens.border,
                              tokens.surface,
                              tokens.muted,
                            )}
                          >
                            {t('inStock', { count: v.inventory.available })}
                          </span>
                        ) : (
                          <span
                            className={cn(
                              'inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em]',
                              tokens.border,
                              tokens.surface,
                              tokens.muted,
                            )}
                          >
                            {t('stockUnknown')}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </div>
  )
}

export function ProductDetailsTopBar({
  theme,
  backLabel,
  approvedLabel,
}: {
  theme: ProductDetailsTheme
  backLabel: string
  approvedLabel: string
}) {
  const tokens = themeTokens(theme)

  return (
    <div
      className={cn(
        'border-b',
        tokens.border,
        theme === 'default' && 'bg-[#F5F1EB]',
        theme === 'vibrant-market' && 'bg-[var(--vm-bg)]',
        theme === 'ishusho-crafts' && 'bg-[var(--ic-bg)]',
      )}
    >
      <div className='mx-auto flex max-w-6xl items-center justify-between px-4 py-6'>
        <Button
          asChild
          variant='ghost'
          className={cn(
            'rounded-full',
            tokens.ink,
            theme === 'ishusho-crafts'
              ? 'hover:bg-[var(--ic-primary-light)] hover:text-[var(--ic-secondary)]'
              : theme === 'vibrant-market'
                ? 'hover:bg-[var(--vm-primary-light)] hover:text-[var(--vm-secondary)]'
                : 'hover:bg-white/60',
          )}
        >
          <Link href='/shop'>{backLabel}</Link>
        </Button>
        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold',
            tokens.badge,
            theme === 'default' && 'shadow-[0_1px_2px_rgba(43,43,43,0.03)] backdrop-blur-md',
          )}
        >
          <ShieldCheck className={cn('size-3.5', tokens.icon)} aria-hidden strokeWidth={2.25} />
          {approvedLabel}
        </span>
      </div>
    </div>
  )
}
