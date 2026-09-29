import { describe, expect, it } from 'vitest'
import type { CartLine } from './cart-store'
import { mergeLine, removeLine, setLineQuantity } from './selection'

const line = (partId: string, quantity = 1): CartLine => ({ partId, quantity, name: partId, slug: partId, price: 100_000, category: 'body' })

describe('checkout selection', () => {
  it('appends new parts in order', () => {
    const s = mergeLine(mergeLine([line('a')], line('b')), line('c'))
    expect(s.map((l) => l.partId)).toEqual(['a', 'b', 'c'])
  })
  it('the same part again raises its quantity (no duplicate line)', () => {
    const s = mergeLine([line('a'), line('b')], line('a'))
    expect(s).toHaveLength(2)
    expect(s.find((l) => l.partId === 'a')!.quantity).toBe(2)
  })
  it('caps quantity at the per-line maximum', () => {
    expect(mergeLine([line('a', 9)], line('a', 5))[0]!.quantity).toBe(10)
    expect(setLineQuantity([line('a')], 'a', 0)[0]!.quantity).toBe(1)
  })
  it('removes a line', () => {
    expect(removeLine([line('a'), line('b')], 'a').map((l) => l.partId)).toEqual(['b'])
  })
})
