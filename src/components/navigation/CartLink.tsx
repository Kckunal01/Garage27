'use client'

import Link from 'next/link'
import { useCart } from '@/features/checkout/cart-store'

export function CartLink() {
  const { count } = useCart()
  return (
    <Link href="/cart" className="cart-link" aria-label={`Cart, ${count} item${count === 1 ? '' : 's'}`}>
      <span className="cart-link__label">CART</span>
      <span className="cart-link__count" data-empty={count === 0}>
        {count}
      </span>
    </Link>
  )
}
