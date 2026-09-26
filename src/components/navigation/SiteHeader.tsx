import { GarageLogo } from '@/components/garage-ui/GarageLogo'
import { GarageNav } from './GarageNav'
import { GarageRack } from './GarageRack'
import { CartLink } from './CartLink'

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <GarageLogo size="sm" />
        <div className="site-header__nav">
          <GarageNav variant="bar" />
        </div>
        <div className="site-header__tools">
          <CartLink />
          <GarageRack />
        </div>
      </div>
    </header>
  )
}
