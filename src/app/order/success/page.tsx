import type { Metadata } from 'next'
import { Suspense } from 'react'
import { OrderStatus } from '@/features/checkout/OrderStatus'
import { LoadingState } from '@/components/garage-ui/States'

export const metadata: Metadata = { title: 'Order confirmation', robots: { index: false } }

export default function OrderSuccessPage() {
  return (
    <div className="wrap section--tight flow-page flow-page--narrow">
      <Suspense fallback={<LoadingState message="CONFIRMING WITH THE GATEWAY…" />}>
        <OrderStatus />
      </Suspense>
    </div>
  )
}
