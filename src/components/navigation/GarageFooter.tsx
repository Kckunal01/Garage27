import Link from 'next/link'
import { FOOTER } from './nav-config'

function InstagramGlyph() {
  // Instagram's glyph: rounded square, lens, flash dot.
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  )
}

/**
 * The one Garage 27 footer: track order, legal, help, Instagram.
 * No hours, addresses, cart or duplicate primary navigation.
 */
export function GarageFooter() {
  return (
    <footer className="gfoot">
      <div className="gfoot__inner">
        <Link href={FOOTER.trackOrder.href} className="gfoot__track">
          <span>{FOOTER.trackOrder.label}</span>
          <svg viewBox="0 0 22 16" width="18" height="13" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M1 8h19M13.5 1.5 20 8l-6.5 6.5" />
          </svg>
        </Link>

        <nav className="gfoot__legal" aria-label="Legal">
          <p className="gfoot__label">LEGAL</p>
          <ul>
            {FOOTER.legal.map((l) => (
              <li key={l.href}>
                <Link href={l.href}>{l.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="gfoot__row">
          <Link href={FOOTER.help.href} className="gfoot__help">
            {FOOTER.help.label}
          </Link>
          <a className="gfoot__ig" href={FOOTER.instagram} target="_blank" rel="noopener noreferrer" aria-label="Garage 27 on Instagram">
            <InstagramGlyph />
          </a>
        </div>

        <p className="gfoot__base">© {new Date().getFullYear()} GARAGE 27 · BUILT DIFFERENT. ALWAYS.</p>
      </div>
    </footer>
  )
}
