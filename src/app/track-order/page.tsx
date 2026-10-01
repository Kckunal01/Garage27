import type { Metadata } from 'next'
import { TrackOrder, type TrackPart } from '@/features/orders/TrackOrder'
import { getCatalogue } from '@/lib/catalogue/repository'
import { assetExists } from '@/lib/server/assets'

export const metadata: Metadata = { title: 'Track order', robots: { index: false } }

const titleCase = (s: string) => s.toLowerCase().replace(/(^|\s)\S/g, (c) => c.toUpperCase())

/**
 * Track Order. The lookup is unchanged; a found order renders the result
 * page. The catalogue facts it needs (photo, fitment, reference price) come
 * from here, so the browser never guesses them.
 */
export default async function TrackOrderPage() {
  const { parts, bikes } = await getCatalogue()
  const catalogue: TrackPart[] = parts
    .filter((p) => p.status !== 'retired')
    .map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      category: p.category,
      price: p.price,
      compareAtPrice: p.compareAtPrice,
      inStock: p.status === 'active' && p.stock > 0,
      image: assetExists(p.images[0]?.src) ? p.images[0]!.src : undefined,
      fit: p.compatibleBikeIds.length
        ? `Fits ${p.compatibleBikeIds.map((id) => bikes.find((b) => b.id === id)?.name).filter(Boolean).map((n) => titleCase(n!)).join(', ')}`
        : 'Universal fit',
    }))
  return <TrackOrder catalogue={catalogue} />
}
