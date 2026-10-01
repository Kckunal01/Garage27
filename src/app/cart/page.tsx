import type { Metadata } from 'next'
import { CartView } from '@/features/checkout/CartView'
import { getCatalogue } from '@/lib/catalogue/repository'
import { chargeRates } from '@/lib/pricing/cart'

export const metadata: Metadata = { title: 'Cart', robots: { index: false } }

export default async function CartPage() {
  const { parts, bikes } = await getCatalogue()
  return (
    <div className="wrap section--tight flow-page">
      <p className="label label--amber">THE BENCH</p>
      <h1 className="headline">Your cart</h1>
      <CartView rates={chargeRates(parts, bikes)} />
    </div>
  )
}
