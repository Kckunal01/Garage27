import { verifyPaymentSchema } from '@/lib/validation/schemas'
import { getPaymentProvider } from '@/lib/payments'
import { invalid, isSameOrigin, json, misfire } from '@/lib/server/http'
import { getStore } from '@/lib/server/store'
import { settlePayment } from '@/lib/server/settlement'

export const dynamic = 'force-dynamic'

/**
 * Called after the gateway's client callback. The callback itself is never
 * trusted — the signature is verified server-side before the order changes.
 * The webhook remains the backstop if this request never arrives.
 */
export async function POST(req: Request) {
  if (!isSameOrigin(req)) return json({ error: 'Forbidden' }, 403)
  const parsed = verifyPaymentSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return invalid(parsed.error)
  const { orderReference, providerOrderId, providerPaymentId, signature } = parsed.data

  try {
    const store = getStore()
    const order = await store.getOrderByReference(orderReference)
    if (!order || order.providerOrderId !== providerOrderId) return json({ error: 'Unknown order' }, 404)

    const provider = getPaymentProvider()
    const result = await provider.verifyPayment({ providerOrderId, providerPaymentId, signature })
    if (!result.verified) {
      return json({ status: 'failed', error: 'We couldn’t verify that payment. You have not been charged twice — contact us with your reference.' }, 400)
    }
    await settlePayment(store, provider.id, {
      eventId: `verify:${providerPaymentId}`,
      type: 'payment.captured',
      providerOrderId,
      providerPaymentId,
      amount: order.total,
      raw: { via: 'client-verify' },
    })
    const fresh = await store.getOrderByReference(orderReference)
    return json({ status: fresh?.status ?? 'pending' })
  } catch (err) {
    return misfire('payment.verify', err)
  }
}
