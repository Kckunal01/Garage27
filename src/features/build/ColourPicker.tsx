'use client'

import { formatDelta } from '@/lib/pricing/money'
import type { BikeColour } from '@/types/catalogue'

/** Paint: square swatches from the bike's verified colours; the current name + price alongside. */
export function ColourPicker({ colours, value, onChange }: { colours: BikeColour[]; value: string; onChange(id: string): void }) {
  const active = colours.filter((c) => c.status === 'active')
  const current = active.find((c) => c.id === value)
  if (!active.length) return null
  return (
    <fieldset className="paint">
      <legend className="tray__slot-label">COLOUR</legend>
      <div className="paint__row" role="radiogroup" aria-label="Paint colour">
        {active.map((c) => (
          <button
            key={c.id}
            type="button"
            role="radio"
            aria-checked={c.id === value}
            className={`paint__swatch${c.id === value ? ' is-selected' : ''}`}
            style={{ background: c.material.accent && c.material.accent !== c.swatch ? `linear-gradient(135deg, ${c.swatch} 0 55%, ${c.material.accent} 55%)` : c.swatch }}
            onClick={() => onChange(c.id)}
            title={`${c.name} ${formatDelta(c.priceDelta)}`}
          >
            <span className="sr-only">{`${c.name}, ${formatDelta(c.priceDelta)}`}</span>
          </button>
        ))}
      </div>
      {current && (
        <p className="paint__current" aria-live="polite">
          {current.name} <span>{formatDelta(current.priceDelta)}</span>
        </p>
      )}
    </fieldset>
  )
}
