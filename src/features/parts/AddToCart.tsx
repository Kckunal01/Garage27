'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useCart } from '@/features/checkout/cart-store'
import { useToast } from '@/components/garage-ui/Toast'
import { track } from '@/lib/analytics'
import { SHIPPING_RULES } from '@/lib/pricing/cart'
import type { Part } from '@/types/catalogue'

export function AddToCart({ part }: { part: Part }) {
  const { add } = useCart()
  const toast = useToast()
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const max = Math.min(part.stock, SHIPPING_RULES.maxQtyPerLine)
  const available = part.status === 'active' && part.stock > 0

  useEffect(() => {
    track('product_viewed', { part: part.id, category: part.category, in_stock: available })
  }, [part.id, part.category, available])

  if (!available) {
    return (
      <div className="atc">
        <span className="badge">SOLD OUT</span>
        <p className="muted">Back on the shelf soon. Need it sooner? <Link className="neon-link" href="/service#request">Ask the workshop</Link></p>
      </div>
    )
  }

  return (
    <div className="atc">
      <div className="qty" role="group" aria-label="Quantity">
        <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease quantity" disabled={qty <= 1}>
          −
        </button>
        <output aria-live="polite">{qty}</output>
        <button type="button" onClick={() => setQty((q) => Math.min(max, q + 1))} aria-label="Increase quantity" disabled={qty >= max}>
          +
        </button>
      </div>
      <button
        type="button"
        className="btn btn--ignite atc__btn"
        onClick={() => {
          add({ partId: part.id, name: part.name, slug: part.slug, price: part.price, category: part.category }, qty)
          track('add_to_cart', { part: part.id, category: part.category, quantity: qty, surface: 'pdp' })
          toast({ tone: 'success', title: 'ON THE BENCH', body: `${qty} × ${part.name} added.` })
          setAdded(true)
        }}
      >
        ADD TO CART
      </button>
      {added && (
        <Link href="/cart" className="neon-link">
          VIEW CART
        </Link>
      )}
      {part.stock <= 3 && <p className="label label--amber">ONLY {part.stock} LEFT</p>}
    </div>
  )
}
