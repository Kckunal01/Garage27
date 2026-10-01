import type { Paise } from '@/types/catalogue'

const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })
const inrPaise = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2, maximumFractionDigits: 2 })

/** Format integer paise as ₹ with Indian digit grouping; paise show only when there are any (₹79.96, ₹4,999). */
export function formatINR(paise: Paise): string {
  const p = Math.round(paise)
  return p % 100 === 0 ? inr.format(p / 100) : inrPaise.format(p / 100)
}

/** Signed delta, e.g. "+ ₹8,500" / "INCLUDED". */
export function formatDelta(paise: Paise): string {
  if (paise === 0) return 'INCLUDED'
  return `${paise > 0 ? '+' : '−'} ${formatINR(Math.abs(paise))}`
}

/** Coarse value band for analytics — never send exact order values with PII. */
export function valueBand(paise: Paise): string {
  const rupees = paise / 100
  if (rupees < 5_000) return '<5k'
  if (rupees < 25_000) return '5k-25k'
  if (rupees < 1_00_000) return '25k-1L'
  if (rupees < 2_50_000) return '1L-2.5L'
  return '2.5L+'
}

/** A product price, or PRICE ON REQUEST when none is stored (never ₹0). */
export function formatPrice(paise: Paise | null | undefined): string {
  return paise === null || paise === undefined ? 'PRICE ON REQUEST' : formatINR(paise)
}
