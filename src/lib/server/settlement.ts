import 'server-only'
import type { Store } from './store'
import type { WebhookEvent } from '@/lib/payments/types'

/**
 * Apply a VERIFIED payment outcome to an order. Idempotent: the same provider
 * event id is only ever applied once, and status transitions are guarded so a
 * late "failed" can never downgrade a paid order.
 */
export async function settlePayment(
  store: Store,
  provider: string,
  event: Pick<WebhookEvent, 'eventId' | 'type' | 'providerOrderId' | 'providerPaymentId' | 'amount' | 'raw'>,
): Promise<{ applied: boolean; reason?: string; orderReference?: string }> {
  if (event.type === 'ignored' || !event.providerOrderId) return { applied: false, reason: 'ignored' }
  const order = await store.getOrderByProviderId(event.providerOrderId)
  if (!order) return { applied: false, reason: 'unknown order' }

  if (event.type === 'payment.captured' && event.amount !== undefined && event.amount !== order.total) {
    return { applied: false, reason: 'amount mismatch', orderReference: order.reference }
  }

  const fresh = await store.recordPaymentEvent({
    orderReference: order.reference,
    provider,
    providerPaymentId: event.providerPaymentId,
    providerEventId: `${provider}:${event.eventId}`,
    status: event.type === 'payment.captured' ? 'captured' : event.type === 'payment.failed' ? 'failed' : 'refunded',
    amount: event.amount ?? order.total,
    raw: event.raw,
  })
  if (!fresh) return { applied: false, reason: 'duplicate', orderReference: order.reference }

  if (event.type === 'payment.captured') {
    await store.setOrderStatus(order.reference, 'paid', ['pending', 'awaiting_payment', 'failed'])
  } else if (event.type === 'payment.failed') {
    await store.setOrderStatus(order.reference, 'failed', ['pending', 'awaiting_payment'])
  } else if (event.type === 'refund.processed') {
    await store.setOrderStatus(order.reference, 'refunded', ['paid', 'fulfilled'])
  }
  return { applied: true, orderReference: order.reference }
}
