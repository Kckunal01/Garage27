import { createHmac } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import { createRazorpayProvider, hmacMatches } from './razorpay'
import { PaymentSignatureError } from './types'
import { settlePayment } from '@/lib/server/settlement'
import { getStore, makeReference, type OrderRecord } from '@/lib/server/store'

const cfg = { keyId: 'rzp_test_x', keySecret: 'secret_k', webhookSecret: 'secret_w' }
const rp = createRazorpayProvider(cfg)
const sign = (payload: string, secret: string) => createHmac('sha256', secret).update(payload).digest('hex')

describe('razorpay signatures', () => {
  it('verifies checkout signatures and rejects tampered ones', async () => {
    const sig = sign('order_1|pay_1', cfg.keySecret)
    expect(await rp.verifyPayment({ providerOrderId: 'order_1', providerPaymentId: 'pay_1', signature: sig })).toEqual({ verified: true, providerPaymentId: 'pay_1' })
    expect((await rp.verifyPayment({ providerOrderId: 'order_1', providerPaymentId: 'pay_2', signature: sig })).verified).toBe(false)
    expect(hmacMatches('x', 'k', '')).toBe(false)
  })

  it('rejects webhooks with a bad signature and normalises good ones', async () => {
    const body = JSON.stringify({ event: 'payment.captured', payload: { payment: { entity: { id: 'pay_9', order_id: 'order_9', amount: 1000 } } } })
    await expect(rp.handleWebhook(body, new Headers({ 'x-razorpay-signature': 'nope' }))).rejects.toBeInstanceOf(PaymentSignatureError)
    const ev = await rp.handleWebhook(body, new Headers({ 'x-razorpay-signature': sign(body, cfg.webhookSecret), 'x-razorpay-event-id': 'evt_1' }))
    expect(ev).toMatchObject({ eventId: 'evt_1', type: 'payment.captured', providerOrderId: 'order_9', amount: 1000 })
  })
})

describe('settlement', () => {
  const makeOrder = (): OrderRecord => ({
    reference: makeReference('O'),
    status: 'awaiting_payment',
    subtotal: 5000,
    platformFee: 0,
    charge: 0,
    shipping: 0,
    codFee: 0,
    total: 5000,
    currency: 'INR',
    paymentMethod: 'online',
    contact: { name: 'A', email: 'a@b.co', phone: '9999999999' },
    shippingAddress: {},
    paymentProvider: 'mock',
    items: [],
  })

  it('marks paid exactly once (idempotent webhook + verify race)', async () => {
    const store = getStore()
    const order = makeOrder()
    await store.insertOrder(order)
    await store.setOrderProviderId(order.reference, `po_${order.reference}`, 'awaiting_payment')
    const ev = { eventId: 'e1', type: 'payment.captured' as const, providerOrderId: `po_${order.reference}`, providerPaymentId: 'p1', amount: 5000, raw: {} }
    expect((await settlePayment(store, 'mock', ev)).applied).toBe(true)
    expect((await settlePayment(store, 'mock', ev)).reason).toBe('duplicate')
    // A late failure cannot downgrade a paid order.
    await settlePayment(store, 'mock', { ...ev, eventId: 'e2', type: 'payment.failed' })
    expect((await store.getOrderByReference(order.reference))?.status).toBe('paid')
  })

  it('refuses captures whose amount does not match the order', async () => {
    const store = getStore()
    const order = makeOrder()
    await store.insertOrder(order)
    await store.setOrderProviderId(order.reference, `po_${order.reference}`, 'awaiting_payment')
    const r = await settlePayment(store, 'mock', { eventId: 'x', type: 'payment.captured', providerOrderId: `po_${order.reference}`, amount: 1, raw: {} })
    expect(r.reason).toBe('amount mismatch')
    expect((await store.getOrderByReference(order.reference))?.status).toBe('awaiting_payment')
  })

  it('references are unguessable and well-formed', () => {
    const refs = new Set(Array.from({ length: 200 }, () => makeReference('Q')))
    expect(refs.size).toBe(200)
    for (const r of refs) expect(r).toMatch(/^G27-Q-[2-9A-HJ-NP-Z]{8}$/)
  })
})
