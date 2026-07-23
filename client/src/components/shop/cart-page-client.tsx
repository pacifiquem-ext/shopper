'use client'

import {
  ArrowLeft,
  CreditCard,
  Minus,
  Package,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Trash2,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'

import { Link } from '@/i18n/navigation'
import { CART_EVENT, readCart, type CartItem, writeCart } from '@/lib/cart-storage'
import { cartPageThemeTokens } from '@/lib/cart-page-theme'
import { cn } from '@/lib/utils'

import { PlaceOrderDialog } from './place-order-dialog'
import { SiteFooter } from './site-footer'

const CART_LOADING_ITEMS = ['cart-line-one', 'cart-line-two', 'cart-line-three'] as const

function formatRwf(amount: number): string {
  return new Intl.NumberFormat('en-RW', { maximumFractionDigits: 0 }).format(amount)
}

function getItemTotal(item: CartItem) {
  return item.price * item.quantity
}

export type CartPageClientProps = {
  shopBackHref?: string
  cartHref?: string
}

export function CartPageClient({
  shopBackHref = '/shop',
}: CartPageClientProps) {
  const tokens = cartPageThemeTokens()
  const t = useTranslations('cart')
  const [items, setItems] = useState<CartItem[]>([])
  const [mounted, setMounted] = useState(false)
  const [placeOrderOpen, setPlaceOrderOpen] = useState(false)
  const [placedOrders, setPlacedOrders] = useState<
    Array<{ id: string; orderNumber: string; storeName: string; total: number }>
  >([])
  const [checkoutPhone, setCheckoutPhone] = useState('')

  useEffect(() => {
    const syncCart = () => {
      setItems(readCart())
      setMounted(true)
    }

    syncCart()
    window.addEventListener(CART_EVENT, syncCart)
    window.addEventListener('storage', syncCart)

    return () => {
      window.removeEventListener(CART_EVENT, syncCart)
      window.removeEventListener('storage', syncCart)
    }
  }, [])

  const summary = useMemo(() => {
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
    const subtotal = items.reduce((sum, item) => sum + getItemTotal(item), 0)

    return { itemCount, subtotal }
  }, [items])

  const replaceCart = (next: CartItem[]) => {
    setItems(next)
    writeCart(next)
  }

  const updateQuantity = (variantId: string, quantity: number) => {
    const next = items.map((item) =>
      item.variantId === variantId
        ? { ...item, quantity: Math.max(1, quantity) }
        : item,
    )
    replaceCart(next)
  }

  const removeItem = (variantId: string) => {
    replaceCart(items.filter((item) => item.variantId !== variantId))
  }

  const clearCart = () => {
    replaceCart([])
  }

  const hasItems = items.length > 0

  return (
    <>
      <div className={tokens.page}>
        <main className='relative overflow-hidden'>
          {tokens.showDefaultBlurs ? (
            <>
              <div
                aria-hidden
                className={cn(
                  'pointer-events-none absolute -left-32 top-32 size-[420px] rounded-full blur-3xl',
                  tokens.blurOrbA,
                )}
              />
              <div
                aria-hidden
                className={cn(
                  'pointer-events-none absolute -right-24 top-1/3 size-[420px] rounded-full blur-3xl',
                  tokens.blurOrbB,
                )}
              />
            </>
          ) : null}

          <section className={cn('relative border-b', tokens.border)}>
            <div className='mx-auto max-w-7xl px-4 py-8'>
              <div className='flex flex-wrap items-center justify-between gap-4'>
                <Link
                  href={shopBackHref}
                  className={cn(
                    'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium shadow-regular-xs transition-colors hover:border-primary-base/40 hover:bg-bg-white-0/85',
                    tokens.border,
                    tokens.surface,
                    tokens.ink,
                  )}
                >
                  <ArrowLeft className='size-4' aria-hidden />
                  {t('backToShop')}
                </Link>

                <span
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold shadow-regular-xs',
                    tokens.border,
                    tokens.surface,
                    tokens.ink,
                  )}
                >
                  <ShieldCheck className={cn('size-3.5', tokens.accentIcon)} aria-hidden />
                  {t('localCartBadge')}
                </span>
              </div>

              <div className='mt-10 max-w-3xl'>
                <p
                  className={cn(
                    'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.08em]',
                    tokens.border,
                    tokens.surface,
                    tokens.muted,
                  )}
                >
                  <ShoppingBag className={cn('size-3.5', tokens.accent)} aria-hidden />
                  {t('eyebrow')}
                </p>
                <h1 className={cn('mt-4 text-4xl font-black tracking-[-0.045em] md:text-6xl', tokens.ink)}>
                  {t('title')}
                </h1>
                <p className={cn('mt-4 max-w-2xl text-base leading-8 md:text-lg', tokens.muted)}>
                  {t('subtitle')}
                </p>
              </div>
            </div>
          </section>

          {placedOrders.length > 0 ? (
            <section className='mx-auto max-w-7xl px-4 pt-8'>
              <div className='rounded-[1.5rem] border border-primary-base/25 bg-primary-alpha-10 p-6'>
                <h2 className='text-lg font-bold text-text-strong-950'>{t('successTitle')}</h2>
                <p className='mt-1 text-sm text-text-sub-600'>{t('successPaymentHint')}</p>
                <ul className='mt-4 space-y-3'>
                  {placedOrders.map((order) => (
                    <li
                      key={order.id}
                      className='rounded-xl border border-stroke-soft-200 bg-bg-white-0 px-4 py-3'
                    >
                      <p className='font-semibold text-text-strong-950'>
                        {t('successOrderLine', {
                          orderNumber: order.orderNumber,
                          store: order.storeName,
                        })}
                      </p>
                      <p className='mt-1 text-sm text-text-sub-600'>
                        {formatRwf(order.total)} RWF
                      </p>
                      <Link
                        href={
                          checkoutPhone
                            ? `/orders/${encodeURIComponent(order.id)}?phone=${encodeURIComponent(checkoutPhone)}`
                            : `/orders/${encodeURIComponent(order.id)}`
                        }
                        className='mt-2 inline-block text-sm font-semibold text-primary-base hover:underline'
                      >
                        {t('successViewOrder')}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          ) : null}

          <div className='relative mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-10 lg:grid-cols-[1fr_380px]'>
            <section className='space-y-4'>
              {!mounted ? (
                <CartLoadingState tokens={tokens} />
              ) : hasItems ? (
                <>
                  <div className='flex items-center justify-between gap-4'>
                    <p className={cn('text-sm font-medium', tokens.muted)}>
                      {summary.itemCount === 1
                        ? t('itemCountOne')
                        : t('itemCountOther', { count: summary.itemCount })}
                    </p>
                    <button
                      type='button'
                      onClick={clearCart}
                      className={cn(
                        'rounded-full border px-4 py-2 text-sm font-medium transition-colors hover:border-primary-base/30 hover:text-primary-base',
                        tokens.border,
                        tokens.surface,
                        tokens.muted,
                      )}
                    >
                      {t('clearCart')}
                    </button>
                  </div>

                  <ul className='space-y-3'>
                    {items.map((item) => (
                      <li
                        key={item.variantId}
                        className={cn(
                          'overflow-hidden rounded-[1.5rem] border p-3 os-fade-up',
                          tokens.border,
                          tokens.surface,
                          tokens.cardShadow,
                        )}
                      >
                        <div className='grid gap-4 sm:grid-cols-[128px_1fr]'>
                          <Link
                            href={`/shop/${item.productId}`}
                            className={cn('group/image block overflow-hidden rounded-[1.1rem]', tokens.surfaceSoft)}
                          >
                            <div className='aspect-square'>
                              {item.image ? (
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className='size-full object-cover transition-transform duration-700 group-hover/image:scale-[1.05]'
                                />
                              ) : (
                                <div className={cn('flex size-full items-center justify-center', tokens.muted)}>
                                  <Package className='size-8' aria-hidden strokeWidth={1.5} />
                                </div>
                              )}
                            </div>
                          </Link>

                          <div className='flex min-w-0 flex-col gap-4 p-1'>
                            <div className='flex flex-wrap items-start justify-between gap-3'>
                              <div className='min-w-0'>
                                <p className={cn('text-[11px] font-semibold uppercase tracking-[0.12em]', tokens.muted)}>
                                  {item.storeName}
                                </p>
                                <Link href={`/shop/${item.productId}`} className='mt-1 block'>
                                  <h2
                                    className={cn(
                                      'line-clamp-2 text-lg font-bold leading-tight tracking-tight transition-colors hover:text-primary-base',
                                      tokens.ink,
                                    )}
                                  >
                                    {item.name}
                                  </h2>
                                </Link>
                                <p className={cn('mt-1 text-sm', tokens.muted)}>{item.title}</p>
                                <p className={cn('mt-1 text-xs', tokens.muted)}>{item.sku}</p>
                              </div>

                              <p className={cn('text-lg font-bold tabular-nums', tokens.ink)}>
                                {formatRwf(getItemTotal(item))}
                                <span
                                  className={cn(
                                    'ml-1 text-[10px] font-semibold uppercase tracking-[0.1em]',
                                    tokens.muted,
                                  )}
                                >
                                  RWF
                                </span>
                              </p>
                            </div>

                            <div className='mt-auto flex flex-wrap items-center justify-between gap-3'>
                              <div
                                className={cn(
                                  'inline-flex items-center rounded-full border p-1',
                                  tokens.border,
                                  tokens.surfaceSoft,
                                )}
                              >
                                <button
                                  type='button'
                                  aria-label={t('decreaseQuantity', { name: item.name })}
                                  onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                                  className='inline-flex size-9 items-center justify-center rounded-full bg-bg-white-0/85 text-text-strong-950 shadow-regular-xs transition-colors hover:text-primary-base'
                                >
                                  <Minus className='size-4' aria-hidden />
                                </button>
                                <span
                                  className={cn(
                                    'min-w-10 px-2 text-center text-sm font-semibold tabular-nums',
                                    tokens.ink,
                                  )}
                                >
                                  {item.quantity}
                                </span>
                                <button
                                  type='button'
                                  aria-label={t('increaseQuantity', { name: item.name })}
                                  onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                                  className={cn(
                                    'inline-flex size-9 items-center justify-center rounded-full text-white transition-transform hover:-translate-y-0.5 active:scale-95',
                                    tokens.accentBg,
                                    tokens.accentHover,
                                    tokens.ctaShadow,
                                  )}
                                >
                                  <Plus className='size-4' aria-hidden />
                                </button>
                              </div>

                              <div className='flex items-center gap-3'>
                                <p className={cn('text-sm', tokens.muted)}>
                                  {formatRwf(item.price)} RWF {t('each')}
                                </p>
                                <button
                                  type='button'
                                  aria-label={t('removeItem', { name: item.name })}
                                  onClick={() => removeItem(item.variantId)}
                                  className={cn(
                                    'inline-flex size-10 items-center justify-center rounded-full border transition-colors hover:border-primary-base/30 hover:text-primary-base',
                                    tokens.border,
                                    tokens.surface,
                                    tokens.muted,
                                  )}
                                >
                                  <Trash2 className='size-4' aria-hidden />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <EmptyCart tokens={tokens} shopBackHref={shopBackHref} />
              )}
            </section>

            <aside className='lg:sticky lg:top-6 lg:self-start'>
              <div
                className={cn(
                  'rounded-[1.75rem] border p-6',
                  tokens.border,
                  tokens.surfaceStrong,
                  tokens.summaryShadow,
                )}
              >
                <div className='flex items-center gap-3'>
                  <span
                    className={cn(
                      'inline-flex size-11 items-center justify-center rounded-full',
                      tokens.surfaceSoft,
                      tokens.accent,
                    )}
                  >
                    <CreditCard className='size-5' aria-hidden />
                  </span>
                  <div>
                    <h2 className={cn('text-lg font-bold tracking-tight', tokens.ink)}>
                      {t('summaryTitle')}
                    </h2>
                    <p className={cn('text-sm', tokens.muted)}>{t('summarySubtitle')}</p>
                  </div>
                </div>

                <div className={cn('my-6 h-px', tokens.border)} aria-hidden />

                <dl className='space-y-4'>
                  <div className='flex items-center justify-between gap-4 text-sm'>
                    <dt className={tokens.muted}>{t('subtotal')}</dt>
                    <dd className={cn('font-semibold tabular-nums', tokens.ink)}>
                      {formatRwf(summary.subtotal)} RWF
                    </dd>
                  </div>
                  <div className='flex items-center justify-between gap-4 text-sm'>
                    <dt className={tokens.muted}>{t('delivery')}</dt>
                    <dd className={cn('font-semibold', tokens.muted)}>{t('calculatedLater')}</dd>
                  </div>
                  <div className={cn('flex items-center justify-between gap-4 border-t pt-4', tokens.border)}>
                    <dt className={cn('font-semibold', tokens.ink)}>{t('estimatedTotal')}</dt>
                    <dd className={cn('text-2xl font-black tracking-tight tabular-nums', tokens.ink)}>
                      {formatRwf(summary.subtotal)}
                      <span
                        className={cn(
                          'ml-1 text-[11px] font-semibold uppercase tracking-[0.1em]',
                          tokens.muted,
                        )}
                      >
                        RWF
                      </span>
                    </dd>
                  </div>
                </dl>

                <button
                  type='button'
                  onClick={() => setPlaceOrderOpen(true)}
                  disabled={!hasItems}
                  className={cn(
                    'mt-6 inline-flex h-12 w-full items-center justify-center rounded-full px-6 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-45',
                    tokens.accentBg,
                    tokens.accentHover,
                    tokens.ctaShadow,
                  )}
                >
                  {t('placeOrder')}
                </button>
                <p className={cn('mt-3 text-center text-xs leading-5', tokens.muted)}>
                  {t('placeOrderHint')}
                </p>
              </div>
            </aside>
          </div>
        </main>
        <SiteFooter />
      </div>
      <PlaceOrderDialog
        open={placeOrderOpen}
        onOpenChange={setPlaceOrderOpen}
        items={items}
        onSuccess={(orders, customerPhone) => {
          clearCart()
          setCheckoutPhone(customerPhone)
          setPlacedOrders(orders)
        }}
      />
    </>
  )
}

function CartLoadingState({
  tokens,
}: {
  tokens: ReturnType<typeof cartPageThemeTokens>
}) {
  return (
    <div className='space-y-3'>
      {CART_LOADING_ITEMS.map((item) => (
        <div
          key={item}
          className={cn(
            'grid animate-pulse gap-4 rounded-[1.5rem] border p-3 sm:grid-cols-[128px_1fr]',
            tokens.border,
            tokens.surface,
          )}
        >
          <div className={cn('aspect-square rounded-[1.1rem]', tokens.surfaceSoft)} />
          <div className='space-y-3 p-1'>
            <div className={cn('h-3 w-24 rounded-md', tokens.surfaceSoft)} />
            <div className={cn('h-5 w-3/4 rounded-md', tokens.surfaceSoft)} />
            <div className={cn('h-4 w-40 rounded-md', tokens.surfaceSoft)} />
            <div className={cn('h-10 w-36 rounded-full', tokens.surfaceSoft)} />
          </div>
        </div>
      ))}
    </div>
  )
}

function EmptyCart({
  tokens,
  shopBackHref,
}: {
  tokens: ReturnType<typeof cartPageThemeTokens>
  shopBackHref: string
}) {
  const t = useTranslations('cart')

  return (
    <div
      className={cn(
        'rounded-[1.75rem] border px-6 py-16 text-center',
        tokens.border,
        tokens.surface,
        tokens.cardShadow,
      )}
    >
      <div
        className={cn(
          'mx-auto flex size-16 items-center justify-center rounded-full',
          tokens.surfaceSoft,
          tokens.accent,
        )}
      >
        <ShoppingBag className='size-7' aria-hidden />
      </div>
      <h2 className={cn('mt-5 text-2xl font-bold tracking-tight', tokens.ink)}>
        {t('emptyTitle')}
      </h2>
      <p className={cn('mx-auto mt-2 max-w-md text-sm leading-6', tokens.muted)}>
        {t('emptyBody')}
      </p>
      <Link
        href={shopBackHref}
        className={cn(
          'mt-6 inline-flex h-11 items-center justify-center rounded-full px-6 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5',
          tokens.accentBg,
          tokens.accentHover,
          tokens.ctaShadow,
        )}
      >
        {t('startShopping')}
      </Link>
    </div>
  )
}
