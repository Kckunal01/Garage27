import type { Metadata } from 'next'
import { CheckoutForm } from '@/features/checkout/CheckoutForm'

export const metadata: Metadata = { title: 'Checkout', robots: { index: false } }

export default function CheckoutPage() {
  return (
    <div className="wrap section--tight flow-page">
      <p className="label label--amber">CHECKOUT</p>
      <h1 className="headline">Almost on the road</h1>
      <CheckoutForm />
    </div>
  )
}
