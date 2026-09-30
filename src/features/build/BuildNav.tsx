'use client'

import { BUILD_ZONES } from '@/data/catalogue'
import type { Bike } from '@/types/catalogue'
import type { BikeBundle } from './engine'
import { isZoneAvailable } from './zones'

/**
 * The build navigation: which bike, then which part of it. Typography only —
 * no icons, no arrows; the active part reads in white with a red rule.
 * Parts this bike has no slot for stay listed but unavailable.
 */
export function BuildNav({ bikes, bundle, active, modified, onBike, onZone }: { bikes: Bike[]; bundle: BikeBundle; active: string | null; modified: Set<string>; onBike(id: string): void; onZone(zone: string): void }) {
  const zones = BUILD_ZONES.filter((z) => z.rail)
  const anyLive = zones.some((z) => isZoneAvailable(z, bundle))
  return (
    <nav className="bnav" aria-label="Build">
      <p className="bnav__title">BUILD</p>
      <label className="bnav__group">
        <span className="bnav__label">BIKE</span>
        <select className="bnav__bike" value={bundle.bike.id} onChange={(e) => onBike(e.target.value)}>
          {bikes
            .filter((b) => b.status === 'active')
            .map((b) => (
              <option key={b.id} value={b.id}>
                {b.brand.toUpperCase()} · {b.name}
              </option>
            ))}
        </select>
      </label>
      <div className="bnav__group">
        <span className="bnav__label" id="bnav-parts">
          PARTS
        </span>
        {anyLive ? (
          <ul className="bnav__parts" aria-labelledby="bnav-parts">
            {zones.map((z) => {
              const live = isZoneAvailable(z, bundle)
              const on = active === z.id
              return (
                <li key={z.id}>
                  <button
                    type="button"
                    className={`bnav__part${on ? ' is-active' : ''}${modified.has(z.id) ? ' is-modified' : ''}`}
                    aria-pressed={on}
                    aria-disabled={!live || undefined}
                    title={live ? undefined : `${z.label}: not yet available for the ${bundle.bike.name}`}
                    onClick={() => live && onZone(z.id)}
                  >
                    {z.label}
                    {modified.has(z.id) && <span className="sr-only"> (customised)</span>}
                  </button>
                </li>
              )
            })}
          </ul>
        ) : (
          <p className="bnav__note">Parts for the {bundle.bike.name} are still coming to the bay. Choose a colour and request the build.</p>
        )}
      </div>
    </nav>
  )
}
