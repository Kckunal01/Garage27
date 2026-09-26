'use client'

import type { Bike } from '@/types/catalogue'

export function BikeSelector({ bikes, value, onChange, label = 'YOUR BIKE' }: { bikes: Bike[]; value: string; onChange: (id: string) => void; label?: string }) {
  return (
    <label className="bike-select">
      <span className="label">{label}</span>
      <span className="bike-select__control field__select">
        <select className="field__input" value={value} onChange={(e) => onChange(e.target.value)}>
          <option value="">ALL BIKES</option>
          {bikes
            .filter((b) => b.status !== 'retired')
            .map((b) => (
              <option key={b.id} value={b.id}>
                {b.brand.toUpperCase()} {b.name}
              </option>
            ))}
        </select>
      </span>
    </label>
  )
}
