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
import { storePublicSlug } from '@/services/catalog.service'

import { QuickAddButton } from './quick-add-button'
import { ProductReviews } from './product-reviews'

type ProductDetailsBodyProps = {
  product: CatalogProductPublic
  /** Dashboard vendor preview — no cart actions. */
  preview?: boolean
}

export function ProductDetailsBody({ product, preview = false }: ProductDetailsBodyProps) {
  const t = useTranslations('product')
  const tMarketplace = useTranslations('marketplace')
  const tPreview = useTranslations('dashboard.products.preview')
  const tQuickView = useTranslations('marketplace.quickView')
  const variants = product.variants ?? []
  const tags = product.tags ?? []
  const storeSlug = storePublicSlug(product.store)

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
        <div className='group overflow-hidden rounded-[1.75rem] border border-stroke-soft-200 bg-bg-white-0 shadow-regular-xs transition-shadow duration-500 os-soft-pop hover:shadow-soft-card-hover'>
          <AspectRatio ratio={1}>
            {mainSrc ? (
              <img
                src={mainSrc}
                alt={product.name}
                className='size-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover:scale-[1.04]'
              />
            ) : (
              <div className='flex size-full items-center justify-center bg-bg-soft-200 text-text-sub-600'>
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
                    ? 'border-primary-base bg-primary-alpha-10 opacity-100 ring-2 ring-primary-base/20'
                    : 'border-transparent opacity-80 hover:opacity-100',
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
                className='inline-flex items-center rounded-full border border-stroke-soft-200 bg-bg-white-0 px-3 py-1 text-xs font-medium text-text-sub-600'
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}

        {product.attributes?.length ? (
          <dl className='grid gap-2 rounded-[1.25rem] border border-stroke-soft-200 bg-bg-white-0 p-4 text-sm'>
            {product.attributes.map((attr) => (
              <div key={attr.key} className='flex justify-between gap-4'>
                <dt className='text-text-sub-600'>{attr.label}</dt>
                <dd className='font-medium text-text-strong-950'>{attr.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}
      </div>

      <div className='space-y-6'>
        <div className='space-y-3 os-fade-up' style={{ animationDelay: '60ms' }}>
          <div className='flex flex-wrap items-center gap-2'>
            <Link
              href={`/stores/${encodeURIComponent(storeSlug)}`}
              className='inline-flex items-center gap-1.5 rounded-full border border-stroke-soft-200 bg-bg-white-0 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-text-strong-950 transition-colors hover:border-primary-base/40 hover:text-primary-base'
            >
              <Store className='size-3.5 text-primary-base' aria-hidden strokeWidth={2.25} />
              {product.store.displayName}
            </Link>
            <span className='inline-flex items-center rounded-full border border-stroke-soft-200 bg-bg-weak-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-text-sub-600'>
              {product.category}
            </span>
          </div>
          <h1 className='text-3xl font-bold leading-tight tracking-tight text-text-strong-950 md:text-4xl'>
            {product.name}
          </h1>
          {product.description ? (
            <p className='text-[15px] leading-relaxed text-text-sub-600'>{product.description}</p>
          ) : null}
          {product.averageRating != null ? (
            <p className='text-sm text-text-sub-600'>
              {tMarketplace('ratingValue', { rating: product.averageRating.toFixed(1) })}
              {product.reviewCount != null
                ? ` · ${tMarketplace('reviewsCount', { count: product.reviewCount })}`
                : null}
            </p>
          ) : null}
        </div>

        {hasMultipleVariants ? (
          <div className='space-y-3 os-fade-up' style={{ animationDelay: '90ms' }}>
            <p className='text-xs font-semibold uppercase tracking-[0.12em] text-text-sub-600'>
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
                      'rounded-full border border-stroke-soft-200 bg-bg-white-0 px-4 py-2 text-sm font-medium text-text-strong-950 transition-colors',
                      isSelected &&
                        'border-primary-base bg-primary-alpha-10 ring-2 ring-primary-base/20',
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
          className='rounded-[1.5rem] border border-stroke-soft-200 bg-bg-white-0 p-6 shadow-regular-xs transition-shadow duration-500 os-fade-up hover:shadow-soft-card-hover'
          style={{ animationDelay: '110ms' }}
        >
          <div className='flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
            <div className='space-y-1'>
              <p className='text-xs font-semibold uppercase tracking-[0.12em] text-text-sub-600'>
                {hasMultipleVariants && selectedVariant ? t('price') : t('startingFrom')}
              </p>
              {displayPrice != null ? (
                <div className='flex items-baseline gap-3'>
                  <p className='text-3xl font-bold tracking-tight tabular-nums text-text-strong-950'>
                    {formatRwf(displayPrice)}
                    <span className='ml-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-text-sub-600'>
                      RWF
                    </span>
                  </p>
                  {hasDiscount ? (
                    <p className='text-sm font-medium tabular-nums text-text-sub-600 line-through'>
                      {formatRwf(displayCompareAt as number)} RWF
                    </p>
                  ) : null}
                </div>
              ) : (
                <p className='text-lg text-text-sub-600'>—</p>
              )}
              {selectedVariant?.inventory ? (
                <p className='text-xs text-text-sub-600'>
                  {t('inStock', { count: selectedVariant.inventory.available })}
                </p>
              ) : null}
            </div>

            {selectedVariant && !preview ? (
              <QuickAddButton
                label={t('addToCart')}
                addedLabel={tMarketplace('addedToCart')}
                toastTitle={tMarketplace('toastAddedToCart')}
                className='!h-12 w-full !rounded-full !px-6 shadow-fancy-buttons-primary sm:w-auto'
                item={buildCartItem(selectedVariant)}
              />
            ) : preview && selectedVariant ? (
              <p className='rounded-full border border-stroke-soft-200 bg-bg-weak-50 px-4 py-3 text-center text-xs font-medium text-text-sub-600 sm:text-left'>
                {tPreview('cartHint')}
              </p>
            ) : null}
          </div>

          <div className='my-5 h-px border-stroke-soft-200 bg-stroke-soft-200' aria-hidden />

          <ul className='grid gap-3 text-sm text-text-strong-950'>
            <li className='flex items-center gap-2.5'>
              <span className='inline-flex size-6 items-center justify-center rounded-full border border-stroke-soft-200 bg-bg-weak-50'>
                <Check className='size-3.5 text-primary-base' aria-hidden strokeWidth={2.5} />
              </span>
              <Link
                href={`/stores/${encodeURIComponent(storeSlug)}`}
                className='font-medium hover:text-primary-base'
              >
                {t('fromStore', { name: product.store.displayName })}
              </Link>
            </li>
            {product.deliveryEnabled ? (
              <li className='flex items-center gap-2.5'>
                <span className='inline-flex size-6 items-center justify-center rounded-full border border-stroke-soft-200 bg-bg-weak-50'>
                  <Truck className='size-3.5 text-primary-base' aria-hidden strokeWidth={2.25} />
                </span>
                {t('deliveryEnabled')}
              </li>
            ) : (
              <li className='flex items-center gap-2.5 text-text-sub-600'>
                <span className='inline-flex size-6 items-center justify-center rounded-full border border-stroke-soft-200 bg-bg-weak-50'>
                  <Truck className='size-3.5' aria-hidden strokeWidth={2.25} />
                </span>
                {t('deliveryDisabled')}
              </li>
            )}
            {product.deliveryLocation ? (
              <li className='flex items-center gap-2.5'>
                <span className='inline-flex size-6 items-center justify-center rounded-full border border-stroke-soft-200 bg-bg-weak-50'>
                  <MapPin className='size-3.5 text-primary-base' aria-hidden strokeWidth={2.25} />
                </span>
                {t('deliveryLocation', { location: product.deliveryLocation })}
              </li>
            ) : null}
          </ul>
        </div>

        {hasMultipleVariants ? (
          <div
            className='overflow-hidden rounded-[1.5rem] border border-stroke-soft-200 bg-bg-white-0 shadow-regular-xs os-fade-up'
            style={{ animationDelay: '160ms' }}
          >
            <Accordion type='single' collapsible defaultValue='variants'>
              <AccordionItem value='variants' className='border-b-0 px-6'>
                <AccordionTrigger className='text-text-strong-950 hover:no-underline'>
                  {t('variants')}
                </AccordionTrigger>
                <AccordionContent className='pb-6'>
                  <div className='grid gap-3'>
                    {variants.map((v) => (
                      <div
                        key={v.id}
                        className={cn(
                          'flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-stroke-soft-200 bg-bg-weak-50 px-4 py-3',
                          v.id === selectedVariantId &&
                            'border-primary-base bg-primary-alpha-10 ring-2 ring-primary-base/20',
                        )}
                      >
                        <div className='min-w-0'>
                          <p className='font-semibold text-text-strong-950'>{v.title}</p>
                          <p className='text-xs text-text-sub-600'>{v.sku}</p>
                        </div>
                        <div className='flex flex-wrap items-center gap-3'>
                          <p className='font-semibold tabular-nums text-text-strong-950'>
                            {formatRwf(v.price)}
                            <span className='ml-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-text-sub-600'>
                              RWF
                            </span>
                          </p>
                          {v.inventory ? (
                            <span className='inline-flex items-center rounded-full border border-stroke-soft-200 bg-bg-white-0 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-text-sub-600'>
                              {t('inStock', { count: v.inventory.available })}
                            </span>
                          ) : (
                            <span className='inline-flex items-center rounded-full border border-stroke-soft-200 bg-bg-white-0 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-text-sub-600'>
                              {t('stockUnknown')}
                            </span>
                          )}
                          {!preview ? (
                            <QuickAddButton
                              label={tMarketplace('addToCartAria')}
                              addedLabel={tMarketplace('addedToCart')}
                              toastTitle={tMarketplace('toastAddedToCart')}
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

      {!preview ? <ProductReviews productId={product.id} /> : null}
    </div>
  )
}

export function ProductDetailsTopBar({
  backLabel,
  approvedLabel,
  backHref = '/shop',
}: {
  backLabel: string
  approvedLabel: string
  backHref?: string
}) {
  return (
    <div className='border-b border-stroke-soft-200 bg-bg-weak-50'>
      <div className='mx-auto flex max-w-6xl items-center justify-between px-4 py-6'>
        <Button asChild variant='ghost' className='rounded-full text-text-strong-950 hover:bg-white/60'>
          <Link href={backHref}>{backLabel}</Link>
        </Button>
        <span className='inline-flex items-center gap-1.5 rounded-full border border-stroke-soft-200 bg-bg-white-0 px-3 py-1.5 text-xs font-semibold text-text-strong-950 shadow-regular-xs backdrop-blur-md'>
          <ShieldCheck className='size-3.5 text-primary-base' aria-hidden strokeWidth={2.25} />
          {approvedLabel}
        </span>
      </div>
    </div>

  )
}
