'use client'

import { formatDelta } from '@/lib/pricing/money'
import type { BikeColour } from '@/types/catalogue'

/** Paint swatches from the vehicle's catalogue colours; the current name + delta reads alongside. */
export function ColourPicker({ colours, value, onChange }: { colours: BikeColour[]; value: string; onChange(id: string): void }) {
  const active = colours.filter((c) => c.status === 'active')
  const current = active.find((c) => c.id === value)
  return (
    <fieldset className="colours">
      <legend className="sr-only">Paint colour</legend>
      <div className="colours__row" role="radiogroup" aria-label="Paint colour">
        {active.map((c) => (
          <button
            key={c.id}
            type="button"
            role="radio"
            aria-checked={c.id === value}
            className={`swatch${c.id === value ? ' is-selected' : ''}`}
            onClick={() => onChange(c.id)}
            title={`${c.name} ${formatDelta(c.priceDelta)}`}
          >
            <span className="swatch__chip" style={{ background: `radial-gradient(circle at 35% 30%, rgba(255,255,255,.35), transparent 40%), ${c.swatch}` }} />
            <span className="sr-only">{`${c.name}, ${formatDelta(c.priceDelta)}`}</span>
          </button>
        ))}
      </div>
      {current && (
        <p className="colours__current" aria-live="polite">
          {current.name} <span>{formatDelta(current.priceDelta)}</span>
        </p>
      )}
    </fieldset>
  )
}
