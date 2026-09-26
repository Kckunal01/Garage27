'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { SHIPPING_RULES } from '@/lib/pricing/cart'

export interface CartLine {
  partId: string
  quantity: number
  /** Display snapshot only — the server re-prices every checkout. */
  name: string
  slug: string
  price: number
  category: string
}

interface CartApi {
  lines: CartLine[]
  ready: boolean
  count: number
  subtotal: number
  add(line: Omit<CartLine, 'quantity'>, quantity?: number): void
  setQuantity(partId: string, quantity: number): void
  remove(partId: string): void
  clear(): void
}

const KEY = 'g27.cart.v1'
const CartContext = createContext<CartApi | null>(null)

function read(): CartLine[] {
  try {
    const raw = localStorage.getItem(KEY)
    const parsed = raw ? (JSON.parse(raw) as CartLine[]) : []
    return Array.isArray(parsed) ? parsed.filter((l) => l && typeof l.partId === 'string' && l.quantity > 0) : []
  } catch {
    return []
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // Hydrate from storage after mount (storage is unavailable during SSR).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLines(read())
    setReady(true)
    const onStorage = (e: StorageEvent) => e.key === KEY && setLines(read())
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  useEffect(() => {
    if (!ready) return
    try {
      localStorage.setItem(KEY, JSON.stringify(lines))
    } catch {
      /* private mode / quota — cart still works for this tab */
    }
  }, [lines, ready])

  const clamp = (n: number) => Math.max(1, Math.min(SHIPPING_RULES.maxQtyPerLine, Math.floor(n)))

  const add = useCallback<CartApi['add']>((line, quantity = 1) => {
    setLines((prev) => {
      const existing = prev.find((l) => l.partId === line.partId)
      if (existing) return prev.map((l) => (l.partId === line.partId ? { ...l, ...line, quantity: clamp(l.quantity + quantity) } : l))
      return [...prev, { ...line, quantity: clamp(quantity) }]
    })
  }, [])
  const setQuantity = useCallback((partId: string, quantity: number) => {
    setLines((prev) => prev.map((l) => (l.partId === partId ? { ...l, quantity: clamp(quantity) } : l)))
  }, [])
  const remove = useCallback((partId: string) => setLines((prev) => prev.filter((l) => l.partId !== partId)), [])
  const clear = useCallback(() => setLines([]), [])

  const api = useMemo<CartApi>(
    () => ({
      lines,
      ready,
      count: lines.reduce((s, l) => s + l.quantity, 0),
      subtotal: lines.reduce((s, l) => s + l.price * l.quantity, 0),
      add,
      setQuantity,
      remove,
      clear,
    }),
    [lines, ready, add, setQuantity, remove, clear],
  )
  return <CartContext.Provider value={api}>{children}</CartContext.Provider>
}

export function useCart(): CartApi {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>')
  return ctx
}
