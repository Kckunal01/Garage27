'use client'

import { BikeSilhouette } from '@/components/media/BikeSilhouette'
import { formatINR } from '@/lib/pricing/money'
import type { Bike } from '@/types/catalogue'
import { isInteractive } from './engine'

const STATUS_COPY: Record<string, { badge: string; cls: string; cta: string }> = {
  interactive: { badge: '3D BUILD BAY', cls: 'badge--ok', cta: 'ENTER THE BAY' },
  'preview-only': { badge: 'PREVIEW + QUOTE', cls: 'badge--amber', cta: 'PREVIEW & QUOTE' },
  'coming-soon': { badge: 'IN THE WORKSHOP', cls: '', cta: 'COMING SOON' },
}

export function BikePicker({ bikes, onPick }: { bikes: Bike[]; onPick(id: string): void }) {
  const visible = bikes.filter((b) => b.status !== 'retired')
  return (
    <div className="bike-picker">
      <header className="bike-picker__head">
        <p className="label label--amber">STEP 01 · SELECT BIKE</p>
        <h1 className="headline">What are we building on?</h1>
      </header>
      <ul className="bike-picker__grid">
        {visible.map((b) => {
          const key = isInteractive(b) ? 'interactive' : b.status
          const copy = STATUS_COPY[key] ?? STATUS_COPY['coming-soon']!
          const disabled = b.status === 'coming-soon'
          return (
            <li key={b.id}>
              <button type="button" className={`bike-tile${disabled ? ' is-disabled' : ''}`} onClick={() => onPick(b.id)} disabled={disabled} aria-describedby={`${b.id}-status`}>
                <span className={`badge ${copy.cls}`} id={`${b.id}-status`}>
                  {copy.badge}
                </span>
                {b.thumbnail ? (
                  // eslint-disable-next-line @next/next/no-img-element -- catalogue thumbnail, pre-optimised
                  <img className="bike-tile__art bike-tile__thumb" src={b.thumbnail} alt="" loading="lazy" decoding="async" />
                ) : (
                  <BikeSilhouette className="bike-tile__art" silhouette={b.silhouette} tone="amber" reflection={false} />
                )}
                <span className="label">
                  {b.brand.toUpperCase()}
                  {b.variant ? ` · ${b.variant.toUpperCase()}` : ''}
                </span>
                <span className="bike-tile__name">{b.name}</span>
                <span className="bike-tile__price muted">{disabled ? b.summary : `From ${formatINR(b.basePrice)}`}</span>
                <span className="neon-link bike-tile__cta">{copy.cta}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

/** Server-renderable picker (Suspense fallback): real bikes in the first HTML, hydrated into the live bay. */
export function BikePickerShell({ bikes }: { bikes: Bike[] }) {
  return (
    <div className="wrap section--tight">
      <BikePicker bikes={bikes} onPick={() => {}} />
    </div>
  )
}
