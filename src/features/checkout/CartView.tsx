'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { useCart } from './cart-store'
import { EmptyState, LoadingState } from '@/components/garage-ui/States'
import { PartVisual } from '@/components/media/PartVisual'
import { track } from '@/lib/analytics'
import { formatINR, valueBand } from '@/lib/pricing/money'
import { SHIPPING_RULES } from '@/lib/pricing/cart'

export function CartView() {
  const { lines, ready, subtotal, setQuantity, remove, count } = useCart()

  useEffect(() => {
    if (ready) track('cart_viewed', { items: count, value_band: valueBand(subtotal) })
    // fire once per visit after hydration
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready])

  if (!ready) return <LoadingState message="CHECKING THE BENCH…" />
  if (!lines.length)
    return (
      <EmptyState title="YOUR BENCH IS EMPTY.">
        <p>The details make the bike. Start with the wall.</p>
        <Link href="/parts" className="btn btn--amber">
          BROWSE PARTS
        </Link>
      </EmptyState>
    )

  const shipping = subtotal >= SHIPPING_RULES.freeOver ? 0 : SHIPPING_RULES.flat
  return (
    <div className="cart">
      <ul className="cart__lines">
        {lines.map((l) => (
          <li key={l.partId} className="cart-line">
            <PartVisual alt="" category={l.category} className="cart-line__img" />
            <div className="cart-line__info">
              <Link href={`/parts/${l.slug}`} className="cart-line__name">
                {l.name}
              </Link>
              <p className="muted">{formatINR(l.price)} each</p>
              <button type="button" className="neon-link cart-line__remove" onClick={() => remove(l.partId)}>
                REMOVE
              </button>
            </div>
            <div className="qty" role="group" aria-label={`Quantity for ${l.name}`}>
              <button type="button" onClick={() => setQuantity(l.partId, l.quantity - 1)} disabled={l.quantity <= 1} aria-label="Decrease">
                −
              </button>
              <output>{l.quantity}</output>
              <button type="button" onClick={() => setQuantity(l.partId, l.quantity + 1)} disabled={l.quantity >= SHIPPING_RULES.maxQtyPerLine} aria-label="Increase">
                +
              </button>
            </div>
            <p className="cart-line__total">{formatINR(l.price * l.quantity)}</p>
          </li>
        ))}
      </ul>
      <aside className="summary plate" aria-label="Order summary">
        <dl>
          <div>
            <dt>Subtotal</dt>
            <dd>{formatINR(subtotal)}</dd>
          </div>
          <div>
            <dt>Shipping</dt>
            <dd>{shipping ? formatINR(shipping) : 'FREE'}</dd>
          </div>
          <div className="summary__total">
            <dt>Total</dt>
            <dd>{formatINR(subtotal + shipping)}</dd>
          </div>
        </dl>
        {shipping > 0 && <p className="muted summary__note">Free shipping over {formatINR(SHIPPING_RULES.freeOver)}.</p>}
        <Link href="/checkout" className="btn btn--ignite btn--block">
          CHECKOUT
        </Link>
        <p className="muted summary__note">Prices are confirmed at checkout. Taxes included where applicable.</p>
      </aside>
    </div>
  )
}
