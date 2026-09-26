import { GarageLogo } from '@/components/garage-ui/GarageLogo'
import { GarageNav } from './GarageNav'
import { GarageRack } from './GarageRack'
import { CartLink } from './CartLink'
import { HeaderShell } from './ChromeShell'

export function SiteHeader() {
  return (
    <HeaderShell>
      <div className="site-header__inner">
        <div className="site-header__brand">
          <GarageLogo size="sm" />
        </div>
        <div className="site-header__nav">
          <GarageNav variant="bar" />
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
