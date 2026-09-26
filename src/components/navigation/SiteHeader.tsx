import { GarageLogo } from '@/components/garage-ui/GarageLogo'
import { GarageRack } from './GarageRack'
import { HeaderShell } from './ChromeShell'

/**
 * Global header: official logo top-left, drawer control top-right — the
 * Home reference geometry, on every page. No cart, no navigation.
 */
export function SiteHeader() {
  return (
    <HeaderShell>
      <div className="site-header__inner">
        <div className="site-header__brand">
          <GarageLogo size="sm" />
        </div>
        <GarageRack />
      </div>
    </HeaderShell>
  )
}
