import type { Metadata } from 'next'
import { CartView } from '@/features/checkout/CartView'

export const metadata: Metadata = { title: 'Cart', robots: { index: false } }

export default function CartPage() {
  return (
    <div className="wrap section--tight flow-page">
      <p className="label label--amber">THE BENCH</p>
      <h1 className="headline">Your cart</h1>
      <CartView />
    </div>
  )
}
