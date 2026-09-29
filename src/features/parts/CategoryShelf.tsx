'use client'

import { Suspense, useMemo } from 'react'
import { EmptyState } from '@/components/garage-ui/States'
import type { Bike, Part } from '@/types/catalogue'
import { BikeSelector } from './BikeSelector'
import { PartCard } from './PartCard'
import { bikeName, fitsBike } from './fitment'
import { useBikeFilter } from './use-bike-filter'

interface Data {
  /** Already only this category's parts. */
  parts: Part[]
  bikes: Bike[]
  images: Record<string, string>
}

/** One category's parts, narrowed by the chosen bike. The server HTML is the whole category. */
export function CategoryShelf(data: Data) {
  return (
    <Suspense fallback={<ShelfView {...data} bike="" setBike={() => {}} />}>
      <LiveShelf {...data} />
    </Suspense>
  )
}

function LiveShelf(data: Data) {
  const { bike, setBike } = useBikeFilter()
  return <ShelfView {...data} bike={bike} setBike={setBike} />
}

function ShelfView({ parts, bikes, images, bike, setBike }: Data & { bike: string; setBike(id: string): void }) {
  const shown = useMemo(() => fitsBike(parts, bike), [parts, bike])
  return (
    <>
      <BikeSelector bikes={bikes} value={bike} onChange={setBike} />
      <p className="pcat__count" aria-live="polite">
        {shown.length} PART{shown.length === 1 ? '' : 'S'}
        {bike ? ` FOR THE ${bikeName(bikes, bike)}` : ''}
      </p>
      {shown.length ? (
        <div className="pcard-grid">
          {shown.map((p, i) => (
            <PartCard key={p.id} part={p} bikes={bikes} image={images[p.id]} eager={i < 2} />
          ))}
        </div>
      ) : (
        <EmptyState>
          <p>Nothing in this category for that bike yet.</p>
          <button type="button" className="btn btn--sm" onClick={() => setBike('')}>
            SHOW ALL BIKES
          </button>
        </EmptyState>
      )}
    </>
  )
}
