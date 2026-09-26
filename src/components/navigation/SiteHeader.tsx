import { GarageLogo } from '@/components/garage-ui/GarageLogo'
import { GarageRack } from './GarageRack'
import { CartLink } from './CartLink'
import { HeaderShell } from './ChromeShell'

/**
 * Top utility chrome: brand mark (left) + cart and rack (right).
 * It deliberately contains NO primary navigation — that is GarageNav, bottom.
 */
export function SiteHeader() {
  return (
    <HeaderShell>
      <div className="site-header__inner">
        <div className="site-header__brand">
          <GarageLogo size="sm" />
        </div>
        <div className="site-header__tools">
          <div className="site-header__cart">
            <CartLink />
          </div>
          <GarageRack />
        </div>
      </div>
    </HeaderShell>
  )
}
