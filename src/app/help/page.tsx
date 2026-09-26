import type { Metadata } from 'next'
import Link from 'next/link'
import { CONTACT, FOOTER } from '@/components/navigation/nav-config'
import { pageMetadata } from '@/lib/seo/metadata'

export const metadata: Metadata = pageMetadata({
  title: 'Help',
  description: 'Track a parts order, follow up on a custom build quote or a service request, and reach the Garage 27 team.',
  path: '/help',
})

const TOPICS = [
  { q: 'Where is my parts order?', a: 'Use your order reference (it starts with G27-O-) to see its live status.', href: FOOTER.trackOrder.href, cta: 'TRACK ORDER' },
  { q: 'I requested a custom build quote.', a: 'A builder reviews every configuration and replies to the email you gave, quoting your G27-Q- reference.', href: '/build', cta: 'BUILD ANOTHER' },
  { q: 'I booked a service.', a: 'A builder calls you back within one working day about your G27-S- request.', href: '/service', cta: 'SERVICE' },
  { q: 'Returns, refunds and shipping', a: 'See the policies that apply to parts orders.', href: '/legal/refunds', cta: 'POLICIES' },
]

export default function HelpPage() {
  return (
    <div className="wrap section--tight doc-page">
      <p className="doc-page__kicker">HELP</p>
      <h1 className="doc-page__title">How can we help?</h1>
      <ul className="help-list">
        {TOPICS.map((t) => (
          <li key={t.q} className="help-item">
            <h2 className="help-item__q">{t.q}</h2>
            <p className="help-item__a">{t.a}</p>
            <Link className="gpill gpill--line help-item__cta" href={t.href}>
              <span>{t.cta}</span>
              <span aria-hidden="true">→</span>
            </Link>
          </li>
        ))}
      </ul>
      <p className="doc-page__notice">
        Still stuck? Write to{' '}
        <a className="neon-link" href={`mailto:${CONTACT.email}`}>
          {CONTACT.email}
        </a>{' '}
        with your reference.
      </p>
    </div>
  )
}
