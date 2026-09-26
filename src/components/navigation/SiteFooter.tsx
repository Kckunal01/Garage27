import Link from 'next/link'
import { GarageLogo } from '@/components/garage-ui/GarageLogo'
import { CONTACT, PRIMARY_NAV } from './nav-config'

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="site-footer__grid">
          <div>
            <GarageLogo size="md" />
            <p className="tagline" style={{ marginTop: 14 }}>
              RIDE. RESTORE. REPEAT.
            </p>
          </div>
          <div className="site-footer__cols">
            <div>
              <p className="label">THE GARAGE</p>
              <ul>
                {PRIMARY_NAV.map((n) => (
                  <li key={n.href}>
                    <Link href={n.href}>{n.label.charAt(0) + n.label.slice(1).toLowerCase()}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="label">SHOP</p>
              <ul>
                <li>
                  <Link href="/parts">All parts</Link>
                </li>
                <li>
                  <Link href="/cart">Cart</Link>
                </li>
                <li>
                  <Link href="/service#request">Doorstep installation</Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="label">FIND US</p>
              <ul>
                <li className="muted">{CONTACT.hours}</li>
                <li>
                  <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
                </li>
                <li>
                  <a href={CONTACT.instagram} rel="noopener noreferrer" target="_blank">
                    Instagram
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="site-footer__base">
          <p className="label">© {new Date().getFullYear()} GARAGE 27</p>
          <p className="label">BUILT DIFFERENT. ALWAYS.</p>
        </div>
      </div>
    </footer>
  )
}
