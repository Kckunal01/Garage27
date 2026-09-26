import 'server-only'
import { createHmac, randomBytes } from 'node:crypto'
import { hmacMatches } from './razorpay'
import { PaymentSignatureError, type PaymentProvider, type WebhookEvent } from './types'

/**
 * Development gateway. Behaves like a real provider (server-created order,
 * HMAC-signed confirmation, idempotent webhook) so the full flow can be tested
 * without keys. Refused in production by the registry.
 */
const SECRET = 'garage27-mock-secret'

export const mockSign = (payload: string) => createHmac('sha256', SECRET).update(payload).digest('hex')

export const mockProvider: PaymentProvider = {
  id: 'mock',
  async createPayment(input) {
    const providerOrderId = `mock_order_${randomBytes(6).toString('hex')}`
    return { provider: 'mock', providerOrderId, amount: input.amount, currency: 'INR' }
  },
  async verifyPayment({ providerOrderId, providerPaymentId, signature }) {
    return hmacMatches(`${providerOrderId}|${providerPaymentId}`, SECRET, signature)
      ? { verified: true, providerPaymentId }
      : { verified: false, reason: 'signature mismatch' }
  },
  async handleWebhook(rawBody, headers): Promise<WebhookEvent> {
    if (!hmacMatches(rawBody, SECRET, headers.get('x-mock-signature') ?? '')) throw new PaymentSignatureError('bad mock signature')
    const body = JSON.parse(rawBody) as { id: string; type: WebhookEvent['type']; orderId: string; paymentId: string; amount: number }
    return { eventId: body.id, type: body.type, providerOrderId: body.orderId, providerPaymentId: body.paymentId, amount: body.amount, raw: body }
  },
  async refundPayment() {
    return { refundId: `mock_refund_${randomBytes(4).toString('hex')}` }
  },
}
