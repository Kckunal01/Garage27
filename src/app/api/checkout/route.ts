import { getCatalogue } from '@/lib/catalogue/repository'
import { priceCart } from '@/lib/pricing/cart'
import { checkoutSchema } from '@/lib/validation/schemas'
import { getPaymentProvider } from '@/lib/payments'
import { clientIp, invalid, isSameOrigin, json, misfire, rateLimited } from '@/lib/server/http'
import { getStore, makeReference } from '@/lib/server/store'

export const dynamic = 'force-dynamic'

/**
 * Checkout → server prices the cart from the catalogue → creates the order →
 * asks the gateway for a payment order. The browser receives only what it
 * needs to open the gateway; the order is marked paid later, server-side.
 */
export async function POST(req: Request) {
  if (!isSameOrigin(req)) return json({ error: 'Forbidden' }, 403)
  if (rateLimited(`checkout:${clientIp(req)}`, 10)) return json({ error: 'Easy on the throttle — try again in a minute.' }, 429)

  const body = await req.json().catch(() => null)
  const parsed = checkoutSchema.safeParse(body)
  if (!parsed.success) return invalid(parsed.error)

  try {
    const { parts } = await getCatalogue()
    const cart = priceCart(parsed.data.items, parts)
    if (cart.problems.length) return json({ error: 'Some parts are no longer on the shelf.', problems: cart.problems }, 409)

    const provider = getPaymentProvider()
    const store = getStore()
    const reference = makeReference('O')
    const { address } = parsed.data
    await store.insertOrder({
      reference,
      status: 'pending',
      subtotal: cart.subtotal,
      shipping: cart.shipping,
      total: cart.total,
      currency: 'INR',
      contact: parsed.data.contact,
      shippingAddress: { line1: address.line1, line2: address.line2, city: address.city, state: address.state, pincode: address.pincode },
      paymentProvider: provider.id,
      items: cart.lines.map((l) => ({ partId: l.part.id, name: l.part.name, sku: l.part.sku, unitPrice: l.part.price, quantity: l.quantity })),
    })
    const session = await provider.createPayment({ orderReference: reference, amount: cart.total, currency: 'INR', customer: parsed.data.contact })
    await store.setOrderProviderId(reference, session.providerOrderId, 'awaiting_payment')
    return json({ reference, payment: session }, 201)
  } catch (err) {
    return misfire('checkout.create', err)
  }
}
