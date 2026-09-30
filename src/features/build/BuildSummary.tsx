'use client'

import Link from 'next/link'
import { useToast } from '@/components/garage-ui/Toast'
import { track } from '@/lib/analytics'
import { formatINR, formatPrice } from '@/lib/pricing/money'
import type { BuildConfiguration } from '@/types/catalogue'
import { customisations, encodeConfiguration, type BikeBundle } from './engine'
import { slotWhere } from './zones'

/**
 * SELECTED: only what the visitor added — each product with its price,
 * then the customisation value. The bike itself is never priced here.
 * REQUEST BUILD takes the exact configuration to /service/request.
 */
export function BuildSummary({ bundle, config }: { bundle: BikeBundle; config: BuildConfiguration }) {
  const toast = useToast()
  const { lines, total, unpriced } = customisations(config, bundle, slotWhere)
  const code = encodeConfiguration(config)

  const share = async () => {
    const url = `${window.location.origin}/build/visualiser?c=${code}`
    track('build_saved', { bike: config.bikeId, method: 'link' })
    try {
      if (navigator.share) await navigator.share({ title: 'My Garage 27 build', url })
      else {
        await navigator.clipboard.writeText(url)
        toast({ tone: 'success', title: 'BUILD SAVED', body: 'Link copied. It rebuilds this exact bike.' })
      }
    } catch {
      /* share sheet dismissed */
    }
  }

  return (
    <section className="bsum" aria-labelledby="bsum-title">
      <h2 id="bsum-title" className="bsum__title">
        SELECTED
      </h2>
      {lines.length ? (
        <ul className="bsum__lines">
          {lines.map((l) => (
            <li key={l.key}>
              <span className="bsum__name">{l.name}</span>
              <span className="bsum__price">{formatPrice(l.price)}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="bsum__empty">NO CUSTOMISATIONS SELECTED</p>
      )}
      <p className="bsum__total">
        <span>CUSTOMISATION VALUE</span>
        <strong aria-live="polite" aria-atomic="true">
          {formatINR(total)}
        </strong>
      </p>
      {unpriced > 0 && <p className="bsum__unpriced">+ {unpriced === 1 ? 'ONE ITEM' : `${unpriced} ITEMS`} PRICE ON REQUEST</p>}
      <Link className="bsum__request" href={`/service/request?c=${code}`}>
        REQUEST BUILD
      </Link>
      <button type="button" className="bsum__share" onClick={share}>
        SAVE / SHARE BUILD
      </button>
    </section>
  )
}
