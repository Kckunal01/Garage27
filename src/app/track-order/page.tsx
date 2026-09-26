import type { Metadata } from 'next'
import { TrackOrder } from '@/features/orders/TrackOrder'

export const metadata: Metadata = { title: 'Track order', robots: { index: false } }

export default function TrackOrderPage() {
  return (
    <div className="wrap section--tight doc-page">
      <p className="doc-page__kicker">TRACK ORDER</p>
      <h1 className="doc-page__title">Where’s my order?</h1>
      <p className="lede">Enter the reference from your order confirmation.</p>
      <TrackOrder />
    </div>
  )
}
