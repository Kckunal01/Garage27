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
  flat: 49_900 as Paise, // ₹499 at or below the threshold
  /** Product subtotal above this ships free (₹4,999). */
  freeAbove: 499_900 as Paise,
  maxQtyPerLine: 10,
}

/** Garage 27's platform fee (Terms & Conditions 08), in basis points of the product subtotal: 4%. */
export const PLATFORM_FEE_BP = 400
/** The platform fee as shown to the customer. */
export const PLATFORM_FEE_LABEL = `${PLATFORM_FEE_BP / 100}%`

const ofBp = (paise: Paise, bp: number): Paise => Math.round((paise * bp) / 10_000)

export interface ChargeLine {
  /** Current selling price — never the crossed-out reference price. */
  price: Paise
  quantity: number
}

export interface Breakdown {
  subtotal: Paise
  platformFee: Paise
  shipping: Paise
  /** Cash-on-delivery surcharge (0 for online payment). */
  codFee: Paise
  total: Paise
}

/**
 * The price composition, one function for server and browser:
 * total = products + 4% platform fee + shipping (+ COD fee).
 */
export function breakdown(lines: ChargeLine[], method: PaymentMethod = 'online'): Breakdown {
  const subtotal = lines.reduce((s, l) => s + l.price * l.quantity, 0)
  if (subtotal === 0) return { subtotal: 0, platformFee: 0, shipping: 0, codFee: 0, total: 0 }
  const platformFee = ofBp(subtotal, PLATFORM_FEE_BP)
  const shipping = subtotal > SHIPPING_RULES.freeAbove ? 0 : SHIPPING_RULES.flat
  const codFee = codFeeFor(method)
  return { subtotal, platformFee, shipping, codFee, total: subtotal + platformFee + shipping + codFee }
}

export type CartProblem = { partId: string; problem: 'unknown' | 'unavailable' | 'insufficient-stock'; available?: number }

export interface PricedCart extends Breakdown {
  lines: PricedLine[]
  problems: CartProblem[]
}

/** COD fee for a method — the one place the surcharge is decided. */
export const codFeeFor = (method: PaymentMethod): Paise => (method === 'cod' ? PAYMENT_RULES.codFee : 0)

/** Authoritative on the server; the browser uses `breakdown` for display only. */
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
  return { lines, problems, ...breakdown(lines.map((l) => ({ price: l.part.price, quantity: l.quantity })), method) }
}
