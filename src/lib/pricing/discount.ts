import type { Paise, Part } from '@/types/catalogue'

/** Each discounted part's reference price, for the browser's checkout summary (display only). */
export const referencePrices = (parts: Pick<Part, 'id' | 'price' | 'compareAtPrice'>[]): Record<string, Paise> =>
  Object.fromEntries(parts.flatMap((p) => (p.compareAtPrice && p.compareAtPrice > p.price ? [[p.id, p.compareAtPrice]] : [])))

export interface Discount {
  /** Original / reference price (shown crossed out; never charged). */
  was: Paise
  /** oldPrice − currentPrice. */
  amount: Paise
  /** ((oldPrice − currentPrice) / oldPrice) × 100, rounded to a whole percent. */
  percent: number
}

/** A part's discount, or null when it has no reference price above the selling price. */
export function discountOf(part: Pick<Part, 'price' | 'compareAtPrice'>): Discount | null {
  const was = part.compareAtPrice
  if (!was || was <= part.price) return null
  const amount = was - part.price
  return { was, amount, percent: Math.round((amount / was) * 100) }
}
