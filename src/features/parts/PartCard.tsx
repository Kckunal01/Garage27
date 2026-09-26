'use client'

import Link from 'next/link'
import { PartVisual } from '@/components/media/PartVisual'
import { useCart } from '@/features/checkout/cart-store'
import { useToast } from '@/components/garage-ui/Toast'
import { track } from '@/lib/analytics'
import { formatINR } from '@/lib/pricing/money'
import type { Bike, Part } from '@/types/catalogue'

export function PartCard({ part, bikes, image, categoryLabel }: { part: Part; bikes: Bike[]; image?: string; categoryLabel: string }) {
  const { add } = useCart()
  const toast = useToast()
  const inStock = part.status === 'active' && part.stock > 0
  const fits = part.compatibleBikeIds.length === 0 ? 'Universal fit' : `Fits ${part.compatibleBikeIds.map((id) => bikes.find((b) => b.id === id)?.name ?? '').filter(Boolean).join(', ')}`

  return (
    <article className="pcard">
      <Link href={`/parts/${part.slug}`} className="pcard__link">
        <div className="pcard__media">
          <PartVisual src={image} alt={part.images[0]?.alt ?? part.name} category={part.category} />
          <span className="pcard__cat label">{categoryLabel}</span>
        </div>
        <div className="pcard__body">
          <h3 className="pcard__name">{part.name}</h3>
          <p className="pcard__fit">{fits}</p>
        </div>
      </Link>
      <div className="pcard__foot">
        <p className="pcard__price">{formatINR(part.price)}</p>
        {inStock ? (
          <button
            type="button"
            className="btn btn--sm btn--amber"
            onClick={() => {
              add({ partId: part.id, name: part.name, slug: part.slug, price: part.price, category: part.category })
              track('add_to_cart', { part: part.id, category: part.category, surface: 'card', quantity: 1 })
              toast({ tone: 'success', title: 'ON THE BENCH', body: `${part.name} added to your cart.` })
            }}
            aria-label={`Add ${part.name} to cart`}
          >
            ADD
          </button>
        ) : (
          <span className="badge">SOLD OUT</span>
        )}
      </div>
    </article>
  )
}
