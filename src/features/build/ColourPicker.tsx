'use client'

import { formatDelta } from '@/lib/pricing/money'
import type { BikeColour } from '@/types/catalogue'

export function ColourPicker({ colours, value, onChange, compact }: { colours: BikeColour[]; value: string; onChange(id: string): void; compact?: boolean }) {
  const active = colours.filter((c) => c.status === 'active')
  const current = active.find((c) => c.id === value)
  return (
    <fieldset className={`colours${compact ? ' colours--compact' : ''}`}>
      <legend className="label">
        COLOUR · <span className="colours__current">{current?.name}</span>
      </legend>
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
            {!compact && (
              <span className="swatch__meta">
                <span className="swatch__name">{c.name}</span>
                <span className="swatch__delta">{formatDelta(c.priceDelta)}</span>
              </span>
            )}
            {compact && <span className="sr-only">{`${c.name}, ${formatDelta(c.priceDelta)}`}</span>}
          </button>
        ))}
      </div>
    </fieldset>
  )
}
