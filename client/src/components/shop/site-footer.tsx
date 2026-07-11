'use client'

import { ArrowRight, Facebook, Instagram, Linkedin, Mail, MapPin, Phone, Store } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { Link } from '@/i18n/navigation'
import { merchantSignupHref } from '@/lib/auth-return-url'
import { resolveFooterTheme } from '@/lib/footer-theme'
import type { BrandColorsWithTemplate, StoreTemplateId } from '@/lib/store-templates'
import { cn } from '@/lib/utils'

export type SiteFooterStoreContext = {
  displayName: string
  subdomain: string
  logoUrl: string | null
  description?: string | null
  contactEmail?: string | null
  contactPhone?: string | null
  template?: StoreTemplateId
  brandColors?: BrandColorsWithTemplate | null
  /** True when the site is opened on the store’s subdomain host. */
  isSubdomainHost: boolean
  /** Absolute URL to marketplace /shop on the apex host (only when `isSubdomainHost`). */
  marketplaceShopAbsoluteHref: string | null
  /** e.g. `store=myshop` — used on the marketplace host with `?store=` so links stay in-store. */
  listingSearch?: string
}

interface SiteFooterProps {
  className?: string
  store?: SiteFooterStoreContext
}

function withStoreListing(path: string, params: Record<string, string>, listingSearch?: string) {
  const p = new URLSearchParams(params)
  if (listingSearch) {
    const inner = new URLSearchParams(listingSearch)
    inner.forEach((v, k) => p.set(k, v))
  }
  const s = p.toString()
  return s ? `${path}?${s}` : path
}

export function SiteFooter({ className, store }: SiteFooterProps) {
  const t = useTranslations('footer')
  const ts = useTranslations('footer.store')
  const year = new Date().getFullYear()

  if (store) {
    const listing = store.listingSearch
    const theme = resolveFooterTheme(store.template ?? 'DEFAULT')
    const aboutText =
      store.description?.trim() || ts('about', { store: store.displayName })
    const contactEmail = store.contactEmail?.trim() || t('contact.email')
    const contactPhone = store.contactPhone?.trim() || t('contact.phone')
    const contactPhoneTel =
      store.contactPhone?.replace(/\s/g, '') || t('contact.phoneTel')
    const ctaButtonClass =
      'h-11 w-fit rounded-full border-0 px-6 text-sm font-semibold shadow-regular-sm transition-colors'
    const ctaButtonStyle = {
      backgroundColor: theme.buttonBackground,
      color: theme.buttonText,
    }
    const initials = store.displayName
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? '')
      .join('') || store.subdomain.slice(0, 2).toUpperCase()

    return (
      <footer
        className={cn('relative isolate overflow-hidden border-t text-white', className)}
        style={{ borderTopColor: theme.borderColor }}
      >
        <div
          aria-hidden
          className='pointer-events-none absolute inset-0 opacity-100'
          style={{ background: theme.background }}
        />
        <div
          aria-hidden
          className='pointer-events-none absolute inset-0 opacity-20'
          style={{
            backgroundImage: 'radial-gradient(rgba(255,255,255,0.18) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
            backgroundPosition: '0 0',
            maskImage:
              'linear-gradient(to bottom, rgba(0,0,0,0.9), rgba(0,0,0,0.35) 65%, rgba(0,0,0,0))',
            WebkitMaskImage:
              'linear-gradient(to bottom, rgba(0,0,0,0.9), rgba(0,0,0,0.35) 65%, rgba(0,0,0,0))',
          }}
        />

        <div className='relative mx-auto w-full max-w-screen-2xl px-3 py-14 sm:px-4 lg:px-5'>
          <div className='grid gap-10 lg:grid-cols-[1.25fr_0.85fr_0.85fr_1.05fr]'>
            <div className='space-y-4'>
              <div className='inline-flex items-center gap-3'>
                {store.logoUrl ? (
                  <span className='grid size-11 shrink-0 place-items-center overflow-hidden rounded-2xl bg-white/12 ring-1 ring-white/18'>
                    <img src={store.logoUrl} alt={store.displayName} className='size-full object-cover' />
                  </span>
                ) : (
                  <span className='grid size-11 shrink-0 place-items-center rounded-2xl bg-white/12 text-sm font-black tracking-tight ring-1 ring-white/18'>
                    {initials}
                  </span>
                )}
                <div className='min-w-0'>
                  <p className='truncate text-base font-black tracking-tight'>{store.displayName}</p>
                  <p className='flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-white/70'>
                    <Store className='size-3.5 shrink-0' aria-hidden strokeWidth={2.25} />
                    {ts('brandTagline')}
                  </p>
                </div>
              </div>
              <p className='max-w-sm text-sm leading-6 text-white/75'>{aboutText}</p>
              {store.isSubdomainHost ? (
                store.marketplaceShopAbsoluteHref ? (
                  <Button
                    asChild
                    type='button'
                    className={ctaButtonClass}
                    style={ctaButtonStyle}
                  >
                    <a href={store.marketplaceShopAbsoluteHref} className='inline-flex items-center gap-2'>
                      {ts('exploreMarketplace')}
                      <ArrowRight className='size-4' aria-hidden />
                    </a>
                  </Button>
                ) : (
                  <Button
                    asChild
                    type='button'
                    className={ctaButtonClass}
                    style={ctaButtonStyle}
                  >
                    <Link href='/shop' className='inline-flex items-center gap-2'>
                      {ts('exploreMarketplace')}
                      <ArrowRight className='size-4' aria-hidden />
                    </Link>
                  </Button>
                )
              ) : (
                <Button
                  asChild
                  type='button'
                  className={ctaButtonClass}
                  style={ctaButtonStyle}
                >
                  <Link href='/shop' className='inline-flex items-center gap-2'>
                    {ts('browseAllStores')}
                    <ArrowRight className='size-4' aria-hidden />
                  </Link>
                </Button>
              )}
              <p className='text-xs leading-relaxed text-white/60'>{ts('platformBlurb')}</p>
              <div className='flex items-center gap-3'>
                <a
                  href={t('social.instagramHref')}
                  target='_blank'
                  rel='noopener'
                  aria-label={t('social.instagram')}
                  className='inline-flex size-10 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/18 transition-colors hover:bg-white/16 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70'
                >
                  <Instagram className='size-4' aria-hidden />
                </a>
                <a
                  href={t('social.facebookHref')}
                  target='_blank'
                  rel='noopener'
                  aria-label={t('social.facebook')}
                  className='inline-flex size-10 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/18 transition-colors hover:bg-white/16 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70'
                >
                  <Facebook className='size-4' aria-hidden />
                </a>
                <a
                  href={t('social.linkedinHref')}
                  target='_blank'
                  rel='noopener'
                  aria-label={t('social.linkedin')}
                  className='inline-flex size-10 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/18 transition-colors hover:bg-white/16 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70'
                >
                  <Linkedin className='size-4' aria-hidden />
                </a>
              </div>
            </div>

            <div className='space-y-4'>
              <p className='text-sm font-bold tracking-tight'>{ts('quickLinksTitle')}</p>
              <ul className='space-y-2 text-sm'>
                <li>
                  <Link
                    className='text-white/75 transition-colors hover:text-white'
                    href={withStoreListing('/shop', {}, listing)}
                  >
                    {ts('quickLinks.storefront')}
                  </Link>
                </li>
                <li>
                  <Link
                    className='text-white/75 transition-colors hover:text-white'
                    href={withStoreListing('/cart', {}, listing)}
                  >
                    {ts('quickLinks.cart')}
                  </Link>
                </li>
                <li>
                  <Link
                    className='text-white/75 transition-colors hover:text-white'
                    href={withStoreListing('/shop', { sort: 'trending' }, listing)}
                  >
                    {ts('quickLinks.trending')}
                  </Link>
                </li>
                <li>
                  <Link
                    className='text-white/75 transition-colors hover:text-white'
                    href={withStoreListing('/shop', { sort: 'newest' }, listing)}
                  >
                    {ts('quickLinks.newArrivals')}
                  </Link>
                </li>
              </ul>
            </div>

            <div className='space-y-4'>
              <p className='text-sm font-bold tracking-tight'>{ts('platformTitle')}</p>
              <ul className='space-y-2 text-sm'>
                <li>
                  <Link className='text-white/75 transition-colors hover:text-white' href='/'>
                    {t('company.about')}
                  </Link>
                </li>
                <li>
                  <Link
                    className='text-white/75 transition-colors hover:text-white'
                    href={merchantSignupHref() as '/signup'}
                  >
                    {t('company.sell')}
                  </Link>
                </li>
                <li>
                  <a className='text-white/75 transition-colors hover:text-white' href={t('company.helpHref')}>
                    {t('company.help')}
                  </a>
                </li>
                <li>
                  <a className='text-white/75 transition-colors hover:text-white' href={t('company.contactHref')}>
                    {t('company.contact')}
                  </a>
                </li>
              </ul>
            </div>

            <div className='space-y-4'>
              <p className='text-sm font-bold tracking-tight'>{t('getInTouchTitle')}</p>
              <ul className='space-y-3 text-sm text-white/75'>
                <li className='flex items-start gap-3'>
                  <span className='mt-0.5 grid size-9 shrink-0 place-items-center rounded-full bg-white/10 ring-1 ring-white/18'>
                    <Mail className='size-4' aria-hidden />
                  </span>
                  <div className='min-w-0'>
                    <p className='font-semibold text-white'>{t('contact.emailLabel')}</p>
                    <a className='break-all transition-colors hover:text-white' href={`mailto:${contactEmail}`}>
                      {contactEmail}
                    </a>
                  </div>
                </li>
                <li className='flex items-start gap-3'>
                  <span className='mt-0.5 grid size-9 shrink-0 place-items-center rounded-full bg-white/10 ring-1 ring-white/18'>
                    <Phone className='size-4' aria-hidden />
                  </span>
                  <div className='min-w-0'>
                    <p className='font-semibold text-white'>{t('contact.phoneLabel')}</p>
                    <a className='transition-colors hover:text-white' href={`tel:${contactPhoneTel}`}>
                      {contactPhone}
                    </a>
                  </div>
                </li>
                <li className='flex items-start gap-3'>
                  <span className='mt-0.5 grid size-9 shrink-0 place-items-center rounded-full bg-white/10 ring-1 ring-white/18'>
                    <MapPin className='size-4' aria-hidden />
                  </span>
                  <div className='min-w-0'>
                    <p className='font-semibold text-white'>{t('contact.locationLabel')}</p>
                    <p className='leading-6'>{t('contact.location')}</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          <div className='mt-12 border-t border-white/18 pt-6'>
            <div className='flex flex-col gap-3 text-sm text-white/70 md:flex-row md:items-center md:justify-between'>
              <p>{ts('copyright', { year, store: store.displayName })}</p>
              <div className='flex flex-wrap items-center gap-x-5 gap-y-2'>
                <a className='transition-colors hover:text-white' href={t('legal.privacyHref')}>
                  {t('legal.privacy')}
                </a>
                <a className='transition-colors hover:text-white' href={t('legal.termsHref')}>
                  {t('legal.terms')}
                </a>
                <a className='transition-colors hover:text-white' href={t('legal.cookiesHref')}>
                  {t('legal.cookies')}
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    )
  }

  return (
    <footer
      className={cn(
        'relative isolate overflow-hidden border-t border-[#178c4e]/35 bg-[#1daf61] text-white',
        className,
      )}
    >
      <div
        aria-hidden
        className='pointer-events-none absolute inset-0 opacity-100'
        style={{
          background:
            'radial-gradient(900px 460px at 10% 0%, rgba(255,255,255,0.22), transparent 65%), radial-gradient(720px 420px at 92% 10%, rgba(125,143,105,0.26), transparent 62%), radial-gradient(520px 340px at 55% 35%, rgba(0,0,0,0.12), transparent 70%), linear-gradient(180deg, rgba(29, 175, 97,1) 0%, rgba(166,98,80,1) 55%, rgba(117,63,50,1) 100%)',
        }}
      />
      <div
        aria-hidden
        className='pointer-events-none absolute inset-0 opacity-20'
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.18) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
          backgroundPosition: '0 0',
          maskImage:
            'linear-gradient(to bottom, rgba(0,0,0,0.9), rgba(0,0,0,0.35) 65%, rgba(0,0,0,0))',
          WebkitMaskImage:
            'linear-gradient(to bottom, rgba(0,0,0,0.9), rgba(0,0,0,0.35) 65%, rgba(0,0,0,0))',
        }}
      />

      <div className='relative mx-auto w-full max-w-screen-2xl px-3 py-14 sm:px-4 lg:px-5'>
        <div className='grid gap-10 lg:grid-cols-[1.25fr_0.85fr_0.85fr_1.05fr]'>
          <div className='space-y-4'>
            <div className='inline-flex items-center gap-3'>
              <span className='grid size-11 place-items-center rounded-2xl bg-white/12 ring-1 ring-white/18'>
                <span className='text-sm font-black tracking-tight text-white'>OS</span>
              </span>
              <div>
                <p className='text-base font-black tracking-tight'>{t('brandName')}</p>
                <p className='text-xs font-semibold uppercase tracking-[0.16em] text-white/70'>{t('brandTagline')}</p>
              </div>
            </div>
            <p className='max-w-sm text-sm leading-6 text-white/75'>{t('about')}</p>
            <Button
              asChild
              type='button'
              className='h-11 w-fit rounded-full border-0 bg-white px-6 text-sm font-semibold text-[#1daf61] shadow-regular-sm transition-colors hover:bg-white/95 hover:text-[#178c4e]'
            >
              <Link href={merchantSignupHref() as '/signup'} className='inline-flex items-center gap-2'>
                {t('becomeSeller')}
                <ArrowRight className='size-4' aria-hidden />
              </Link>
            </Button>
            <div className='flex items-center gap-3'>
              <a
                href={t('social.instagramHref')}
                target='_blank'
                rel='noopener'
                aria-label={t('social.instagram')}
                className='inline-flex size-10 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/18 transition-colors hover:bg-white/16 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70'
              >
                <Instagram className='size-4' aria-hidden />
              </a>
              <a
                href={t('social.facebookHref')}
                target='_blank'
                rel='noopener'
                aria-label={t('social.facebook')}
                className='inline-flex size-10 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/18 transition-colors hover:bg-white/16 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70'
              >
                <Facebook className='size-4' aria-hidden />
              </a>
              <a
                href={t('social.linkedinHref')}
                target='_blank'
                rel='noopener'
                aria-label={t('social.linkedin')}
                className='inline-flex size-10 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/18 transition-colors hover:bg-white/16 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70'
              >
                <Linkedin className='size-4' aria-hidden />
              </a>
            </div>
          </div>

          <div className='space-y-4'>
            <p className='text-sm font-bold tracking-tight'>{t('quickLinksTitle')}</p>
            <ul className='space-y-2 text-sm'>
              <li>
                <Link className='text-white/75 transition-colors hover:text-white' href='/shop'>
                  {t('quickLinks.shop')}
                </Link>
              </li>
              <li>
                <Link className='text-white/75 transition-colors hover:text-white' href='/cart'>
                  {t('quickLinks.cart')}
                </Link>
              </li>
              <li>
                <Link className='text-white/75 transition-colors hover:text-white' href='/shop?sort=trending'>
                  {t('quickLinks.trending')}
                </Link>
              </li>
              <li>
                <Link className='text-white/75 transition-colors hover:text-white' href='/shop?sort=newest'>
                  {t('quickLinks.newArrivals')}
                </Link>
              </li>
            </ul>
          </div>

          <div className='space-y-4'>
            <p className='text-sm font-bold tracking-tight'>{t('companyTitle')}</p>
            <ul className='space-y-2 text-sm'>
              <li>
                <a className='text-white/75 transition-colors hover:text-white' href={t('company.aboutHref')}>
                  {t('company.about')}
                </a>
              </li>
              <li>
                <a className='text-white/75 transition-colors hover:text-white' href={t('company.sellHref')}>
                  {t('company.sell')}
                </a>
              </li>
              <li>
                <a className='text-white/75 transition-colors hover:text-white' href={t('company.helpHref')}>
                  {t('company.help')}
                </a>
              </li>
              <li>
                <a className='text-white/75 transition-colors hover:text-white' href={t('company.contactHref')}>
                  {t('company.contact')}
                </a>
              </li>
            </ul>
          </div>

          <div className='space-y-4'>
            <p className='text-sm font-bold tracking-tight'>{t('getInTouchTitle')}</p>
            <ul className='space-y-3 text-sm text-white/75'>
              <li className='flex items-start gap-3'>
                <span className='mt-0.5 grid size-9 shrink-0 place-items-center rounded-full bg-white/10 ring-1 ring-white/18'>
                  <Mail className='size-4' aria-hidden />
                </span>
                <div className='min-w-0'>
                  <p className='font-semibold text-white'>{t('contact.emailLabel')}</p>
                  <a className='break-all transition-colors hover:text-white' href={`mailto:${t('contact.email')}`}>
                    {t('contact.email')}
                  </a>
                </div>
              </li>
              <li className='flex items-start gap-3'>
                <span className='mt-0.5 grid size-9 shrink-0 place-items-center rounded-full bg-white/10 ring-1 ring-white/18'>
                  <Phone className='size-4' aria-hidden />
                </span>
                <div className='min-w-0'>
                  <p className='font-semibold text-white'>{t('contact.phoneLabel')}</p>
                  <a className='transition-colors hover:text-white' href={`tel:${t('contact.phoneTel')}`}>
                    {t('contact.phone')}
                  </a>
                </div>
              </li>
              <li className='flex items-start gap-3'>
                <span className='mt-0.5 grid size-9 shrink-0 place-items-center rounded-full bg-white/10 ring-1 ring-white/18'>
                  <MapPin className='size-4' aria-hidden />
                </span>
                <div className='min-w-0'>
                  <p className='font-semibold text-white'>{t('contact.locationLabel')}</p>
                  <p className='leading-6'>{t('contact.location')}</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className='mt-12 border-t border-white/18 pt-6'>
          <div className='flex flex-col gap-3 text-sm text-white/70 md:flex-row md:items-center md:justify-between'>
            <p>{t('copyright', { year })}</p>
            <div className='flex flex-wrap items-center gap-x-5 gap-y-2'>
              <a className='transition-colors hover:text-white' href={t('legal.privacyHref')}>
                {t('legal.privacy')}
              </a>
              <a className='transition-colors hover:text-white' href={t('legal.termsHref')}>
                {t('legal.terms')}
              </a>
              <a className='transition-colors hover:text-white' href={t('legal.cookiesHref')}>
                {t('legal.cookies')}
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
