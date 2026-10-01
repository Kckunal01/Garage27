/**
 * Track Order: everything the result page says about an order is derived
 * here from the order's real status and placement time — nothing invented.
 * Statuses Garage 27 records: pending, awaiting_payment, placed (COD), paid,
 * fulfilled (dispatched), failed, cancelled, refunded. There is no recorded
 * "out for delivery" or "delivered" state yet, so those steps stay ahead.
 */

export const TIMELINE = ['Order Placed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered'] as const

export type StepState = 'done' | 'current' | 'ahead'

const LIVE = new Set(['placed', 'paid', 'fulfilled'])
const HALTED = new Set(['failed', 'cancelled', 'refunded'])

/** Each timeline step's state for an order status. */
export function timelineFor(status: string): StepState[] {
  // How many steps are complete, and which one is current (-1: none).
  const [done, current] =
    status === 'fulfilled' ? [2, 2] : status === 'placed' || status === 'paid' ? [1, 1] : HALTED.has(status) ? [1, -1] : [0, 0]
  return TIMELINE.map((_, i) => (i === current ? 'current' : i < done ? 'done' : 'ahead'))
}

/** The hero headline (two lines) and the line under it, by status. */
export function headlineFor(status: string): { lines: [string, string]; sub: string } {
  const sub = 'Here’s exactly where it stands right now.'
  switch (status) {
    case 'fulfilled':
      return { lines: ['YOUR ORDER', 'IS ON ITS WAY.'], sub }
    case 'placed':
    case 'paid':
      return { lines: ['YOUR ORDER IS', 'BEING PREPARED.'], sub }
    case 'pending':
    case 'awaiting_payment':
      return { lines: ['YOUR ORDER IS', 'AWAITING PAYMENT.'], sub: 'We start on it as soon as the payment is confirmed.' }
    case 'failed':
      return { lines: ['YOUR PAYMENT', 'DIDN’T GO THROUGH.'], sub: 'You have not been charged.' }
    case 'cancelled':
      return { lines: ['YOUR ORDER', 'WAS CANCELLED.'], sub: 'Questions about it? We’re here to help.' }
    case 'refunded':
      return { lines: ['YOUR ORDER', 'WAS REFUNDED.'], sub: 'Questions about it? We’re here to help.' }
    default:
      return { lines: ['YOUR ORDER', 'STATUS.'], sub }
  }
}

const IST = 'Asia/Kolkata'

/** The calendar day of an instant in India, as a UTC-midnight Date (for day arithmetic). */
function istDay(iso: string): Date {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: IST, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(iso))
  return new Date(`${parts}T00:00:00Z`)
}

function addBusinessDays(day: Date, n: number): Date {
  const d = new Date(day)
  let left = n
  while (left > 0) {
    d.setUTCDate(d.getUTCDate() + 1)
    const wd = d.getUTCDay()
    if (wd !== 0 && wd !== 6) left--
  }
  return d
}

/**
 * Shipping Policy: dispatch within 2–5 business days, then delivery in about
 * 3–7 business days — so an indicative window of 5–12 business days from
 * the order date. Only for orders that are being fulfilled.
 */
export const DELIVERY_WINDOW = { minBusinessDays: 2 + 3, maxBusinessDays: 5 + 7 }

export function estimatedDelivery(status: string, placedAt: string | null | undefined): { from: Date; to: Date } | null {
  if (!placedAt || !LIVE.has(status) || Number.isNaN(Date.parse(placedAt))) return null
  const day = istDay(placedAt)
  return { from: addBusinessDays(day, DELIVERY_WINDOW.minBusinessDays), to: addBusinessDays(day, DELIVERY_WINDOW.maxBusinessDays) }
}

const dayFmt = (opts: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat('en-IN', { timeZone: 'UTC', ...opts })

/** "18 – 27 Oct 2026", "29 Oct – 6 Nov 2026", "29 Dec 2026 – 8 Jan 2027". */
export function formatWindow({ from, to }: { from: Date; to: Date }): string {
  const sameYear = from.getUTCFullYear() === to.getUTCFullYear()
  const sameMonth = sameYear && from.getUTCMonth() === to.getUTCMonth()
  const end = dayFmt({ day: 'numeric', month: 'short', year: 'numeric' }).format(to)
  const start = dayFmt(sameMonth ? { day: 'numeric' } : sameYear ? { day: 'numeric', month: 'short' } : { day: 'numeric', month: 'short', year: 'numeric' }).format(from)
  return `${start} – ${end}`
}

/** "12 Oct 2026, 4:32 PM" in India time. */
export function formatPlaced(iso: string): string {
  const d = new Date(iso)
  const date = new Intl.DateTimeFormat('en-IN', { timeZone: IST, day: 'numeric', month: 'short', year: 'numeric' }).format(d)
  const time = new Intl.DateTimeFormat('en-IN', { timeZone: IST, hour: 'numeric', minute: '2-digit', hour12: true }).format(d).toUpperCase()
  return `${date}, ${time}`
}

/** "12 Oct, 4:32 PM" — the timeline's short stamp. */
export function formatStamp(iso: string): string {
  const d = new Date(iso)
  const date = new Intl.DateTimeFormat('en-IN', { timeZone: IST, day: 'numeric', month: 'short' }).format(d)
  const time = new Intl.DateTimeFormat('en-IN', { timeZone: IST, hour: 'numeric', minute: '2-digit', hour12: true }).format(d).toUpperCase()
  return `${date}, ${time}`
}
