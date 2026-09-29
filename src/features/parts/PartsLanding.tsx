'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useMemo } from 'react'
import { track } from '@/lib/analytics'
import { PART_CATEGORY_META } from '@/data/catalogue'
import { PART_CATEGORIES, type Bike, type Part, type PartCategory } from '@/types/catalogue'
import { BikeSelector } from './BikeSelector'
import { PartsCategoryTile } from './PartsCategoryTile'
import { fitsBike } from './fitment'
import { useBikeFilter } from './use-bike-filter'

interface Data {
  parts: Part[]
  bikes: Bike[]
}

export const categoryHref = (category: string, bike: string) => `/parts/${category}${bike ? `?bike=${encodeURIComponent(bike)}` : ''}`

/**
 * /parts is category discovery only: the bike filter and the wall of
 * categories. Products live on each category's own page (/parts/<category>).
 * The server HTML (Suspense fallback) is the same wall, unfiltered.
 */
export function PartsLanding(data: Data) {
  return (
    <Suspense fallback={<LandingView {...data} bike="" setBike={() => {}} />}>
      <LiveLanding {...data} />
    </Suspense>
  )
}

function LiveLanding(data: Data) {
  const { bike, setBike } = useBikeFilter()
  const legacy = useSearchParams().get('category')
  const router = useRouter()
  // Old links (/parts?category=seat) land on the category's own page.
  useEffect(() => {
    if (legacy && (PART_CATEGORIES as readonly string[]).includes(legacy)) router.replace(categoryHref(legacy, bike))
  }, [legacy, bike, router])
  return <LandingView {...data} bike={bike} setBike={setBike} />
}

function LandingView({ parts, bikes, bike, setBike }: Data & { bike: string; setBike(id: string): void }) {
  const counts = useMemo(() => {
    const fit = fitsBike(parts, bike)
    return Object.fromEntries(PART_CATEGORIES.map((c) => [c, fit.filter((p) => p.category === c).length])) as Record<PartCategory, number>
  }, [parts, bike])
  return (
    <>
      <BikeSelector bikes={bikes} value={bike} onChange={setBike} />
      <h2 className="sr-only">Categories</h2>
      <nav className="ptile-grid" aria-label="Parts categories">
        {PART_CATEGORIES.map((c, i) => (
          <PartsCategoryTile
            key={c}
            meta={PART_CATEGORY_META[c]}
            href={categoryHref(c, bike)}
            count={counts[c]}
            eager={i < 4}
            onNavigate={() => track('parts_category_opened', { category: c, bike: bike || 'all' })}
          />
        ))}
      </nav>
    </>
  )
}
