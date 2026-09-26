import { z } from 'zod'
import { mockSign } from '@/lib/payments/mock'
import { json } from '@/lib/server/http'

export const dynamic = 'force-dynamic'

/**
 * DEVELOPMENT ONLY — plays the role of the hosted gateway page: "the customer
 * paid", returning a signed callback exactly as a real gateway would. The
 * browser still has to send it to /api/payments/verify to be checked.
 */
export async function POST(req: Request) {
  if (process.env.PAYMENT_PROVIDER && process.env.PAYMENT_PROVIDER !== 'mock') return json({ error: 'Not found' }, 404)
  if (process.env.NODE_ENV === 'production' && process.env.ALLOW_MOCK_PAYMENTS !== 'true') return json({ error: 'Not found' }, 404)
  const body = z.object({ providerOrderId: z.string().startsWith('mock_order_'), outcome: z.enum(['success', 'failure']) }).safeParse(await req.json().catch(() => null))
  if (!body.success) return json({ error: 'Bad request' }, 400)
  if (body.data.outcome === 'failure') return json({ outcome: 'failure' })
  const providerPaymentId = `mock_pay_${Date.now().toString(36)}`
  return json({ outcome: 'success', providerPaymentId, signature: mockSign(`${body.data.providerOrderId}|${providerPaymentId}`) })
}
