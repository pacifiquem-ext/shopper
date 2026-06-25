'use client'

import { Check, MapPin, Package, ShieldCheck, Store, Truck } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffect, useMemo, useState } from 'react'

import { Link } from '@/i18n/navigation'
import { Button } from '@/components/ui/button'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { firstInStockVariant, formatRwf } from '@/lib/product-display'
import { cn } from '@/lib/utils'
import type { CatalogProductPublic } from '@/services/catalog.service'

import { QuickAddButton } from './quick-add-button'

export type ProductDetailsTheme = 'default' | 'vibrant-market' | 'ishusho-crafts'

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
      variantSelected: 'border-[var(--vm-secondary)] bg-[var(--vm-primary-light)] ring-2 ring-[var(--vm-secondary)]/35',
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
      variantSelected: 'border-[var(--ic-secondary)] bg-[var(--ic-primary-light)] ring-2 ring-[var(--ic-secondary)]/35',
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
    variantSelected: 'border-[#B76E5D] bg-[#EAE4DC]/70 ring-2 ring-[#B76E5D]/30',
  }
}

function quickAddClassForTemplate(theme: ProductDetailsTheme) {
  if (theme === 'vibrant-market') {
    return '!h-12 !rounded-xl !px-6 !bg-[var(--vm-secondary)] !text-[var(--vm-on-primary)] hover:!brightness-105'
  }
  if (theme === 'ishusho-crafts') {
    return '!h-12 !rounded-lg !px-6 !bg-[var(--ic-secondary)] !text-[var(--ic-on-secondary)] hover:!brightness-105'
  }
  return '!h-12 !rounded-full !px-6'
}

type ProductDetailsBodyProps = {
  product: CatalogProductPublic
  theme: ProductDetailsTheme
  /** Dashboard vendor preview — no cart actions. */
  preview?: boolean
}

export function ProductDetailsBody({ product, theme, preview = false }: ProductDetailsBodyProps) {
  const t = useTranslations('product')
  const tMarketplace = useTranslations('marketplace')
  const tPreview = useTranslations('dashboard.products.preview')
  const tQuickView = useTranslations('marketplace.quickView')
  const tokens = themeTokens(theme)
  const variants = product.variants ?? []
  const tags = product.tags ?? []

  const gallery = useMemo(
    () =>
      product.images.length > 0
        ? product.images
        : product.primaryImage
          ? [product.primaryImage]
          : [],
    [product.images, product.primaryImage],
  )

  const defaultVariant = firstInStockVariant(variants) ?? variants[0]
  const [activeImage, setActiveImage] = useState(0)
  const [selectedVariantId, setSelectedVariantId] = useState<string | undefined>(defaultVariant?.id)

  useEffect(() => {
    setActiveImage(0)
    setSelectedVariantId(defaultVariant?.id)
  }, [product.id, defaultVariant?.id])

  const selectedVariant = variants.find((v) => v.id === selectedVariantId) ?? defaultVariant
  const mainSrc = gallery[activeImage] ?? product.primaryImage ?? gallery[0]
  const cartImage = mainSrc ?? product.primaryImage ?? product.images[0] ?? null

  const displayPrice = selectedVariant?.price ?? product.priceFrom
  const displayCompareAt =
    selectedVariant?.compareAt ?? (selectedVariant ? null : product.compareAtFrom)
  const hasDiscount =
    displayCompareAt != null &&
    displayPrice != null &&
    displayCompareAt > displayPrice

  const hasMultipleVariants = variants.length > 1
  const titleClass =
    theme === 'ishusho-crafts'
      ? 'font-[family-name:var(--font-ic-display)] text-3xl font-semibold md:text-4xl'
      : theme === 'vibrant-market'
        ? 'text-3xl font-black md:text-4xl'
        : 'text-3xl font-bold md:text-4xl'

  const buildCartItem = (variant: (typeof variants)[number]) => ({
    productId: product.id,
    variantId: variant.id,
    storeId: product.store.id,
    storeName: product.store.displayName,
    name: product.name,
    sku: variant.sku,
    title: variant.title,
    price: variant.price,
    image: cartImage,
  })

  return (
    <div className='mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 py-10 lg:grid-cols-[1.15fr_0.85fr]'>
      <div className='space-y-4'>
        <div
          className={cn(
            'group overflow-hidden rounded-[1.75rem] border transition-shadow duration-500',
            tokens.border,
            tokens.surface,
            tokens.shadow,
            theme === 'default' &&
              'os-soft-pop hover:shadow-[0_2px_4px_rgba(43,43,43,0.04),0_24px_48px_rgba(43,43,43,0.10)]',
          )}
        >
          <AspectRatio ratio={1}>
            {mainSrc ? (
              <img
                src={mainSrc}
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

        {gallery.length > 1 ? (
          <div className='flex gap-2 overflow-x-auto pb-1'>
            {gallery.map((src, index) => (
              <button
                key={`${src}-${index}`}
                type='button'
                onClick={() => setActiveImage(index)}
                className={cn(
                  'relative size-20 shrink-0 overflow-hidden rounded-xl border-2 transition-opacity sm:size-24',
                  index === activeImage
                    ? cn(tokens.variantSelected, 'opacity-100')
                    : cn(tokens.border, 'border-transparent opacity-80 hover:opacity-100'),
                )}
                aria-label={tQuickView('photoThumbAria', { index: index + 1 })}
                aria-current={index === activeImage ? 'true' : undefined}
              >
                <img src={src} alt='' className='size-full object-cover' />
              </button>
            ))}
          </div>
        ) : null}

        {tags.length ? (
          <div className='flex flex-wrap gap-2'>
            {tags.slice(0, 10).map((tag) => (
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
        <div
          className={cn('space-y-3', theme === 'default' && 'os-fade-up')}
          style={theme === 'default' ? { animationDelay: '60ms' } : undefined}
        >
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

        {hasMultipleVariants ? (
          <div
            className={cn('space-y-3', theme === 'default' && 'os-fade-up')}
            style={theme === 'default' ? { animationDelay: '90ms' } : undefined}
          >
            <p className={cn('text-xs font-semibold uppercase tracking-[0.12em]', tokens.muted)}>
              {t('selectVariant')}
            </p>
            <div className='flex flex-wrap gap-2'>
              {variants.map((variant) => {
                const isSelected = variant.id === selectedVariantId
                const outOfStock = (variant.inventory?.available ?? 0) <= 0
                return (
                  <button
                    key={variant.id}
                    type='button'
                    onClick={() => setSelectedVariantId(variant.id)}
                    className={cn(
                      'rounded-full border px-4 py-2 text-sm font-medium transition-colors',
                      tokens.border,
                      tokens.surface,
                      tokens.ink,
                      isSelected && tokens.variantSelected,
                      outOfStock && 'opacity-60',
                    )}
                    aria-pressed={isSelected}
                  >
                    {variant.title}
                  </button>
                )
              })}
            </div>
          </div>
        ) : null}

        <div
          className={cn(
            'rounded-[1.5rem] border p-6 transition-shadow duration-500',
            tokens.border,
            tokens.surface,
            tokens.shadow,
            theme === 'default' &&
              'os-fade-up hover:shadow-[0_2px_4px_rgba(43,43,43,0.04),0_16px_36px_rgba(43,43,43,0.06)]',
          )}
          style={theme === 'default' ? { animationDelay: '110ms' } : undefined}
        >
          <div className='flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
            <div className='space-y-1'>
              <p className={cn('text-xs font-semibold uppercase tracking-[0.12em]', tokens.muted)}>
                {hasMultipleVariants && selectedVariant ? t('price') : t('startingFrom')}
              </p>
              {displayPrice != null ? (
                <div className='flex items-baseline gap-3'>
                  <p className={cn('text-3xl font-bold tracking-tight tabular-nums', tokens.ink)}>
                    {formatRwf(displayPrice)}
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
                      {formatRwf(displayCompareAt as number)} RWF
                    </p>
                  ) : null}
                </div>
              ) : (
                <p className={cn('text-lg', tokens.muted)}>—</p>
              )}
              {selectedVariant?.inventory ? (
                <p className={cn('text-xs', tokens.muted)}>
                  {t('inStock', { count: selectedVariant.inventory.available })}
                </p>
              ) : null}
            </div>

            {selectedVariant && !preview ? (
              <QuickAddButton
                label={t('addToCart')}
                addedLabel={tMarketplace('addedToCart')}
                toastTitle={tMarketplace('toastAddedToCart')}
                className={cn(
                  quickAddClassForTemplate(theme),
                  theme === 'default' && tokens.ctaShadow,
                  'w-full sm:w-auto',
                )}
                fullWidth={theme === 'vibrant-market'}
                item={buildCartItem(selectedVariant)}
              />
            ) : preview && selectedVariant ? (
              <p
                className={cn(
                  'rounded-full border px-4 py-3 text-center text-xs font-medium sm:text-left',
                  tokens.border,
                  tokens.surfaceSoft,
                  tokens.muted,
                )}
              >
                {tPreview('cartHint')}
              </p>
            ) : null}
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

        {hasMultipleVariants ? (
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
            <Accordion type='single' collapsible defaultValue='variants'>
              <AccordionItem value='variants' className='border-b-0 px-6'>
                <AccordionTrigger className={cn('hover:no-underline', tokens.ink)}>
                  {t('variants')}
                </AccordionTrigger>
                <AccordionContent className='pb-6'>
                  <div className='grid gap-3'>
                    {variants.map((v) => (
                      <div
                        key={v.id}
                        className={cn(
                          'flex flex-wrap items-center justify-between gap-2 rounded-2xl border px-4 py-3',
                          tokens.border,
                          tokens.surfaceSoft,
                          v.id === selectedVariantId && tokens.variantSelected,
                        )}
                      >
                        <div className='min-w-0'>
                          <p className={cn('font-semibold', tokens.ink)}>{v.title}</p>
                          <p className={cn('text-xs', tokens.muted)}>{v.sku}</p>
                        </div>
                        <div className='flex flex-wrap items-center gap-3'>
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
                          {!preview ? (
                            <QuickAddButton
                              label={tMarketplace('addToCartAria')}
                              addedLabel={tMarketplace('addedToCart')}
                              toastTitle={tMarketplace('toastAddedToCart')}
                              className={quickAddClassForTemplate(theme)}
                              item={buildCartItem(v)}
                            />
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export function ProductDetailsTopBar({
  theme,
  backLabel,
  approvedLabel,
  backHref = '/shop',
}: {
  theme: ProductDetailsTheme
  backLabel: string
  approvedLabel: string
  backHref?: string
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
          <Link href={backHref}>{backLabel}</Link>
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
