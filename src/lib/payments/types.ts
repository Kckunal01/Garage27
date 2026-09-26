import type { Paise } from '@/types/catalogue'

/**
 * Payment provider abstraction. The storefront only ever talks to this
 * interface; swapping Razorpay for another gateway means adding a provider,
 * not rewriting checkout.
 */

export interface CreatePaymentInput {
  orderReference: string
  amount: Paise
  currency: 'INR'
  customer: { name: string; email: string; phone: string }
}

/** What the browser needs to open the gateway. Contains NO secrets. */
export interface ClientPaymentSession {
  provider: string
  providerOrderId: string
  amount: Paise
  currency: 'INR'
  /** Public key id (Razorpay key_id is designed to be public). */
  publicKey?: string
  /** Where to send the customer next for redirect-style gateways. */
  redirectUrl?: string
}

export interface VerifyPaymentInput {
  providerOrderId: string
  providerPaymentId: string
  signature: string
}

export type VerifyResult = { verified: true; providerPaymentId: string } | { verified: false; reason: string }

export interface WebhookEvent {
  /** Unique id used for idempotent processing. */
  eventId: string
  type: 'payment.captured' | 'payment.failed' | 'refund.processed' | 'ignored'
  providerOrderId?: string
  providerPaymentId?: string
  amount?: Paise
  raw: unknown
}

export interface PaymentProvider {
  readonly id: string
  createPayment(input: CreatePaymentInput): Promise<ClientPaymentSession>
  verifyPayment(input: VerifyPaymentInput): Promise<VerifyResult>
  /** Verifies signature and normalises the event. Throws on a bad signature. */
  handleWebhook(rawBody: string, headers: Headers): Promise<WebhookEvent>
  refundPayment(providerPaymentId: string, amount?: Paise): Promise<{ refundId: string }>
}

export class PaymentSignatureError extends Error {}
