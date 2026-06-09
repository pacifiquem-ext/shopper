'use client'

import { Check, MapPin, Package, Truck } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'

import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/utils'
import { formatRwf } from '@/lib/product-display'
import type { CatalogProductPublic } from '@/services/catalog.service'
import { ISHUSHO_CRAFTS_COLORS, VIBRANT_MARKET_COLORS } from '@/lib/store-templates'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

import { QuickAddButton } from './quick-add-button'
import type { ProductCardLabels } from './product-card'

function formatRwfLocal(amount: number): string {
  return new Intl.NumberFormat('en-RW', { maximumFractionDigits: 0 }).format(amount)
}

function quickAddClassForTemplate(template: 'default' | 'vibrant-market' | 'ishusho-crafts') {
  if (template === 'vibrant-market') {
    return '!bg-[var(--vm-secondary)] !text-[var(--vm-on-primary)] hover:!brightness-105'
  }
  if (template === 'ishusho-crafts') {
    return '!bg-[var(--ic-secondary)] !text-[var(--ic-on-secondary)] hover:!brightness-105'
  }
  return ''
}

interface ProductQuickViewSheetProps {
  product: CatalogProductPublic | null
  labels: ProductCardLabels | null
  open: boolean
  onOpenChange: (open: boolean) => void
  accentColor?: string
  theme?: 'light' | 'dark'
  /** Match quick view visuals to a store template. */
  template?: 'default' | 'vibrant-market' | 'ishusho-crafts'
  showFullPageLink?: boolean
}

export function ProductQuickViewSheet({
  product,
  labels,
  open,
  onOpenChange,
  accentColor,
  theme = 'light',
  template = 'default',
  showFullPageLink = true,
}: ProductQuickViewSheetProps) {
  const resolvedTemplate = template === 'default' && theme === 'dark' ? 'ishusho-crafts' : template
  const isDark = resolvedTemplate === 'ishusho-crafts'
  const t = useTranslations('marketplace.quickView')
  const tProduct = useTranslations('product')
  const [activeImage, setActiveImage] = useState(0)

  useEffect(() => {
    setActiveImage(0)
  }, [product?.id])

  if (!product || !labels) return null

  const gallery =
    product.images.length > 0
      ? product.images
      : product.primaryImage
        ? [product.primaryImage]
        : []
  const mainSrc = gallery[activeImage] ?? product.primaryImage

  const resolvedAccent =
    accentColor ??
    (resolvedTemplate === 'vibrant-market'
      ? VIBRANT_MARKET_COLORS.secondary
      : resolvedTemplate === 'ishusho-crafts'
        ? ISHUSHO_CRAFTS_COLORS.accent
        : '#B76E5D')

  const ink =
    resolvedTemplate === 'vibrant-market'
      ? `text-[${VIBRANT_MARKET_COLORS.ink}]`
      : isDark
        ? 'text-[#F5EDE4]'
        : 'text-[#2B2B2B]'
  const muted =
    resolvedTemplate === 'vibrant-market'
      ? `text-[${VIBRANT_MARKET_COLORS.muted}]`
      : isDark
        ? 'text-[#C4B5A6]'
        : 'text-[#6E6A66]'
  const panel =
    resolvedTemplate === 'vibrant-market'
      ? 'border-[var(--vm-border)] bg-white'
      : isDark
        ? 'border-white/10 bg-[#1A1612]'
        : 'border-[rgba(43,43,43,0.08)] bg-white/60'
  const mediaBg =
    resolvedTemplate === 'vibrant-market' ? 'bg-[var(--vm-primary-light)]' : isDark ? 'bg-[#2A231C]' : 'bg-[#EAE4DC]'
  const shell =
    resolvedTemplate === 'vibrant-market'
      ? 'border-[var(--vm-border)] bg-[var(--vm-bg)]'
      : isDark
        ? 'border-white/10 bg-[#111111]'
        : 'border-[rgba(43,43,43,0.08)] bg-[#F5F1EB]'
  const headerBorder = resolvedTemplate === 'vibrant-market' ? 'border-[var(--vm-border)]' : isDark ? 'border-white/10' : 'border-[rgba(43,43,43,0.08)]'
  const vibrantVars =
    resolvedTemplate === 'vibrant-market'
      ? ({
          '--vm-primary': VIBRANT_MARKET_COLORS.primary,
          '--vm-secondary': VIBRANT_MARKET_COLORS.secondary,
          '--vm-primary-dark': VIBRANT_MARKET_COLORS.primaryDark,
          '--vm-primary-light': VIBRANT_MARKET_COLORS.primaryLight,
          '--vm-accent': VIBRANT_MARKET_COLORS.accent,
          '--vm-bg': VIBRANT_MARKET_COLORS.bg,
          '--vm-surface': VIBRANT_MARKET_COLORS.surface,
          '--vm-ink': VIBRANT_MARKET_COLORS.ink,
          '--vm-muted': VIBRANT_MARKET_COLORS.muted,
          '--vm-on-primary': VIBRANT_MARKET_COLORS.onPrimary,
          '--vm-border': VIBRANT_MARKET_COLORS.border,
        } as React.CSSProperties)
      : undefined

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side='right'
        className={cn(
          'flex h-full w-full max-w-full flex-col p-0 sm:max-w-lg md:max-w-xl',
          shell,
          resolvedTemplate === 'ishusho-crafts' && 'ic-storefront',
        )}
        style={templateVars}
      >
        <SheetHeader
          className={cn(
            'border-b px-5 pb-4 pt-5 text-left',
            headerBorder,
          )}
        >
          <SheetTitle className={cn('pr-10 text-lg font-bold leading-snug', ink)}>
            {product.name}
          </SheetTitle>
          <SheetDescription className={cn('text-left text-sm', muted)}>
            {product.category} · {labels.storeLabel}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className='min-h-0 flex-1'>
          <div className='space-y-6 px-5 py-5'>
            <div>
              <p className={cn('mb-2 text-xs font-semibold uppercase tracking-[0.12em]', muted)}>
                {t('photos')}
              </p>
              <div className={cn('overflow-hidden rounded-[1.25rem] border', panel, mediaBg)}>
                <div className='relative aspect-[4/3] w-full max-h-56 sm:max-h-64'>
                  {mainSrc ? (
                    <img
                      src={mainSrc}
                      alt={product.name}
                      className='size-full object-cover'
                    />
                  ) : (
                    <div className={cn('flex size-full items-center justify-center', muted)}>
                      <Package className='size-14' aria-hidden strokeWidth={1.25} />
                    </div>
                  )}
                </div>
              </div>
              {gallery.length > 1 ? (
                <div className='mt-3 flex gap-2 overflow-x-auto pb-1'>
                  {gallery.map((src, index) => (
                    <button
                      key={src}
                      type='button'
                      onClick={() => setActiveImage(index)}
                      className={cn(
                        'relative size-16 shrink-0 overflow-hidden rounded-xl border-2 transition-colors',
                        index === activeImage
                          ? 'opacity-100'
                          : 'border-transparent opacity-90 hover:opacity-100',
                      )}
                      style={
                        index === activeImage
                          ? { borderColor: resolvedAccent, boxShadow: `0 0 0 2px ${resolvedAccent}4D` }
                          : undefined
                      }
                      aria-label={t('photoThumbAria', { index: index + 1 })}
                    >
                      <img src={src} alt='' className='size-full object-cover' />
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            {product.description ? (
              <div>
                <p className={cn('mb-2 text-xs font-semibold uppercase tracking-[0.12em]', muted)}>
                  {t('details')}
                </p>
                <p className={cn('text-sm leading-relaxed', ink)}>{product.description}</p>
              </div>
            ) : null}

            {product.tags.length > 0 ? (
              <div className='flex flex-wrap gap-2'>
                {product.tags.slice(0, 12).map((tag) => (
                  <span
                    key={tag}
                    className={cn(
                      'inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium',
                      panel,
                      muted,
                    )}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}

            <div className={cn('rounded-[1.25rem] border p-4', panel, !isDark && 'backdrop-blur-md')}>
              <p className={cn('mb-3 text-xs font-semibold uppercase tracking-[0.12em]', muted)}>
                {tProduct('variants')}
              </p>
              <ul className='space-y-3'>
                {product.variants.map((v) => {
                  const vImg = mainSrc ?? product.primaryImage ?? product.images[0] ?? null
                  return (
                    <li
                      key={v.id}
                      className={cn(
                        'flex flex-wrap items-center justify-between gap-3 rounded-xl border px-3 py-3',
                        panel,
                        isDark ? 'bg-[var(--ic-primary-light)]/80' : 'bg-[#EAE4DC]/50',
                      )}
                    >
                      <div className='min-w-0'>
                        <p className={cn('font-semibold', ink)}>{v.title}</p>
                        <p className={cn('text-xs', muted)}>{v.sku}</p>
                      </div>
                      <div className='flex flex-wrap items-center gap-3'>
                        <p className={cn('font-semibold tabular-nums', ink)}>
                          {formatRwfLocal(v.price)}
                          <span
                            className={cn(
                              'ml-1 text-[10px] font-semibold uppercase tracking-[0.1em]',
                              muted,
                            )}
                          >
                            RWF
                          </span>
                        </p>
                        {v.inventory ? (
                          <span
                            className={cn(
                              'inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em]',
                              panel,
                              muted,
                            )}
                          >
                            {tProduct('inStock', { count: v.inventory.available })}
                          </span>
                        ) : (
                          <span
                            className={cn(
                              'inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em]',
                              panel,
                              muted,
                            )}
                          >
                            {tProduct('stockUnknown')}
                          </span>
                        )}
                        <QuickAddButton
                          label={labels.addToCartAria}
                          addedLabel={labels.addedLabel}
                          toastTitle={labels.toastAdded}
                          className={quickAddClassForTemplate(resolvedTemplate)}
                          item={{
                            productId: product.id,
                            variantId: v.id,
                            storeId: product.store.id,
                            storeName: product.store.displayName,
                            name: product.name,
                            sku: v.sku,
                            title: v.title,
                            price: v.price,
                            image: vImg,
                          }}
                        />
                      </div>
                    </li>
                  )
                })}
              </ul>
            </div>

            <ul className={cn('space-y-2 text-sm', ink)}>
              <li className='flex items-center gap-2.5'>
                <span
                  className={cn(
                    'inline-flex size-7 items-center justify-center rounded-full border',
                    panel,
                    isDark ? 'bg-[var(--ic-primary-light)]' : 'bg-[#EAE4DC]/70',
                  )}
                >
                  <Check
                    className={cn('size-3.5', isDark ? 'text-[#C9A66B]' : 'text-[#7D8F69]')}
                    aria-hidden
                    strokeWidth={2.5}
                  />
                </span>
                {tProduct('fromStore', { name: product.store.displayName })}
              </li>
              {product.deliveryEnabled ? (
                <li className='flex items-center gap-2.5'>
                  <span
                    className={cn(
                      'inline-flex size-7 items-center justify-center rounded-full border',
                      panel,
                      isDark ? 'bg-[var(--ic-primary-light)]' : 'bg-[#EAE4DC]/70',
                    )}
                  >
                    <Truck
                      className={cn('size-3.5', isDark ? 'text-[#C9A66B]' : 'text-[#7D8F69]')}
                      aria-hidden
                      strokeWidth={2.25}
                    />
                  </span>
                  {tProduct('deliveryEnabled')}
                </li>
              ) : (
                <li className={cn('flex items-center gap-2.5', muted)}>
                  <span
                    className={cn(
                      'inline-flex size-7 items-center justify-center rounded-full border',
                      panel,
                      isDark ? 'bg-[var(--ic-primary-light)]' : 'bg-[#EAE4DC]/70',
                    )}
                  >
                    <Truck className='size-3.5' aria-hidden strokeWidth={2.25} />
                  </span>
                  {tProduct('deliveryDisabled')}
                </li>
              )}
              {product.deliveryLocation ? (
                <li className='flex items-center gap-2.5'>
                  <span
                    className={cn(
                      'inline-flex size-7 items-center justify-center rounded-full border',
                      panel,
                      isDark ? 'bg-[var(--ic-primary-light)]' : 'bg-[#EAE4DC]/70',
                    )}
                  >
                    <MapPin
                      className={cn('size-3.5', isDark ? 'text-[#C9A66B]' : 'text-[#7D8F69]')}
                      aria-hidden
                      strokeWidth={2.25}
                    />
                  </span>
                  {tProduct('deliveryLocation', { location: product.deliveryLocation })}
                </li>
              ) : null}
            </ul>

            {product.priceFrom != null ? (
              <div className={cn('rounded-[1.25rem] border p-4', panel, !isDark && 'backdrop-blur-md')}>
                <p className={cn('text-xs font-semibold uppercase tracking-[0.12em]', muted)}>
                  {tProduct('startingFrom')}
                </p>
                <p className={cn('mt-1 text-2xl font-bold tabular-nums', ink)}>
                  {formatRwf(product.priceFrom)}
                  <span
                    className={cn(
                      'ml-1.5 text-[11px] font-semibold uppercase tracking-[0.1em]',
                      muted,
                    )}
                  >
                    RWF
                  </span>
                </p>
                {product.compareAtFrom != null &&
                product.priceFrom != null &&
                product.compareAtFrom > product.priceFrom ? (
                  <p className={cn('mt-1 text-sm tabular-nums line-through', muted)}>
                    {formatRwf(product.compareAtFrom)} RWF
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>
        </ScrollArea>

        <SheetFooter
          className={cn(
            'border-t px-5 py-4',
            resolvedTemplate === 'vibrant-market' ? 'border-[var(--vm-border)] bg-[var(--vm-bg)]' : isDark ? 'border-white/10 bg-[#111111]' : 'border-[rgba(43,43,43,0.08)] bg-[#F5F1EB]',
          )}
        >
          <div
            className={cn(
              'flex w-full flex-col gap-2',
              showFullPageLink ? 'sm:flex-row sm:justify-end' : 'sm:justify-stretch',
            )}
          >
            <Button
              type='button'
              variant='outline'
              className={cn(
                'h-11 rounded-full',
                isDark
                  ? 'border-white/20 bg-transparent text-[#F5EDE4] hover:bg-white/5'
                  : 'border-[rgba(43,43,43,0.08)] bg-white/70 text-[#2B2B2B] hover:bg-white',
                !showFullPageLink && 'w-full sm:w-full',
              )}
              onClick={() => onOpenChange(false)}
            >
              {t('close')}
            </Button>
            {showFullPageLink ? (
              <Button
                asChild
                type='button'
                className='h-11 rounded-full text-white'
                style={{ backgroundColor: resolvedAccent }}
              >
                <Link href={`/shop/${product.id}`} prefetch={false} onClick={() => onOpenChange(false)}>
                  {t('openFullPage')}
                </Link>
              </Button>
            ) : null}
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
