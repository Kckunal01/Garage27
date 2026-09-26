'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useMemo } from 'react'
import { CategoryTile } from '@/components/garage-ui/CategoryTile'
import { EmptyState } from '@/components/garage-ui/States'
import { track } from '@/lib/analytics'
import { PART_CATEGORY_META } from '@/data/catalogue'
import { PART_CATEGORIES, type Bike, type Part, type PartCategory } from '@/types/catalogue'
import { BikeSelector } from './BikeSelector'
import { PartCard } from './PartCard'
import { CartLink } from '@/components/navigation/CartLink'

interface Data {
  parts: Part[]
  bikes: Bike[]
  images: Record<string, string>
}

/**
 * Filter state lives in the URL (?bike=&category=) so views are shareable and
 * back-button friendly. The static HTML (Suspense fallback) is the full,
 * unfiltered shelf — crawlable and paint-ready before hydration.
 */
export function PartsBrowser(data: Data) {
  return (
    <Suspense fallback={<PartsView {...data} bike="" category={null} setParam={() => {}} clearAll={() => {}} />}>
      <LivePartsBrowser {...data} />
    </Suspense>
  )
}

function LivePartsBrowser(data: Data) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const bike = params.get('bike') ?? ''
  const rawCategory = params.get('category')
  const category = (PART_CATEGORIES as readonly string[]).includes(rawCategory ?? '') ? (rawCategory as PartCategory) : null

  const setParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(params.toString())
    if (value) next.set(key, value)
    else next.delete(key)
    router.replace(`${pathname}${next.size ? `?${next}` : ''}`, { scroll: false })
  }
  return <PartsView {...data} bike={bike} category={category} setParam={setParam} clearAll={() => router.replace(pathname, { scroll: false })} />
}

function PartsView({
  parts,
  bikes,
  images,
  bike,
  category,
  setParam,
  clearAll,
}: Data & { bike: string; category: PartCategory | null; setParam(key: string, value: string | null): void; clearAll(): void }) {

  const forBike = useMemo(() => parts.filter((p) => p.status !== 'retired' && (!bike || p.compatibleBikeIds.length === 0 || p.compatibleBikeIds.includes(bike))), [parts, bike])
  const shown = category ? forBike.filter((p) => p.category === category) : forBike
  const counts = useMemo(() => Object.fromEntries(PART_CATEGORIES.map((c) => [c, forBike.filter((p) => p.category === c).length])), [forBike])

  return (
    <>
      <div className="parts-toolbar">
        <BikeSelector
          bikes={bikes}
          value={bike}
          onChange={(id) => {
            setParam('bike', id || null)
            track('parts_bike_filter_selected', { bike: id || 'all' })
          }}
        />
        <div className="parts-toolbar__meta">
          <p className="label" aria-live="polite">
            {shown.length} PART{shown.length === 1 ? '' : 'S'} ON THE WALL
          </p>
          {/* Cart lives in the shopping flow, not the global header. */}
          <CartLink />
        </div>
      </div>

      <h2 className="sr-only">Categories</h2>
      <div className="ctile-grid">
        {PART_CATEGORIES.map((c, i) => (
          <CategoryTile
            key={c}
            meta={PART_CATEGORY_META[c]}
            index={i}
            count={counts[c]}
            active={category === c}
            onSelect={() => {
              const next = category === c ? null : c
              setParam('category', next)
              if (next) track('parts_category_opened', { category: next, bike: bike || 'all' })
            }}
          />
        ))}
      </div>

      <section className="catalogue" aria-labelledby="catalogue-heading">
        <div className="catalogue__head">
          <h2 id="catalogue-heading" className="title">
            {category ? PART_CATEGORY_META[category].label : 'EVERYTHING'}
          </h2>
          {category && (
            <button type="button" className="neon-link" onClick={() => setParam('category', null)}>
              CLEAR
            </button>
          )}
        </div>
        {shown.length ? (
          <div className="pcard-grid">
            {shown.map((p) => (
              <PartCard key={p.id} part={p} bikes={bikes} image={images[p.id]} categoryLabel={PART_CATEGORY_META[p.category].label} />
            ))}
          </div>
        ) : (
          <EmptyState>
            <p>Nothing on this shelf for that bike yet.</p>
            <button type="button" className="btn btn--sm" onClick={clearAll}>
              SHOW EVERYTHING
            </button>
          </EmptyState>
        )}
      </section>
    </>
  )
}
