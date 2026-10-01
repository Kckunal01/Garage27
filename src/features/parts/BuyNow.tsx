'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { track } from '@/lib/analytics'
import { SHIPPING_RULES } from '@/lib/pricing/cart'
import { formatINR } from '@/lib/pricing/money'
import type { Part } from '@/types/catalogue'
import { buyNowHref } from './buy-now'

/**
 * The product page's one purchase action: BUY NOW → checkout with this part,
 * quantity 1. Trust points state only what the shop actually does.
 */
export function BuyNow({ part }: { part: Part }) {
  const available = part.status === 'active' && part.stock > 0
  useEffect(() => {
    track('product_viewed', { part: part.id, category: part.category, in_stock: available })
  }, [part.id, part.category, available])

  const trust = ['SECURE CHECKOUT', `FREE SHIPPING FROM ${formatINR(SHIPPING_RULES.freeFrom)}`, ...(part.brand === 'Garage 27' ? ['GENUINE GARAGE 27'] : [])]

  if (!available) {
    return (
      <div className="pbuy">
        <p className="pbuy__out">SOLD OUT</p>
        <p className="pbuy__note">
          Back on the shelf soon. Need it sooner?{' '}
          <Link className="neon-link" href="/service?request=consultation">
            Ask the workshop
          </Link>
        </p>
      </div>
    )
  }
  return (
    <div className="pbuy">
      <Link href={buyNowHref(part.slug)} className="pbuy__cta" onClick={() => track('buy_now', { part: part.id, category: part.category, quantity: 1, surface: 'pdp' })}>
        <span>BUY NOW</span>
        <span className="pbuy__arrow" aria-hidden="true">
          →
        </span>
      </Link>
      <ul className="pbuy__trust" aria-label="Checkout">
        {trust.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
    </div>
  )
}
