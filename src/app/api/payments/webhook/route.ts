import { getPaymentProvider } from '@/lib/payments'
import { PaymentSignatureError } from '@/lib/payments/types'
import { json, misfire } from '@/lib/server/http'
import { getStore } from '@/lib/server/store'
import { settlePayment } from '@/lib/server/settlement'

export const dynamic = 'force-dynamic'

/** Gateway → server. Signature-verified and idempotent (safe to retry). */
export async function POST(req: Request) {
  const raw = await req.text()
  try {
    const provider = getPaymentProvider()
    const event = await provider.handleWebhook(raw, req.headers)
    const result = await settlePayment(getStore(), provider.id, event)
    return json({ received: true, applied: result.applied })
  } catch (err) {
    if (err instanceof PaymentSignatureError) return json({ error: 'invalid signature' }, 401)
    return misfire('payment.webhook', err)
  }
}
