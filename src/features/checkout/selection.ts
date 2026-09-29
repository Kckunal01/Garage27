import { SHIPPING_RULES } from '@/lib/pricing/cart'
import type { CartLine } from './cart-store'

/**
 * The checkout selection: what BUY NOW is buying. Kept apart from the cart so
 * BUY NOW can never overwrite or empty it. Lines carry a display snapshot;
 * the server re-prices every checkout by part id.
 *
 * Normal:   Parts → BUY NOW → checkout with that one part (a fresh selection).
 * Add-more: Checkout → "Want to add something?" sets the adding flag → Parts →
 *           BUY NOW → the part is appended to the existing selection.
 */
const SELECTION_KEY = 'g27.checkout.selection.v1'
const ADDING_KEY = 'g27.checkout.adding'
/** An unfinished "add another part" detour expires after this long. */
const ADDING_TTL_MS = 2 * 60 * 60 * 1000

const clampQty = (n: number) => Math.max(1, Math.min(SHIPPING_RULES.maxQtyPerLine, Math.floor(n)))

/** Append a line; the same part again raises its quantity instead of duplicating it. */
export function mergeLine(lines: CartLine[], line: CartLine): CartLine[] {
  const existing = lines.find((l) => l.partId === line.partId)
  if (!existing) return [...lines, { ...line, quantity: clampQty(line.quantity) }]
  return lines.map((l) => (l.partId === line.partId ? { ...l, ...line, quantity: clampQty(l.quantity + line.quantity) } : l))
}

export const setLineQuantity = (lines: CartLine[], partId: string, quantity: number) =>
  lines.map((l) => (l.partId === partId ? { ...l, quantity: clampQty(quantity) } : l))

export const removeLine = (lines: CartLine[], partId: string) => lines.filter((l) => l.partId !== partId)

export function readSelection(): CartLine[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(SELECTION_KEY) ?? '[]') as CartLine[]
    return Array.isArray(parsed) ? parsed.filter((l) => l && typeof l.partId === 'string' && l.quantity > 0) : []
  } catch {
    return []
  }
}

export function writeSelection(lines: CartLine[]) {
  try {
    if (lines.length) localStorage.setItem(SELECTION_KEY, JSON.stringify(lines))
    else localStorage.removeItem(SELECTION_KEY)
  } catch {
    /* storage unavailable — checkout still works for this page view */
  }
}

export const clearSelection = () => writeSelection([])

/** Start an "add another part" detour. */
export function startAdding() {
  try {
    sessionStorage.setItem(ADDING_KEY, String(Date.now()))
  } catch {
    /* ignore */
  }
}

/** Is an "add another part" detour in progress (and fresh)? */
export function isAdding(): boolean {
  try {
    const at = Number(sessionStorage.getItem(ADDING_KEY))
    return !!at && Date.now() - at < ADDING_TTL_MS && readSelection().length > 0
  } catch {
    return false
  }
}

/** Read and end the detour. */
export function consumeAdding(): boolean {
  const adding = isAdding()
  try {
    sessionStorage.removeItem(ADDING_KEY)
  } catch {
    /* ignore */
  }
  return adding
}

export function cancelAdding() {
  try {
    sessionStorage.removeItem(ADDING_KEY)
  } catch {
    /* ignore */
  }
}
