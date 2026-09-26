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
  total: Paise
}

/** Authoritative on the server; the browser uses it for display only. */
export function priceCart(items: CartLineInput[], parts: Part[]): PricedCart {
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
  return { lines, problems, subtotal, shipping, total: subtotal + shipping }
}
