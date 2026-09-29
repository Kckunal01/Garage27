import Link from 'next/link'
import { GarageLogo } from '@/components/garage-ui/GarageLogo'
import { CONTACT, FOOTER } from './nav-config'

const glyph = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true } as const

const Mail = () => (
  <svg {...glyph}>
    <rect x="3" y="5.5" width="18" height="13" rx="1.5" />
    <path d="m3.5 6.5 8.5 6.5 8.5-6.5" />
  </svg>
)
const Phone = () => (
  <svg {...glyph}>
    <path d="M5 3.8h3.2l1.6 4-2.1 1.3a11 11 0 0 0 7.2 7.2l1.3-2.1 4 1.6V19a1.6 1.6 0 0 1-1.7 1.6A16.6 16.6 0 0 1 3.4 5.5 1.6 1.6 0 0 1 5 3.8Z" />
  </svg>
)
const Instagram = () => (
  <svg {...glyph}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4.2" />
    <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none" />
  </svg>
)
const WhatsApp = () => (
  <svg {...glyph}>
    <path d="M4 20.2 5.2 16A8.6 8.6 0 1 1 8.4 19Z" />
    <path d="M9 8.6c.2-.5.5-.6.8-.6h.5c.2 0 .4 0 .5.4l.7 1.6c.1.2 0 .4-.1.6l-.5.6c-.1.1-.2.3 0 .5a6 6 0 0 0 2.9 2.6c.2.1.4 0 .5-.1l.7-.8c.2-.2.4-.2.6-.1l1.6.8c.2.1.3.2.3.4 0 .5-.2 1.2-.7 1.5-.5.4-1.4.6-2.4.3a9 9 0 0 1-5.1-4.4c-.6-1.1-.5-2.3.2-2.8Z" />
  </svg>
)

/**
 * The one Garage 27 footer, rendered once by the root layout after the page
 * content (normal flow, never fixed): logo, then three equal columns —
 * Pages, Quick links, Support — then the copyright line.
 */
export function GarageFooter() {
  return (
    <footer className="gfoot">
      <div className="gfoot__inner">
        <div className="gfoot__brand">
          <GarageLogo size="md" />
          <p className="gfoot__tag">BUILT DIFFERENT. ALWAYS.</p>
        </div>

        <div className="gfoot__cols">
          <nav className="gfoot__col" aria-labelledby="gfoot-pages">
            <h2 id="gfoot-pages" className="gfoot__head">
              PAGES
            </h2>
            <ul className="gfoot__list">
              {FOOTER.pages.map((l) => (
                <li key={l.href}>
                  <Link href={l.href}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav className="gfoot__col" aria-labelledby="gfoot-quick">
            <h2 id="gfoot-quick" className="gfoot__head">
              QUICK LINKS
            </h2>
            <ul className="gfoot__list">
              {FOOTER.quickLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="gfoot__col">
            <h2 className="gfoot__head">SUPPORT</h2>
            <ul className="gfoot__list gfoot__contact">
              <li>
                <a href={`mailto:${CONTACT.email}`}>
                  <Mail />
                  <span>{CONTACT.email}</span>
                </a>
              </li>
              <li>
                <a href={`tel:${CONTACT.phoneE164}`}>
                  <Phone />
                  <span>{CONTACT.phone}</span>
                </a>
              </li>
            </ul>
            <ul className="gfoot__social">
              <li>
                <a href={CONTACT.instagram} target="_blank" rel="noopener noreferrer" aria-label="Garage 27 on Instagram">
                  <Instagram />
                </a>
              </li>
              <li>
                <a href={CONTACT.whatsapp} target="_blank" rel="noopener noreferrer" aria-label="Message Garage 27 on WhatsApp">
                  <WhatsApp />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="gfoot__base">
          <p>© {new Date().getFullYear()} GARAGE 27. ALL RIGHTS RESERVED.</p>
          <p className="gfoot__motto">MOTORCYCLES. PEOPLE. GOOD TIMES.</p>
        </div>
      </div>
    </footer>
  )
}
