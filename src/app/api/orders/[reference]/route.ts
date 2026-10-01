import { json, misfire } from '@/lib/server/http'
import { getStore } from '@/lib/server/store'

export const dynamic = 'force-dynamic'

/**
 * Order status for the confirmation page. The reference is an unguessable
 * token; the response carries no contact details or address.
 */
export async function GET(_req: Request, ctx: { params: Promise<{ reference: string }> }) {
  const { reference } = await ctx.params
  if (!/^G27-O-[A-Z0-9]{8}$/.test(reference)) return json({ error: 'Not found' }, 404)
  try {
    const order = await getStore().getOrderByReference(reference)
    if (!order) return json({ error: 'Not found' }, 404)
    return json({
      reference: order.reference,
      status: order.status,
      paymentMethod: order.paymentMethod,
      subtotal: order.subtotal,
      platformFee: order.platformFee,
      shipping: order.shipping,
      codFee: order.codFee,
      total: order.total,
      items: order.items.map((i) => ({ name: i.name, quantity: i.quantity, unitPrice: i.unitPrice })),
    })
  } catch (err) {
    return misfire('order.status', err)
  }
}
