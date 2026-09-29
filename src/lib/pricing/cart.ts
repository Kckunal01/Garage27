import type { Paise, Part } from '@/types/catalogue'

export interface CartLineInput {
  partId: string
  quantity: number
}

export interface PricedLine {
  part: Part
  quantity: number
  lineTotal: Paise
}

/** How the customer pays. Chosen at checkout; priced here, on the server. */
export const PAYMENT_METHODS = ['online', 'cod'] as const
export type PaymentMethod = (typeof PAYMENT_METHODS)[number]

export const PAYMENT_RULES = {
  /** Cash on delivery surcharge. */
  codFee: 50_000 as Paise, // ₹500
}

export const SHIPPING_RULES = {
  flat: 15_000 as Paise, // ₹150
  freeOver: 500_000 as Paise, // ₹5,000
  maxQtyPerLine: 10,
}

export type CartProblem = { partId: string; problem: 'unknown' | 'unavailable' | 'insufficient-stock'; available?: number }

export interface PricedCart {
  lines: PricedLine[]
  problems: CartProblem[]
  subtotal: Paise
  shipping: Paise
  /** Cash-on-delivery surcharge (0 for online payment). */
  codFee: Paise
  total: Paise
}

/** COD fee for a method — the one place the surcharge is decided. */
export const codFeeFor = (method: PaymentMethod): Paise => (method === 'cod' ? PAYMENT_RULES.codFee : 0)

/**
 * Authoritative on the server; the browser uses it for display only.
 * online: total = items + shipping · cod: total = items + shipping + COD fee.
 */
export function priceCart(items: CartLineInput[], parts: Part[], method: PaymentMethod = 'online'): PricedCart {
  const lines: PricedLine[] = []
  const problems: CartProblem[] = []
  const merged = new Map<string, number>()
  for (const i of items) merged.set(i.partId, (merged.get(i.partId) ?? 0) + i.quantity)

  for (const [partId, qty] of merged) {
    const part = parts.find((p) => p.id === partId)
    if (!part) {
      problems.push({ partId, problem: 'unknown' })
      continue
    }
    if (part.status !== 'active') {
      problems.push({ partId, problem: 'unavailable' })
      continue
    }
    const quantity = Math.min(qty, SHIPPING_RULES.maxQtyPerLine)
    if (part.stock < quantity) {
      problems.push({ partId, problem: 'insufficient-stock', available: part.stock })
      continue
    }
    lines.push({ part, quantity, lineTotal: part.price * quantity })
  }
  const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0)
  const shipping = subtotal === 0 || subtotal >= SHIPPING_RULES.freeOver ? 0 : SHIPPING_RULES.flat
  const codFee = subtotal === 0 ? 0 : codFeeFor(method)
  return { lines, problems, subtotal, shipping, codFee, total: subtotal + shipping + codFee }
}
