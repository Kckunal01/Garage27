import { describe, expect, it } from 'vitest'
import { localCatalogue } from '@/data/catalogue'
import { discountOf } from './discount'

describe('discountOf', () => {
  it('discount = old − current; percent = (old − current) / old × 100', () => {
    expect(discountOf({ price: 199_900, compareAtPrice: 249_900 })).toEqual({ was: 249_900, amount: 50_000, percent: 20 })
  })
  it('no discount without a higher reference price', () => {
    expect(discountOf({ price: 100_000 })).toBeNull()
    expect(discountOf({ price: 100_000, compareAtPrice: 100_000 })).toBeNull()
  })
  it('about half the catalogue carries a reference price, at varied discounts, never above the selling price', () => {
    const parts = localCatalogue.parts
    const d = parts.map(discountOf).filter(Boolean)
    expect(d.length).toBe(Math.round(parts.length / 2))
    expect(new Set(d.map((x) => x!.percent)).size).toBe(d.length)
  })
})
