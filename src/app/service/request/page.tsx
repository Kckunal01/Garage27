import type { Metadata } from 'next'
import Link from 'next/link'
import { BuildRequest } from '@/features/build/BuildRequest'
import { customisations, decodeConfiguration, getBikeBundle, sanitizeConfiguration } from '@/features/build/engine'
import { slotWhere } from '@/features/build/zones'
import { ContactForm } from '@/features/service/ContactForm'
import { getCatalogue } from '@/lib/catalogue/repository'
import { formatINR } from '@/lib/pricing/money'
import { pageMetadata } from '@/lib/seo/metadata'

export const metadata: Metadata = pageMetadata({
  title: 'Request a Build',
  description: 'Send your Garage 27 build or service request to the workshop. A builder comes back with a confirmed plan and quote.',
  path: '/service/request',
})

/**
 * The dedicated request page. From the visualizer (?c=<build>) it carries the
 * exact build — bike, colour and the add-ons chosen — into the request form;
 * without a build it is the workshop's service request.
 */
export default async function ServiceRequestPage({ searchParams }: PageProps<'/service/request'>) {
  const params = await searchParams
  const code = typeof params.c === 'string' ? params.c : null
  const catalogue = await getCatalogue()
  const decoded = code ? decodeConfiguration(code) : null
  const bundle = decoded?.bikeId ? getBikeBundle(catalogue, decoded.bikeId) : null

  if (bundle && decoded) {
    const config = sanitizeConfiguration(decoded, bundle)
    const colour = bundle.colours.find((c) => c.id === config.colourId)
    const { lines, total } = customisations(config, bundle, slotWhere)
    return (
      <div className="sreq">
        <div className="sreq__inner">
          <section className="sreq__build" aria-labelledby="sreq-title">
            <p className="sreq__label">REQUEST BUILD</p>
            <h1 id="sreq-title" className="sreq__bike">
              <span>{bundle.bike.brand.toUpperCase()}</span>
              {bundle.bike.name}
            </h1>
            {colour && !lines.some((l) => l.key === 'paint') && <p className="sreq__colour">{colour.name}</p>}
            {lines.length ? (
              <ul className="sreq__lines">
                {lines.map((l) => (
                  <li key={l.key}>
                    <span className="sreq__where">{l.where}</span>
                    <span className="sreq__name">{l.name}</span>
                    <span className="sreq__price">{formatINR(l.price)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="sreq__empty">NO CUSTOMISATIONS SELECTED</p>
            )}
            <p className="sreq__total">
              <span>CUSTOMISATION VALUE</span>
              <strong>{formatINR(total)}</strong>
            </p>
            <Link className="sreq__edit" href={`/build/visualiser?c=${code}`}>
              EDIT BUILD
            </Link>
          </section>
          <section className="sreq__form" aria-label="Your details">
            <BuildRequest configuration={config} value={total} />
          </section>
        </div>
      </div>
    )
  }

  return (
    <div className="sreq">
      <div className="sreq__inner sreq__inner--single">
        <section className="sreq__build">
          <p className="sreq__label">REQUEST A SERVICE</p>
          <h1 className="sreq__bike">Tell the workshop what you need.</h1>
          {code && <p className="sreq__text">That build link didn’t load — start from Build, or send a service request below.</p>}
        </section>
        <section className="sreq__form" aria-label="Service request">
          <ContactForm services={catalogue.services} />
        </section>
      </div>
    </div>
  )
}
