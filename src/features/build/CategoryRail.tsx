'use client'

import { CategoryGlyph } from '@/components/media/CategoryGlyph'
import { BUILD_ZONES } from '@/data/catalogue'
import type { BikeBundle } from './engine'
import { isZoneAvailable } from './zones'

/**
 * The Build reference's vertical rail: every rail zone, always in the same
 * order. Zones this vehicle has no slot for stay visible but unavailable —
 * the catalogue, not the page, decides what is editable.
 */
export function CategoryRail({ bundle, active, modified, onPick }: { bundle: BikeBundle; active: string | null; modified: Set<string>; onPick(zone: string): void }) {
  return (
    <nav className="crail" aria-label="Build categories">
      <ul className="crail__list">
        {BUILD_ZONES.filter((z) => z.rail).map((z) => {
          const live = isZoneAvailable(z, bundle)
          const on = active === z.id
          return (
            <li key={z.id}>
              <button
                type="button"
                className={`crail__btn${on ? ' is-active' : ''}`}
                aria-pressed={on}
                aria-disabled={!live || undefined}
                title={live ? undefined : `${z.label}: coming soon for the ${bundle.bike.name}`}
                onClick={() => live && onPick(z.id)}
              >
                <CategoryGlyph category={z.glyph} className="crail__glyph" />
                <span className="crail__label">{z.label}</span>
                {!live && <span className="sr-only">coming soon</span>}
                {modified.has(z.id) && <span className="crail__mod" aria-label="customised" />}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
