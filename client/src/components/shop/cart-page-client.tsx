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

const CART_LOADING_ITEMS = ['cart-line-one', 'cart-line-two', 'cart-line-three'] as const

function formatRwf(amount: number): string {
  return new Intl.NumberFormat('en-RW', { maximumFractionDigits: 0 }).format(amount)
}

function getItemTotal(item: CartItem) {
  return item.price * item.quantity
}

export function CartPageClient() {
  const t = useTranslations('cart')
  const [items, setItems] = useState<CartItem[]>([])
  const [mounted, setMounted] = useState(false)

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
    <main className='relative min-h-screen overflow-hidden bg-[#F5F1EB] text-[#2B2B2B]'>
      <div aria-hidden className='pointer-events-none absolute -left-32 top-32 size-[420px] rounded-full bg-[#B76E5D]/10 blur-3xl' />
      <div aria-hidden className='pointer-events-none absolute -right-24 top-1/3 size-[420px] rounded-full bg-[#7D8F69]/12 blur-3xl' />

      <section className='relative border-b border-[rgba(43,43,43,0.08)]'>
        <div className='mx-auto max-w-7xl px-4 py-8'>
          <div className='flex flex-wrap items-center justify-between gap-4'>
            <Link
              href='/shop'
              className='inline-flex items-center gap-2 rounded-full border border-[rgba(43,43,43,0.08)] bg-white/60 px-4 py-2 text-sm font-medium text-[#2B2B2B] shadow-[0_1px_2px_rgba(43,43,43,0.03)] backdrop-blur-md transition-colors hover:border-[#B76E5D]/40 hover:bg-white/85'
            >
              <ArrowLeft className='size-4' aria-hidden />
              {t('backToShop')}
            </Link>

            <span className='inline-flex items-center gap-1.5 rounded-full border border-[rgba(43,43,43,0.08)] bg-white/60 px-3 py-1.5 text-xs font-semibold text-[#2B2B2B] shadow-[0_1px_2px_rgba(43,43,43,0.03)] backdrop-blur-md'>
              <ShieldCheck className='size-3.5 text-[#7D8F69]' aria-hidden />
              {t('localCartBadge')}
            </span>
          </div>

          <div className='mt-10 max-w-3xl'>
            <p className='inline-flex items-center gap-2 rounded-full border border-[rgba(43,43,43,0.08)] bg-white/60 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-[#6E6A66] backdrop-blur-md'>
              <ShoppingBag className='size-3.5 text-[#B76E5D]' aria-hidden />
              {t('eyebrow')}
            </p>
            <h1 className='mt-4 text-4xl font-black tracking-[-0.045em] text-[#2B2B2B] md:text-6xl'>
              {t('title')}
            </h1>
            <p className='mt-4 max-w-2xl text-base leading-8 text-[#6E6A66] md:text-lg'>
              {t('subtitle')}
            </p>
          </div>
        </div>
      </section>

      <div className='relative mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-10 lg:grid-cols-[1fr_380px]'>
        <section className='space-y-4'>
          {!mounted ? (
            <CartLoadingState />
          ) : hasItems ? (
            <>
              <div className='flex items-center justify-between gap-4'>
                <p className='text-sm font-medium text-[#6E6A66]'>
                  {summary.itemCount === 1
                    ? t('itemCountOne')
                    : t('itemCountOther', { count: summary.itemCount })}
                </p>
                <button
                  type='button'
                  onClick={clearCart}
                  className='rounded-full border border-[rgba(43,43,43,0.08)] bg-white/60 px-4 py-2 text-sm font-medium text-[#6E6A66] backdrop-blur-md transition-colors hover:border-[#B76E5D]/30 hover:text-[#B76E5D]'
                >
                  {t('clearCart')}
                </button>
              </div>

              <ul className='space-y-3'>
                {items.map((item) => (
                  <li
                    key={item.variantId}
                    className='os-fade-up overflow-hidden rounded-[1.5rem] border border-[rgba(43,43,43,0.08)] bg-white/60 p-3 shadow-[0_1px_2px_rgba(43,43,43,0.03)] backdrop-blur-md'
                  >
                    <div className='grid gap-4 sm:grid-cols-[128px_1fr]'>
                      <Link
                        href={`/shop/${item.productId}`}
                        className='group/image block overflow-hidden rounded-[1.1rem] bg-[#EAE4DC]'
                      >
                        <div className='aspect-square'>
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className='size-full object-cover transition-transform duration-700 group-hover/image:scale-[1.05]'
                            />
                          ) : (
                            <div className='flex size-full items-center justify-center text-[#6E6A66]'>
                              <Package className='size-8' aria-hidden strokeWidth={1.5} />
                            </div>
                          )}
                        </div>
                      </Link>

                      <div className='flex min-w-0 flex-col gap-4 p-1'>
                        <div className='flex flex-wrap items-start justify-between gap-3'>
                          <div className='min-w-0'>
                            <p className='text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6E6A66]'>
                              {item.storeName}
                            </p>
                            <Link href={`/shop/${item.productId}`} className='mt-1 block'>
                              <h2 className='line-clamp-2 text-lg font-bold leading-tight tracking-tight text-[#2B2B2B] transition-colors hover:text-[#B76E5D]'>
                                {item.name}
                              </h2>
                            </Link>
                            <p className='mt-1 text-sm text-[#6E6A66]'>{item.title}</p>
                            <p className='mt-1 text-xs text-[#6E6A66]'>{item.sku}</p>
                          </div>

                          <p className='text-lg font-bold tabular-nums text-[#2B2B2B]'>
                            {formatRwf(getItemTotal(item))}
                            <span className='ml-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#6E6A66]'>
                              RWF
                            </span>
                          </p>
                        </div>

                        <div className='mt-auto flex flex-wrap items-center justify-between gap-3'>
                          <div className='inline-flex items-center rounded-full border border-[rgba(43,43,43,0.08)] bg-[#EAE4DC]/65 p-1 backdrop-blur'>
                            <button
                              type='button'
                              aria-label={t('decreaseQuantity', { name: item.name })}
                              onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                              className='inline-flex size-9 items-center justify-center rounded-full bg-white/85 text-[#2B2B2B] shadow-[0_1px_2px_rgba(43,43,43,0.04)] transition-colors hover:text-[#B76E5D]'
                            >
                              <Minus className='size-4' aria-hidden />
                            </button>
                            <span className='min-w-10 px-2 text-center text-sm font-semibold tabular-nums text-[#2B2B2B]'>
                              {item.quantity}
                            </span>
                            <button
                              type='button'
                              aria-label={t('increaseQuantity', { name: item.name })}
                              onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                              className='inline-flex size-9 items-center justify-center rounded-full bg-[#B76E5D] text-white shadow-[0_4px_12px_rgba(183,110,93,0.28)] transition-transform hover:-translate-y-0.5 hover:bg-[#A66250] active:scale-95'
                            >
                              <Plus className='size-4' aria-hidden />
                            </button>
                          </div>

                          <div className='flex items-center gap-3'>
                            <p className='text-sm text-[#6E6A66]'>
                              {formatRwf(item.price)} RWF {t('each')}
                            </p>
                            <button
                              type='button'
                              aria-label={t('removeItem', { name: item.name })}
                              onClick={() => removeItem(item.variantId)}
                              className='inline-flex size-10 items-center justify-center rounded-full border border-[rgba(43,43,43,0.08)] bg-white/60 text-[#6E6A66] backdrop-blur-md transition-colors hover:border-[#B76E5D]/30 hover:text-[#B76E5D]'
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
            <EmptyCart />
          )}
        </section>

        <aside className='lg:sticky lg:top-6 lg:self-start'>
          <div className='rounded-[1.75rem] border border-[rgba(43,43,43,0.08)] bg-white/65 p-6 shadow-[0_1px_2px_rgba(43,43,43,0.03),0_16px_36px_rgba(43,43,43,0.07)] backdrop-blur-lg'>
            <div className='flex items-center gap-3'>
              <span className='inline-flex size-11 items-center justify-center rounded-full bg-[#EAE4DC]/70 text-[#B76E5D]'>
                <CreditCard className='size-5' aria-hidden />
              </span>
              <div>
                <h2 className='text-lg font-bold tracking-tight text-[#2B2B2B]'>
                  {t('summaryTitle')}
                </h2>
                <p className='text-sm text-[#6E6A66]'>{t('summarySubtitle')}</p>
              </div>
            </div>

            <div className='my-6 h-px bg-[rgba(43,43,43,0.08)]' aria-hidden />

            <dl className='space-y-4'>
              <div className='flex items-center justify-between gap-4 text-sm'>
                <dt className='text-[#6E6A66]'>{t('subtotal')}</dt>
                <dd className='font-semibold tabular-nums text-[#2B2B2B]'>
                  {formatRwf(summary.subtotal)} RWF
                </dd>
              </div>
              <div className='flex items-center justify-between gap-4 text-sm'>
                <dt className='text-[#6E6A66]'>{t('delivery')}</dt>
                <dd className='font-semibold text-[#6E6A66]'>{t('calculatedLater')}</dd>
              </div>
              <div className='flex items-center justify-between gap-4 border-t border-[rgba(43,43,43,0.08)] pt-4'>
                <dt className='font-semibold text-[#2B2B2B]'>{t('estimatedTotal')}</dt>
                <dd className='text-2xl font-black tracking-tight tabular-nums text-[#2B2B2B]'>
                  {formatRwf(summary.subtotal)}
                  <span className='ml-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#6E6A66]'>
                    RWF
                  </span>
                </dd>
              </div>
            </dl>

            <button
              type='button'
              onClick={() => window.alert(t('checkoutComingSoon'))}
              disabled={!hasItems}
              className='mt-6 inline-flex h-12 w-full items-center justify-center rounded-full bg-[#B76E5D] px-6 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(183,110,93,0.28)] transition-all hover:-translate-y-0.5 hover:bg-[#A66250] disabled:pointer-events-none disabled:opacity-45'
            >
              {t('checkout')}
            </button>
            <p className='mt-3 text-center text-xs leading-5 text-[#6E6A66]'>
              {t('checkoutHint')}
            </p>
          </div>
        </aside>
      </div>
    </main>
  )
}

function CartLoadingState() {
  return (
    <div className='space-y-3'>
      {CART_LOADING_ITEMS.map((item) => (
        <div
          key={item}
          className='grid animate-pulse gap-4 rounded-[1.5rem] border border-[rgba(43,43,43,0.08)] bg-white/60 p-3 backdrop-blur-md sm:grid-cols-[128px_1fr]'
        >
          <div className='aspect-square rounded-[1.1rem] bg-[#EAE4DC]' />
          <div className='space-y-3 p-1'>
            <div className='h-3 w-24 rounded-md bg-[#EAE4DC]' />
            <div className='h-5 w-3/4 rounded-md bg-[#EAE4DC]' />
            <div className='h-4 w-40 rounded-md bg-[#EAE4DC]' />
            <div className='h-10 w-36 rounded-full bg-[#EAE4DC]' />
          </div>
        </div>
      ))}
    </div>
  )
}

function EmptyCart() {
  const t = useTranslations('cart')

  return (
    <div className='rounded-[1.75rem] border border-[rgba(43,43,43,0.08)] bg-white/60 px-6 py-16 text-center shadow-[0_1px_2px_rgba(43,43,43,0.03)] backdrop-blur-md'>
      <div className='mx-auto flex size-16 items-center justify-center rounded-full bg-[#EAE4DC]/70 text-[#B76E5D]'>
        <ShoppingBag className='size-7' aria-hidden />
      </div>
      <h2 className='mt-5 text-2xl font-bold tracking-tight text-[#2B2B2B]'>
        {t('emptyTitle')}
      </h2>
      <p className='mx-auto mt-2 max-w-md text-sm leading-6 text-[#6E6A66]'>
        {t('emptyBody')}
      </p>
      <Link
        href='/shop'
        className='mt-6 inline-flex h-11 items-center justify-center rounded-full bg-[#B76E5D] px-6 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(183,110,93,0.28)] transition-transform hover:-translate-y-0.5 hover:bg-[#A66250]'
      >
        {t('startShopping')}
      </Link>
    </div>
  )
}
