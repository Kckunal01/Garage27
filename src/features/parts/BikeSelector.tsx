'use client'

import type { Bike } from '@/types/catalogue'

/**
 * CHOOSE YOUR BIKE — a quiet editorial filter: one line of text, a chevron,
 * a hairline. A native <select> covers it, so phones get the system picker.
 */
export function BikeSelector({ bikes, value, onChange }: { bikes: Bike[]; value: string; onChange: (id: string) => void }) {
  const list = bikes.filter((b) => b.status !== 'retired')
  const current = list.find((b) => b.id === value)
  return (
    <label className={`bike-bar${current ? ' is-set' : ''}`}>
      <span className="bike-bar__text">{current ? `${current.brand.toUpperCase()} · ${current.name}` : 'CHOOSE YOUR BIKE'}</span>
      <svg className="bike-bar__chev" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 9l6 6 6-6" />
      </svg>
      <select className="bike-bar__select" value={value} onChange={(e) => onChange(e.target.value)} aria-label="Choose your bike">
        <option value="">ALL BIKES</option>
        {list.map((b) => (
          <option key={b.id} value={b.id}>
            {b.brand.toUpperCase()} {b.name}
          </option>
        ))}
      </select>
    </label>
  )
}
