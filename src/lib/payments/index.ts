import 'server-only'
import { createRazorpayProvider } from './razorpay'
import { mockProvider } from './mock'
import type { PaymentProvider } from './types'

export class PaymentConfigError extends Error {}

/** Resolve the configured gateway. Secrets are read here, server-side only. */
export function getPaymentProvider(): PaymentProvider {
  const id = process.env.PAYMENT_PROVIDER ?? 'mock'
  if (id === 'razorpay') {
    const { RAZORPAY_KEY_ID: keyId, RAZORPAY_KEY_SECRET: keySecret, RAZORPAY_WEBHOOK_SECRET: webhookSecret } = process.env
    if (!keyId || !keySecret || !webhookSecret) throw new PaymentConfigError('Razorpay keys are not configured')
    return createRazorpayProvider({ keyId, keySecret, webhookSecret })
  }
  if (id === 'mock') {
    if (process.env.NODE_ENV === 'production' && process.env.ALLOW_MOCK_PAYMENTS !== 'true') {
      throw new PaymentConfigError('Mock payments are disabled in production')
    }
    return mockProvider
  }
  throw new PaymentConfigError(`Unknown payment provider: ${id}`)
}
