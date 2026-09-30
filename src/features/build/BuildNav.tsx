'use client'

import type { PointerEvent } from 'react'
import { BUILD_ZONES } from '@/data/catalogue'
import type { Bike } from '@/types/catalogue'
import type { BikeBundle } from './engine'
import { isZoneAvailable } from './zones'

/**
 * The build navigation, a narrow side panel: BUILD → BIKE → PARTS. Text and
 * hairlines only. Resting the cursor on a part previews its options (red
 * text, red rule); leaving returns to the selected part; a click selects.
 * Touch has no hover: a tap selects.
 */
export function BuildNav({
  bikes,
  bundle,
  active,
  previewing,
  modified,
  onBike,
  onZone,
  onPreview,
}: {
  bikes: Bike[]
  bundle: BikeBundle
  active: string | null
  previewing: string | null
  modified: Set<string>
  onBike(id: string): void
  onZone(zone: string): void
  onPreview(zone: string | null): void
}) {
  const zones = BUILD_ZONES.filter((z) => z.rail)
  const anyLive = zones.some((z) => isZoneAvailable(z, bundle))
  const hover = (id: string) => (e: PointerEvent) => {
    if (e.pointerType === 'mouse') onPreview(id)
  }
  return (
    <nav className="bnav" aria-label="Build">
      <p className="bnav__title">BUILD</p>
      <label className="bnav__group bnav__bikepick">
        <span className="bnav__label">BIKE</span>
        <span className="bnav__bikename" aria-hidden="true">
          <span>{bundle.bike.brand.toUpperCase()}</span>
          <strong>{bundle.bike.name}</strong>
        </span>
        <select className="bnav__bike" value={bundle.bike.id} onChange={(e) => onBike(e.target.value)} aria-label="Bike">
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
          <ul className="bnav__parts" aria-labelledby="bnav-parts" onPointerLeave={() => onPreview(null)}>
            {zones.map((z) => {
              const live = isZoneAvailable(z, bundle)
              const on = active === z.id
              return (
                <li key={z.id}>
                  <button
                    type="button"
                    className={`bnav__part${on ? ' is-active' : ''}${previewing === z.id ? ' is-preview' : ''}${modified.has(z.id) ? ' is-modified' : ''}`}
                    aria-pressed={on}
                    aria-disabled={!live || undefined}
                    title={live ? undefined : `${z.label}: not yet available for the ${bundle.bike.name}`}
                    onPointerEnter={live ? hover(z.id) : undefined}
                    onClick={() => {
                      if (!live) return
                      onPreview(null)
                      onZone(z.id)
                    }}
                  >
                    {z.label}
                    {modified.has(z.id) && <span className="sr-only"> (customised)</span>}
                  </button>
                </li>
              )
            })}
          </ul>
        ) : (
          <p className="bnav__note">Parts for the {bundle.bike.name} are still coming to the bay.</p>
        )}
      </div>
    </nav>
  )
}
