'use client'

import { Check, MapPin, Package, Truck } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'

import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/utils'
import { formatRwf } from '@/lib/product-display'
import type { CatalogProductPublic } from '@/services/catalog.service'
import { storePublicSlug } from '@/services/catalog.service'
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

interface ProductQuickViewSheetProps {
  product: CatalogProductPublic | null
  labels: ProductCardLabels | null
  open: boolean
  onOpenChange: (open: boolean) => void
  accentColor?: string
  showFullPageLink?: boolean
}

export function ProductQuickViewSheet({
  product,
  labels,
  open,
  onOpenChange,
  accentColor = '#1daf61',
  showFullPageLink = true,
}: ProductQuickViewSheetProps) {
  const t = useTranslations('marketplace.quickView')
  const tProduct = useTranslations('product')
  const [activeImage, setActiveImage] = useState(0)

  useEffect(() => {
    setActiveImage(0)
  }, [product?.id])

  if (!product || !labels) {
    return <Sheet open={false} onOpenChange={onOpenChange} />
  }

  const gallery =
    product.images.length > 0
      ? product.images
      : product.primaryImage
        ? [product.primaryImage]
        : []
  const mainSrc = gallery[activeImage] ?? product.primaryImage ?? null
  const price = product.priceFrom
  const compareAt = product.compareAtFrom
  const hasDiscount = compareAt != null && price != null && compareAt > price
  const defaultVariant = product.variants?.[0]
  const storeSlug = storePublicSlug(product.store)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side='right'
        className='flex h-full w-full max-w-full flex-col border-stroke-soft-200 bg-bg-weak-50 p-0 sm:max-w-lg md:max-w-xl'
      >
        <SheetHeader className='border-b border-stroke-soft-200 px-5 pb-4 pt-5 text-left'>
          <SheetTitle className='pr-10 text-lg font-bold leading-snug text-text-strong-950'>
            {product.name}
          </SheetTitle>
          <SheetDescription className='text-left text-sm text-text-sub-600'>
            {product.category} · {labels.storeLabel}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className='min-h-0 flex-1'>
          <div className='space-y-6 px-5 py-5'>
            <div>
              <p className='mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-text-sub-600'>
                {t('photos')}
              </p>
              <div className='overflow-hidden rounded-[1.25rem] border border-stroke-soft-200 bg-bg-soft-200'>
                <div className='relative aspect-[4/3] w-full max-h-56 sm:max-h-64'>
                  {mainSrc ? (
                    <img src={mainSrc} alt={product.name} className='size-full object-cover' />
                  ) : (
                    <div className='flex size-full items-center justify-center text-text-sub-600'>
                      <Package className='size-14' aria-hidden strokeWidth={1.25} />
                    </div>
                  )}
                </div>
              </div>
              {gallery.length > 1 ? (
                <div className='mt-3 flex gap-2 overflow-x-auto pb-1'>
                  {gallery.map((src, index) => (
                    <button
                      key={`${src}-${index}`}
                      type='button'
                      onClick={() => setActiveImage(index)}
                      className={cn(
                        'relative size-16 shrink-0 overflow-hidden rounded-xl border-2 transition-colors',
                        index === activeImage
                          ? 'border-primary-base opacity-100'
                          : 'border-transparent opacity-90 hover:opacity-100',
                      )}
                      aria-label={t('photoThumbAria', { index: index + 1 })}
                    >
                      <img src={src} alt='' className='size-full object-cover' />
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <div className='space-y-2'>
              <p className='text-xs font-semibold uppercase tracking-[0.12em] text-text-sub-600'>
                {t('details')}
              </p>
              {price != null ? (
                <div className='flex items-baseline gap-2'>
                  <p className='text-2xl font-bold tabular-nums text-text-strong-950'>
                    {formatRwf(price)}{' '}
                    <span className='text-xs font-semibold uppercase text-text-sub-600'>RWF</span>
                  </p>
                  {hasDiscount ? (
                    <p className='text-sm text-text-sub-600 line-through'>
                      {formatRwf(compareAt as number)} RWF
                    </p>
                  ) : null}
                </div>
              ) : null}
              {product.description ? (
                <p className='text-sm leading-relaxed text-text-sub-600'>{product.description}</p>
              ) : null}
              <ul className='space-y-2 text-sm text-text-strong-950'>
                <li className='flex items-center gap-2'>
                  <Check className='size-4' style={{ color: accentColor }} aria-hidden />
                  <Link
                    href={`/stores/${encodeURIComponent(storeSlug)}`}
                    className='font-medium hover:underline'
                    style={{ color: accentColor }}
                  >
                    {tProduct('fromStore', { name: product.store.displayName })}
                  </Link>
                </li>
                {product.deliveryEnabled ? (
                  <li className='flex items-center gap-2'>
                    <Truck className='size-4' style={{ color: accentColor }} aria-hidden />
                    {tProduct('deliveryEnabled')}
                  </li>
                ) : null}
                {product.deliveryLocation ? (
                  <li className='flex items-center gap-2'>
                    <MapPin className='size-4' style={{ color: accentColor }} aria-hidden />
                    {tProduct('deliveryLocation', { location: product.deliveryLocation })}
                  </li>
                ) : null}
              </ul>
            </div>
          </div>
        </ScrollArea>

        <SheetFooter
          className={cn(
            'flex-col gap-2 border-t border-stroke-soft-200 bg-bg-weak-50 px-5 py-4 sm:flex-col',
          )}
        >
          {defaultVariant ? (
            <QuickAddButton
              label={tProduct('addToCart')}
              addedLabel={labels.addedLabel}
              toastTitle={labels.toastAdded}
              className='h-11 w-full rounded-full'
              fullWidth
              item={{
                productId: product.id,
                variantId: defaultVariant.id,
                storeId: product.store.id,
                storeName: product.store.displayName,
                name: product.name,
                sku: defaultVariant.sku,
                title: defaultVariant.title,
                price: defaultVariant.price,
                image: mainSrc,
              }}
            />
          ) : null}
          {showFullPageLink ? (
            <Button asChild variant='outline' className='h-11 w-full rounded-full'>
              <Link href={`/shop/${product.id}`}>{t('openFullPage')}</Link>
            </Button>
          ) : null}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
