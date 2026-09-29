'use client'

import { BikeSilhouette } from '@/components/media/BikeSilhouette'
import type { Bike } from '@/types/catalogue'

/**
 * SELECT YOUR BIKE bar (Parts reference). A native <select> covers the whole
 * bar, so phones get the system picker and keyboards work as usual.
 */
export function BikeSelector({ bikes, value, onChange }: { bikes: Bike[]; value: string; onChange: (id: string) => void }) {
  const list = bikes.filter((b) => b.status !== 'retired')
  const current = list.find((b) => b.id === value)
  return (
    <label className="bike-bar">
      <BikeSilhouette className="bike-bar__art" silhouette={current?.silhouette ?? 'roadster'} tone={current ? 'red' : 'amber'} reflection={false} />
      <span className="bike-bar__text">{current ? `${current.brand.toUpperCase()} · ${current.name}` : 'SELECT YOUR BIKE'}</span>
      <svg className="bike-bar__chev" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 9l7 7 7-7" />
      </svg>
      <select className="bike-bar__select" value={value} onChange={(e) => onChange(e.target.value)} aria-label="Select your bike">
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
