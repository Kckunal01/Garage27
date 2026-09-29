import type { Metadata } from 'next'
import { CheckoutForm } from '@/features/checkout/CheckoutForm'
import type { CartLine } from '@/features/checkout/cart-store'
import { getPartBySlug } from '@/lib/catalogue/repository'
import { SHIPPING_RULES } from '@/lib/pricing/cart'

export const metadata: Metadata = { title: 'Checkout', robots: { index: false } }

/**
 * `?buy=<slug>[&qty=n]` is BUY NOW: checkout for that one part, straight
 * from the catalogue, without touching the cart. Otherwise the cart is used.
 * Either way the server re-prices every line.
 */
export default async function CheckoutPage({ searchParams }: PageProps<'/checkout'>) {
  const params = await searchParams
  const slug = typeof params.buy === 'string' ? params.buy : null
  let direct: CartLine | null = null
  if (slug) {
    const part = await getPartBySlug(slug)
    if (part && part.status === 'active' && part.stock > 0) {
      const wanted = Number.parseInt(typeof params.qty === 'string' ? params.qty : '1', 10)
      const quantity = Math.min(Math.max(1, Number.isFinite(wanted) ? wanted : 1), part.stock, SHIPPING_RULES.maxQtyPerLine)
      direct = { partId: part.id, name: part.name, slug: part.slug, price: part.price, category: part.category, quantity }
    }
  }
  return (
    <div className="co-page">
      <header className="co-page__head">
        <p className="co-page__eyebrow">CHECKOUT</p>
        <h1 className="co-page__title">Almost on the road.</h1>
      </header>
      <CheckoutForm direct={direct} />
    </div>
  )
}
