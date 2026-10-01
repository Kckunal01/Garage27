import { getCatalogue } from '@/lib/catalogue/repository'
import { priceCart } from '@/lib/pricing/cart'
import { checkoutSchema } from '@/lib/validation/schemas'
import { getPaymentProvider } from '@/lib/payments'
import { clientIp, invalid, isSameOrigin, json, misfire, rateLimited } from '@/lib/server/http'
import { getStore, makeReference } from '@/lib/server/store'

export const dynamic = 'force-dynamic'

/**
 * Checkout → server prices the cart from the catalogue (products at their
 * current price, 4% platform fee, shipping, plus the COD fee for cash on delivery) → creates the order. Online: asks the gateway for a
 * payment order; the order is marked paid later, server-side. COD: no
 * gateway; the order is `placed` and paid on delivery. The browser only ever
 * sends part ids, quantities and the method — never an amount.
 */
export async function POST(req: Request) {
  if (!isSameOrigin(req)) return json({ error: 'Forbidden' }, 403)
  if (rateLimited(`checkout:${clientIp(req)}`, 10)) return json({ error: 'Easy on the throttle — try again in a minute.' }, 429)

  const body = await req.json().catch(() => null)
  const parsed = checkoutSchema.safeParse(body)
  if (!parsed.success) return invalid(parsed.error)

  try {
    const { parts } = await getCatalogue()
    const method = parsed.data.paymentMethod
    const cart = priceCart(parsed.data.items, parts, method)
    if (cart.problems.length) return json({ error: 'Some parts are no longer on the shelf.', problems: cart.problems }, 409)

    const store = getStore()
    const reference = makeReference('O')
    const { address } = parsed.data
    const order = {
      reference,
      subtotal: cart.subtotal,
      platformFee: cart.platformFee,
      shipping: cart.shipping,
      codFee: cart.codFee,
      total: cart.total,
      currency: 'INR' as const,
      paymentMethod: method,
      contact: parsed.data.contact,
      shippingAddress: { line1: address.line1, line2: address.line2, city: address.city, state: address.state, pincode: address.pincode },
      items: cart.lines.map((l) => ({ partId: l.part.id, name: l.part.name, sku: l.part.sku, unitPrice: l.part.price, quantity: l.quantity })),
    }

    if (method === 'cod') {
      await store.insertOrder({ ...order, status: 'placed', paymentProvider: 'cod' })
      return json({ reference, payment: { provider: 'cod', amount: cart.total, currency: 'INR' } }, 201)
    }

    const provider = getPaymentProvider()
    await store.insertOrder({ ...order, status: 'pending', paymentProvider: provider.id })
    const session = await provider.createPayment({ orderReference: reference, amount: cart.total, currency: 'INR', customer: parsed.data.contact })
    await store.setOrderProviderId(reference, session.providerOrderId, 'awaiting_payment')
    return json({ reference, payment: session }, 201)
  } catch (err) {
    return misfire('checkout.create', err)
  }
}
