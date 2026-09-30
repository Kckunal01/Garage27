import type { Metadata } from 'next'
import Link from 'next/link'
import { EnquiryForm } from '@/features/about/EnquiryForm'
import { customisations, decodeConfiguration, getBikeBundle, sanitizeConfiguration } from '@/features/build/engine'
import { getCatalogue } from '@/lib/catalogue/repository'
import { formatINR, formatPrice } from '@/lib/pricing/money'
import { pageMetadata } from '@/lib/seo/metadata'

export const metadata: Metadata = pageMetadata({
  title: 'Let’s Talk — Request a Build',
  description: 'Tell Garage 27 what you’re building or looking for, or upload a reference. A builder comes back with ideas and next steps.',
  path: '/service/request',
})

/**
 * LET'S TALK — the dedicated request page. From the visualizer (?c=<build>)
 * it shows the build (bike, colour, the add-ons chosen) and carries it into
 * the message; otherwise it is the open request form.
 */
export default async function ServiceRequestPage({ searchParams }: PageProps<'/service/request'>) {
  const params = await searchParams
  const code = typeof params.c === 'string' ? params.c : null
  const catalogue = await getCatalogue()
  const decoded = code ? decodeConfiguration(code) : null
  const bundle = decoded?.bikeId ? getBikeBundle(catalogue, decoded.bikeId) : null
  const build = bundle && decoded ? (() => {
    const config = sanitizeConfiguration(decoded, bundle)
    const colour = bundle.colours.find((c) => c.id === config.colourId)
    return { config, colour, ...customisations(config, bundle) }
  })() : null

  const message =
    bundle && build
      ? [
          `Build request: ${bundle.bike.brand} ${bundle.bike.model}${build.colour ? ` in ${build.colour.name}` : ''}.`,
          ...build.lines.map((l) => `- ${l.name}: ${formatPrice(l.price)}`),
          `Customisation value: ${formatINR(build.total)}${build.unpriced ? ' + price on request' : ''}.`,
          '',
        ]
          .join('\n')
          .slice(0, 900)
      : ''

  return (
    <div className="abt sreq">
      <div className="sreq__inner">
        <header className="sreq__head">
          <p className="sreq__label">{bundle ? 'REQUEST BUILD' : 'REQUEST'}</p>
          <h1 className="sreq__title">LET’S TALK.</h1>
          <p className="sreq__copy">
            Tell us what you’re building, what you’re looking for,
            <br />
            or upload a reference.
          </p>
        </header>

        {bundle && build && (
          <section className="sreq__build" aria-labelledby="sreq-build">
            <p className="sreq__brand">{bundle.bike.brand.toUpperCase()}</p>
            <h2 id="sreq-build" className="sreq__bike">
              {bundle.bike.name}
            </h2>
            {build.colour && <p className="sreq__colour">{build.colour.name}</p>}
            {build.lines.length ? (
              <ul className="sreq__lines">
                {build.lines.map((l) => (
                  <li key={l.key}>
                    <span>{l.name}</span>
                    <span>{formatPrice(l.price)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="sreq__colour">NO CUSTOMISATIONS SELECTED</p>
            )}
            <p className="sreq__total">
              <span>CUSTOMISATION VALUE</span>
              <strong>{formatINR(build.total)}</strong>
            </p>
            {build.unpriced > 0 && <p className="sreq__colour">+ {build.unpriced === 1 ? 'ONE ITEM' : `${build.unpriced} ITEMS`} PRICE ON REQUEST</p>}
            <Link className="sreq__edit" href={`/build/visualiser?c=${code}`}>
              EDIT BUILD
            </Link>
          </section>
        )}
        {code && !bundle && <p className="sreq__copy">That build link didn’t load. Tell us about it below, or start again from Build.</p>}

        <section className="sf sreq__form" aria-label="Your request">
          <EnquiryForm initialMessage={message} />
        </section>
      </div>
    </div>
  )
}
