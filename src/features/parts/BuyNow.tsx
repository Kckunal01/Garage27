'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { track } from '@/lib/analytics'
import type { Part } from '@/types/catalogue'
import { buyNowHref } from './buy-now'

/** The product page's one purchase action: BUY NOW → checkout with this part, quantity 1. */
export function BuyNow({ part }: { part: Part }) {
  const available = part.status === 'active' && part.stock > 0
  useEffect(() => {
    track('product_viewed', { part: part.id, category: part.category, in_stock: available })
  }, [part.id, part.category, available])

  if (!available) {
    return (
      <div className="pdp__buy">
        <p className="pdp__soldout">SOLD OUT</p>
        <p className="pdp__note">
          Back on the shelf soon. Need it sooner?{' '}
          <Link className="neon-link" href="/service?request=consultation">
            Ask the workshop
          </Link>
        </p>
      </div>
    )
  }
  return (
    <div className="pdp__buy">
      <Link href={buyNowHref(part.slug)} className="btn btn--ignite btn--block pdp__cta" onClick={() => track('buy_now', { part: part.id, category: part.category, quantity: 1, surface: 'pdp' })}>
        BUY NOW
      </Link>
    </div>
  )
}
