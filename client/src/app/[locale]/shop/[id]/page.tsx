import { headers } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { Check, MapPin, Package, ShieldCheck, Store, Truck } from 'lucide-react'

import { Link } from '@/i18n/navigation'
import { fetchCatalogProductById } from '@/services/catalog.service'
import { Button } from '@/components/ui/button'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { CartIconButton } from '@/components/shop/cart-icon-button'
import { extractSubdomain, isProductId, normalizeStoreSubdomain } from '@/lib/host'

function formatRwf(amount: number): string {
  return new Intl.NumberFormat('en-RW', { maximumFractionDigits: 0 }).format(amount)
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>
}): Promise<Metadata> {
  const { locale, id } = await params
  const t = await getTranslations({ locale, namespace: 'product' })
  const headersList = await headers()
  const subdomain = extractSubdomain(headersList.get('host'))
  const storeSlug = !subdomain && !isProductId(id) ? normalizeStoreSubdomain(id) : null
  if (storeSlug) {
    const marketplace = await getTranslations({ locale, namespace: 'marketplace' })
    return {
      title: marketplace('storeMetaTitle', { store: storeSlug }),
      description: marketplace('storeMetaDescription', { store: storeSlug }),
    }
  }

  const { data } = await fetchCatalogProductById(id, { subdomain })
  if (!data) return { title: t('title') }
  return {
    title: `${data.name} — ${t('title')}`,
    description: data.description ?? undefined,
  }
}

export default async function ProductDetailsPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>
}) {
  const { locale, id } = await params
  const t = await getTranslations('product')
  const headersList = await headers()
  const subdomain = extractSubdomain(headersList.get('host'))
  const storeSlug = !subdomain && !isProductId(id) ? normalizeStoreSubdomain(id) : null
  if (storeSlug) {
    redirect(`/${locale}/shop?store=${encodeURIComponent(storeSlug)}`)
  }

  const { data, devHint } = await fetchCatalogProductById(id, { subdomain })

  if (!data) {
    if (process.env.NODE_ENV === 'development' && devHint) {
      return (
        <div className='mx-auto max-w-3xl px-4 py-16'>
          <p className='text-center text-[#2B2B2B]'>{t('notFound')}</p>
          <pre className='mt-4 overflow-x-auto rounded-md border border-[rgba(43,43,43,0.08)] bg-white/70 p-3 text-left text-xs break-words whitespace-pre-wrap text-[#6E6A66] backdrop-blur-md'>
            {devHint}
          </pre>
          <div className='mt-6 flex justify-center'>
            <Button asChild variant='outline' className='rounded-full border-[rgba(43,43,43,0.08)] bg-white/60 text-[#2B2B2B] backdrop-blur-md hover:bg-white/85 hover:text-[#2B2B2B]'>
              <Link href='/shop'>{t('backToShop')}</Link>
            </Button>
          </div>
        </div>
      )
    }
    notFound()
  }

  const img = data.primaryImage ?? data.images[0]
  const hasDiscount =
    data.compareAtFrom != null && data.priceFrom != null && data.compareAtFrom > data.priceFrom

  return (
    <div className='min-h-screen bg-[#F5F1EB] text-[#2B2B2B]'>
      <CartIconButton />

      <div className='border-b border-[rgba(43,43,43,0.08)] bg-[#F5F1EB]'>
        <div className='mx-auto max-w-6xl px-4 py-6'>
          <div className='flex items-center justify-between'>
            <Button
              asChild
              variant='ghost'
              className='rounded-full text-[#2B2B2B] hover:bg-white/60 hover:text-[#2B2B2B]'
            >
              <Link href='/shop'>{t('backToShop')}</Link>
            </Button>
            <span className='inline-flex items-center gap-1.5 rounded-full border border-[rgba(43,43,43,0.08)] bg-white/60 px-3 py-1.5 text-xs font-semibold text-[#2B2B2B] shadow-[0_1px_2px_rgba(43,43,43,0.03)] backdrop-blur-md'>
              <ShieldCheck className='size-3.5 text-[#7D8F69]' aria-hidden strokeWidth={2.25} />
              {t('approvedStore')}
            </span>
          </div>
        </div>
      </div>

      <div className='mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 py-10 lg:grid-cols-[1.15fr_0.85fr]'>
        <div className='space-y-4'>
          <div className='os-soft-pop group overflow-hidden rounded-[1.75rem] border border-[rgba(43,43,43,0.08)] bg-white/60 shadow-[0_1px_2px_rgba(43,43,43,0.03),0_8px_24px_rgba(43,43,43,0.05)] backdrop-blur-md transition-shadow duration-500 hover:shadow-[0_2px_4px_rgba(43,43,43,0.04),0_24px_48px_rgba(43,43,43,0.10)]'>
            <AspectRatio ratio={1}>
              {img ? (
                <img
                  src={img}
                  alt={data.name}
                  className='size-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover:scale-[1.04]'
                />
              ) : (
                <div className='flex size-full items-center justify-center bg-[#EAE4DC] text-[#6E6A66]'>
                  <Package className='size-12' aria-hidden strokeWidth={1.25} />
                </div>
              )}
            </AspectRatio>
          </div>

          {data.tags.length ? (
            <div className='flex flex-wrap gap-2'>
              {data.tags.slice(0, 10).map((tag) => (
                <span
                  key={tag}
                  className='inline-flex items-center rounded-full border border-[rgba(43,43,43,0.08)] bg-white/60 px-3 py-1 text-xs font-medium text-[#6E6A66] backdrop-blur-md'
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        <div className='space-y-6'>
          <div className='os-fade-up space-y-3' style={{ animationDelay: '60ms' }}>
            <div className='flex flex-wrap items-center gap-2'>
              <span className='inline-flex items-center gap-1.5 rounded-full border border-[rgba(43,43,43,0.08)] bg-white/60 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#2B2B2B] backdrop-blur-md'>
                <Store className='size-3.5 text-[#7D8F69]' aria-hidden strokeWidth={2.25} />
                {data.store.displayName}
              </span>
              <span className='inline-flex items-center rounded-full border border-[rgba(43,43,43,0.08)] bg-[#EAE4DC]/60 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#6E6A66]'>
                {data.category}
              </span>
            </div>
            <h1 className='text-3xl font-bold leading-tight tracking-tight text-[#2B2B2B] md:text-4xl'>
              {data.name}
            </h1>
            {data.description ? (
              <p className='text-[15px] leading-relaxed text-[#6E6A66]'>{data.description}</p>
            ) : null}
          </div>

          <div
            className='os-fade-up rounded-[1.5rem] border border-[rgba(43,43,43,0.08)] bg-white/60 p-6 shadow-[0_1px_2px_rgba(43,43,43,0.03)] backdrop-blur-md transition-shadow duration-500 hover:shadow-[0_2px_4px_rgba(43,43,43,0.04),0_16px_36px_rgba(43,43,43,0.06)]'
            style={{ animationDelay: '110ms' }}
          >
            <div className='flex items-end justify-between gap-4'>
              <div className='space-y-1'>
                <p className='text-xs font-semibold uppercase tracking-[0.12em] text-[#6E6A66]'>
                  {t('startingFrom')}
                </p>
                {data.priceFrom != null ? (
                  <div className='flex items-baseline gap-3'>
                    <p className='text-3xl font-bold tracking-tight tabular-nums text-[#2B2B2B]'>
                      {formatRwf(data.priceFrom)}
                      <span className='ml-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#6E6A66]'>
                        RWF
                      </span>
                    </p>
                    {hasDiscount ? (
                      <p className='text-sm font-medium tabular-nums text-[#6E6A66] line-through'>
                        {formatRwf(data.compareAtFrom as number)} RWF
                      </p>
                    ) : null}
                  </div>
                ) : (
                  <p className='text-lg text-[#6E6A66]'>—</p>
                )}
              </div>

              <Button
                type='button'
                className='h-12 rounded-full bg-[#B76E5D] px-6 text-white shadow-[0_8px_22px_rgba(183,110,93,0.28)] transition-transform hover:-translate-y-0.5 hover:bg-[#A66250] active:scale-[0.98]'
              >
                {t('addToCart')}
              </Button>
            </div>

            <div className='my-5 h-px bg-[rgba(43,43,43,0.08)]' aria-hidden />

            <ul className='grid gap-3 text-sm text-[#2B2B2B]'>
              <li className='flex items-center gap-2.5'>
                <span className='inline-flex size-6 items-center justify-center rounded-full border border-[rgba(43,43,43,0.08)] bg-[#EAE4DC]/70'>
                  <Check className='size-3.5 text-[#7D8F69]' aria-hidden strokeWidth={2.5} />
                </span>
                {t('fromStore', { name: data.store.displayName })}
              </li>
              {data.deliveryEnabled ? (
                <li className='flex items-center gap-2.5'>
                  <span className='inline-flex size-6 items-center justify-center rounded-full border border-[rgba(43,43,43,0.08)] bg-[#EAE4DC]/70'>
                    <Truck className='size-3.5 text-[#7D8F69]' aria-hidden strokeWidth={2.25} />
                  </span>
                  {t('deliveryEnabled')}
                </li>
              ) : (
                <li className='flex items-center gap-2.5 text-[#6E6A66]'>
                  <span className='inline-flex size-6 items-center justify-center rounded-full border border-[rgba(43,43,43,0.08)] bg-[#EAE4DC]/70'>
                    <Truck className='size-3.5 text-[#6E6A66]' aria-hidden strokeWidth={2.25} />
                  </span>
                  {t('deliveryDisabled')}
                </li>
              )}
              {data.deliveryLocation ? (
                <li className='flex items-center gap-2.5'>
                  <span className='inline-flex size-6 items-center justify-center rounded-full border border-[rgba(43,43,43,0.08)] bg-[#EAE4DC]/70'>
                    <MapPin className='size-3.5 text-[#7D8F69]' aria-hidden strokeWidth={2.25} />
                  </span>
                  {t('deliveryLocation', { location: data.deliveryLocation })}
                </li>
              ) : null}
            </ul>
          </div>

          <div
            className='os-fade-up overflow-hidden rounded-[1.5rem] border border-[rgba(43,43,43,0.08)] bg-white/60 shadow-[0_1px_2px_rgba(43,43,43,0.03)] backdrop-blur-md'
            style={{ animationDelay: '160ms' }}
          >
            <Accordion type='single' collapsible>
              <AccordionItem value='variants' className='border-b-0 px-6'>
                <AccordionTrigger className='text-[#2B2B2B] hover:no-underline'>
                  {t('variants')}
                </AccordionTrigger>
                <AccordionContent className='pb-6'>
                  <div className='grid gap-3'>
                    {data.variants.map((v) => (
                      <div
                        key={v.id}
                        className='flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-[rgba(43,43,43,0.08)] bg-[#EAE4DC]/55 px-4 py-3'
                      >
                        <div className='min-w-0'>
                          <p className='font-semibold text-[#2B2B2B]'>{v.title}</p>
                          <p className='text-xs text-[#6E6A66]'>{v.sku}</p>
                        </div>
                        <div className='flex items-center gap-3'>
                          <p className='font-semibold tabular-nums text-[#2B2B2B]'>
                            {formatRwf(v.price)}
                            <span className='ml-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#6E6A66]'>
                              RWF
                            </span>
                          </p>
                          {v.inventory ? (
                            <span className='inline-flex items-center rounded-full border border-[rgba(43,43,43,0.08)] bg-white/70 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#6E6A66] backdrop-blur'>
                              {t('inStock', { count: v.inventory.available })}
                            </span>
                          ) : (
                            <span className='inline-flex items-center rounded-full border border-[rgba(43,43,43,0.08)] bg-white/70 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#6E6A66] backdrop-blur'>
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
    </div>
  )
}
