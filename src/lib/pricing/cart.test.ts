import { describe, expect, it } from 'vitest'
import { localCatalogue } from '@/data/catalogue'
import { priceCart, SHIPPING_RULES } from './cart'
import { checkoutSchema, contactSchema } from '@/lib/validation/schemas'

const parts = localCatalogue.parts

describe('priceCart', () => {
  it('prices lines from the catalogue, merging duplicates', () => {
    const r = priceCart([{ partId: 'part-bar-end-mirrors', quantity: 1 }, { partId: 'part-bar-end-mirrors', quantity: 2 }], parts)
    expect(r.lines).toHaveLength(1)
    expect(r.lines[0]!.quantity).toBe(3)
    expect(r.subtotal).toBe(960_000)
    expect(r.shipping).toBe(0)
  })

  it('charges flat shipping under the threshold', () => {
    const r = priceCart([{ partId: 'part-tail-light-frenched', quantity: 1 }], parts)
    expect(r.shipping).toBe(SHIPPING_RULES.flat)
    expect(r.total).toBe(290_000 + SHIPPING_RULES.flat)
  })

  it('flags unknown and out-of-stock parts instead of pricing them', () => {
    const r = priceCart([{ partId: 'nope', quantity: 1 }, { partId: 'part-tank-badge', quantity: 1 }], parts)
    expect(r.lines).toHaveLength(0)
    expect(r.problems.map((p) => p.problem).sort()).toEqual(['insufficient-stock', 'unknown'])
  })
})

describe('schemas', () => {
  it('normalises Indian mobile numbers', () => {
    expect(contactSchema.parse({ name: 'Ravi', email: 'R@X.IN', phone: '98765 43210' })).toEqual({ name: 'Ravi', email: 'r@x.in', phone: '9876543210' })
    expect(contactSchema.safeParse({ name: 'Ravi', email: 'r@x.in', phone: '12345' }).success).toBe(false)
  })

  it('rejects filled honeypots', () => {
    const base = {
      items: [{ partId: 'a', quantity: 1 }],
      contact: { name: 'Ravi', email: 'r@x.in', phone: '9876543210' },
      address: { line1: '27 Workshop Lane', city: 'Pune', state: 'MH', pincode: '411001' },
    }
    expect(checkoutSchema.safeParse(base).success).toBe(true)
    expect(checkoutSchema.safeParse({ ...base, website: 'spam' }).success).toBe(false)
  })
})
