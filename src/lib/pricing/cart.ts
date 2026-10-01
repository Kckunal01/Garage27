import type { Bike, Paise, Part } from '@/types/catalogue'

export interface CartLineInput {
  partId: string
  quantity: number
}

export interface PricedLine {
  part: Part
  quantity: number
  lineTotal: Paise
  /** Tax / applicable charge rate for this part, in basis points (1800 = 18%). */
  chargeBp: number
}

/** How the customer pays. Chosen at checkout; priced here, on the server. */
export const PAYMENT_METHODS = ['online', 'cod'] as const
export type PaymentMethod = (typeof PAYMENT_METHODS)[number]

export const PAYMENT_RULES = {
  /** Cash on delivery surcharge. */
  codFee: 50_000 as Paise, // ₹500
}

export const SHIPPING_RULES = {
  flat: 49_900 as Paise, // ₹499 below the threshold
  /** Product subtotal at or above this ships free (₹1,999). */
  freeFrom: 199_900 as Paise,
  maxQtyPerLine: 10,
}

/**
 * Garage 27's displayed charge structure (Terms & Conditions 08–09). Rates are
 * basis points of the product price. Pending CA / tax review before launch.
 */
export const CHARGE_RULES = {
  /** Platform fee on the product subtotal: 4%. */
  platformFeeBp: 400,
  /** Universal parts, and bike-specific parts for bikes up to 350cc: 18%. */
  standardBp: 1_800,
  /** Bike-specific parts for a bike above 350cc: 40%. */
  over350Bp: 4_000,
  ccThreshold: 350,
}

/** The charge rate for a part: 40% when it is bike-specific and fits a bike above 350cc, else 18%. */
export function chargeRateFor(part: Pick<Part, 'compatibleBikeIds'>, bikes: Pick<Bike, 'id' | 'engineCc'>[]): number {
  const specificOver350 = part.compatibleBikeIds.some((id) => (bikes.find((b) => b.id === id)?.engineCc ?? 0) > CHARGE_RULES.ccThreshold)
  return specificOver350 ? CHARGE_RULES.over350Bp : CHARGE_RULES.standardBp
}

/** Every part's charge rate, for the browser's display-only breakdown. */
export const chargeRates = (parts: Pick<Part, 'id' | 'compatibleBikeIds'>[], bikes: Pick<Bike, 'id' | 'engineCc'>[]): Record<string, number> =>
  Object.fromEntries(parts.map((p) => [p.id, chargeRateFor(p, bikes)]))

const ofBp = (paise: Paise, bp: number): Paise => Math.round((paise * bp) / 10_000)

export interface ChargeLine {
  price: Paise
  quantity: number
  chargeBp: number
}

export interface Breakdown {
  subtotal: Paise
  platformFee: Paise
  /** Tax / applicable charge on the product price. */
  charge: Paise
  shipping: Paise
  /** Cash-on-delivery surcharge (0 for online payment). */
  codFee: Paise
  total: Paise
}

/**
 * The price composition, one function for server and browser:
 * total = products + platform fee + tax/charge + shipping (+ COD fee).
 * Platform fee and charge are on the product price only.
 */
export function breakdown(lines: ChargeLine[], method: PaymentMethod = 'online'): Breakdown {
  const subtotal = lines.reduce((s, l) => s + l.price * l.quantity, 0)
  if (subtotal === 0) return { subtotal: 0, platformFee: 0, charge: 0, shipping: 0, codFee: 0, total: 0 }
  const platformFee = ofBp(subtotal, CHARGE_RULES.platformFeeBp)
  const charge = lines.reduce((s, l) => s + ofBp(l.price * l.quantity, l.chargeBp), 0)
  const shipping = subtotal >= SHIPPING_RULES.freeFrom ? 0 : SHIPPING_RULES.flat
  const codFee = codFeeFor(method)
  return { subtotal, platformFee, charge, shipping, codFee, total: subtotal + platformFee + charge + shipping + codFee }
}

export type CartProblem = { partId: string; problem: 'unknown' | 'unavailable' | 'insufficient-stock'; available?: number }

export interface PricedCart extends Breakdown {
  lines: PricedLine[]
  problems: CartProblem[]
}

/** COD fee for a method — the one place the surcharge is decided. */
export const codFeeFor = (method: PaymentMethod): Paise => (method === 'cod' ? PAYMENT_RULES.codFee : 0)

/** Authoritative on the server; the browser uses `breakdown` for display only. */
export function priceCart(items: CartLineInput[], parts: Part[], bikes: Pick<Bike, 'id' | 'engineCc'>[], method: PaymentMethod = 'online'): PricedCart {
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
    lines.push({ part, quantity, lineTotal: part.price * quantity, chargeBp: chargeRateFor(part, bikes) })
  }
  return { lines, problems, ...breakdown(lines.map((l) => ({ price: l.part.price, quantity: l.quantity, chargeBp: l.chargeBp })), method) }
}
