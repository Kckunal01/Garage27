import Link from 'next/link'

/**
 * The boundaries of the work Garage 27 accepts, shown where a service or build
 * is requested. Wording is Garage 27's own, from Terms & Conditions 15, 17 and 25.
 */
const CONFIRMATION = {
  service:
    'A service is confirmed only after Garage 27 has reviewed the request and communicated the applicable scope, pricing and requirements.',
  build:
    'A build created through the visualiser or submitted through Garage 27 is a design request and does not automatically constitute a final quotation.',
}

export function WorkStandardNote({ kind }: { kind: keyof typeof CONFIRMATION }) {
  return (
    <aside className="wstd" aria-label="Garage 27 work standard">
      <p className="wstd__label">GARAGE 27 WORK STANDARD</p>
      <p className="wstd__text">
        Garage 27 does not customise, install or transform motorcycles that are unsafe, materially damaged, unlawfully modified or otherwise
        unsuitable for professional work.
      </p>
      <p className="wstd__text">{CONFIRMATION[kind]}</p>
      <Link className="wstd__link" href="/terms-and-conditions#garage-27-work-standard">
        TERMS &amp; CONDITIONS <span aria-hidden="true">→</span>
      </Link>
    </aside>
  )
}
