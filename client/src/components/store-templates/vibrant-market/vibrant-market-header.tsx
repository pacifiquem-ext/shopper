import { VibrantMarketNavbar } from './vibrant-market-navbar'
import { VibrantMarketTicker } from './vibrant-market-ticker'

type VibrantMarketHeaderProps = {
  storeName: string
  logoUrl: string | null
  promoMessages: string[]
  tickerAria: string
  cartHref?: string
}

export function VibrantMarketHeader({
  storeName,
  logoUrl,
  promoMessages,
  tickerAria,
  cartHref,
}: VibrantMarketHeaderProps) {
  return (
    <div className='sticky top-0 z-50 border-b border-[var(--vm-border)] bg-[var(--vm-surface)] shadow-[0_2px_16px_rgba(15,23,42,0.06)]'>
      <VibrantMarketNavbar
        storeName={storeName}
        logoUrl={logoUrl}
        cartHref={cartHref}
      />
      <VibrantMarketTicker messages={promoMessages} ariaLabel={tickerAria} />
    </div>
  )
}
