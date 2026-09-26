import 'server-only'
import { createHmac, timingSafeEqual } from 'node:crypto'
import {
  PaymentSignatureError,
  type CreatePaymentInput,
  type PaymentProvider,
  type VerifyPaymentInput,
  type WebhookEvent,
} from './types'

/** Constant-time HMAC-SHA256 hex comparison. */
export function hmacMatches(payload: string, secret: string, signature: string): boolean {
  const expected = createHmac('sha256', secret).update(payload).digest('hex')
  const a = Buffer.from(expected, 'utf8')
  const b = Buffer.from(signature ?? '', 'utf8')
  return a.length === b.length && timingSafeEqual(a, b)
}

interface RazorpayConfig {
  keyId: string
  keySecret: string
  webhookSecret: string
}

const API = 'https://api.razorpay.com/v1'

export function createRazorpayProvider(cfg: RazorpayConfig): PaymentProvider {
  const auth = 'Basic ' + Buffer.from(`${cfg.keyId}:${cfg.keySecret}`).toString('base64')
  const call = async <T>(path: string, body: unknown): Promise<T> => {
    const res = await fetch(`${API}${path}`, {
      method: 'POST',
      headers: { Authorization: auth, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      cache: 'no-store',
    })
    if (!res.ok) throw new Error(`razorpay ${path} ${res.status}`)
    return (await res.json()) as T
  }

  return {
    id: 'razorpay',
    async createPayment(input: CreatePaymentInput) {
      const order = await call<{ id: string; amount: number; currency: string }>('/orders', {
        amount: input.amount,
        currency: input.currency,
        receipt: input.orderReference,
        notes: { reference: input.orderReference },
      })
      return { provider: 'razorpay', providerOrderId: order.id, amount: order.amount, currency: 'INR', publicKey: cfg.keyId }
    },

    async verifyPayment({ providerOrderId, providerPaymentId, signature }: VerifyPaymentInput) {
      const ok = hmacMatches(`${providerOrderId}|${providerPaymentId}`, cfg.keySecret, signature)
      return ok ? { verified: true, providerPaymentId } : { verified: false, reason: 'signature mismatch' }
    },

    async handleWebhook(rawBody: string, headers: Headers): Promise<WebhookEvent> {
      const signature = headers.get('x-razorpay-signature') ?? ''
      if (!hmacMatches(rawBody, cfg.webhookSecret, signature)) throw new PaymentSignatureError('bad webhook signature')
      const body = JSON.parse(rawBody) as {
        event: string
        payload?: { payment?: { entity?: { id: string; order_id: string; amount: number } } }
      }
      const eventId = headers.get('x-razorpay-event-id') ?? `${body.event}:${body.payload?.payment?.entity?.id ?? 'na'}`
      const p = body.payload?.payment?.entity
      const type: WebhookEvent['type'] =
        body.event === 'payment.captured' || body.event === 'order.paid'
          ? 'payment.captured'
          : body.event === 'payment.failed'
            ? 'payment.failed'
            : body.event === 'refund.processed'
              ? 'refund.processed'
              : 'ignored'
      return { eventId, type, providerOrderId: p?.order_id, providerPaymentId: p?.id, amount: p?.amount, raw: { event: body.event, paymentId: p?.id, orderId: p?.order_id } }
    },

    async refundPayment(providerPaymentId, amount) {
      const r = await call<{ id: string }>(`/payments/${encodeURIComponent(providerPaymentId)}/refund`, amount ? { amount } : {})
      return { refundId: r.id }
    },
  }
}
