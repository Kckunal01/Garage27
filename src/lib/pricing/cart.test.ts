import { describe, expect, it } from 'vitest'
import { localCatalogue } from '@/data/catalogue'
import { breakdown, PAYMENT_RULES, PLATFORM_FEE_BP, PLATFORM_FEE_LABEL, priceCart as price, SHIPPING_RULES, type CartLineInput, type PaymentMethod } from './cart'
import { checkoutSchema, contactSchema } from '@/lib/validation/schemas'

const parts = localCatalogue.parts
const priceCart = (items: CartLineInput[], p = parts, method?: PaymentMethod) => price(items, p, method)

describe('priceCart', () => {
  it('prices lines from the catalogue, merging duplicates', () => {
    const r = priceCart([{ partId: 'part-bar-end-mirrors', quantity: 1 }, { partId: 'part-bar-end-mirrors', quantity: 2 }], parts)
    expect(r.lines).toHaveLength(1)
    expect(r.lines[0]!.quantity).toBe(3)
    expect(r.subtotal).toBe(960_000)
    expect(r.shipping).toBe(0)
  })

  it('total = products + 4% platform fee + shipping (no tax line)', () => {
    const r = priceCart([{ partId: 'part-tail-light-frenched', quantity: 1 }], parts)
    expect(r.platformFee).toBe(11_600) // 4% of ₹2,900 = ₹116
    expect(r.shipping).toBe(49_900) // ₹2,900 is not above ₹4,999
    expect(r.total).toBe(290_000 + 11_600 + 49_900)
    expect('charge' in r).toBe(false)
  })

  // Terms & Conditions 08 and 10
  it('ships free above ₹4,999 and charges ₹499 otherwise', () => {
    expect(SHIPPING_RULES.flat).toBe(49_900)
    expect(breakdown([{ price: 500_000, quantity: 1 }]).shipping).toBe(0)
    expect(breakdown([{ price: 499_900, quantity: 1 }]).shipping).toBe(49_900)
  })
  it('platform fee is 4% of the products, rounded to the paisa (₹1,999 → ₹79.96)', () => {
    expect(PLATFORM_FEE_BP).toBe(400)
    expect(PLATFORM_FEE_LABEL).toBe('4%')
    expect(breakdown([{ price: 199_900, quantity: 1 }]).platformFee).toBe(7_996)
  })
  it('cod adds ₹500 on top of products + fee + shipping', () => {
    const b = breakdown([{ price: 100_000, quantity: 3 }], 'cod')
    expect(b.total).toBe(300_000 + 12_000 + 49_900 + PAYMENT_RULES.codFee)
  })
  it('charges the current price, never the crossed-out reference price', () => {
    const part = parts.find((p) => p.compareAtPrice)!
    const r = priceCart([{ partId: part.id, quantity: 1 }], parts)
    expect(r.subtotal).toBe(part.price)
    expect(part.compareAtPrice!).toBeGreaterThan(part.price)
  })

  it('flags unknown and out-of-stock parts instead of pricing them', () => {
    const r = priceCart([{ partId: 'nope', quantity: 1 }, { partId: 'part-tank-badge', quantity: 1 }], parts)
    expect(r.lines).toHaveLength(0)
    expect(r.problems.map((p) => p.problem).sort()).toEqual(['insufficient-stock', 'unknown'])
  })
})

describe('payment method pricing (server-side)', () => {
  const items = [{ partId: 'part-headlight-7-chrome', quantity: 1 }, { partId: 'part-knee-pads', quantity: 1 }]
  it('online: total = items + fee + shipping, no COD fee', () => {
    const r = priceCart(items, parts, 'online')
    expect(r.codFee).toBe(0)
    expect(r.total).toBe(r.subtotal + r.platformFee + r.shipping)
  })
  it('cod: total = online total + ₹500', () => {
    const online = priceCart(items, parts, 'online')
    const cod = priceCart(items, parts, 'cod')
    expect(PAYMENT_RULES.codFee).toBe(50_000)
    expect(cod.codFee).toBe(50_000)
    expect(cod.subtotal).toBe(online.subtotal) // product prices untouched
    expect(cod.total).toBe(online.total + 50_000)
  })
  it('defaults to online when no method is given', () => {
    expect(priceCart(items, parts).codFee).toBe(0)
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
    // payment method: defaults to online, only known values, and no client total is accepted
    expect(checkoutSchema.parse(base).paymentMethod).toBe('online')
    expect(checkoutSchema.parse({ ...base, paymentMethod: 'cod' }).paymentMethod).toBe('cod')
    expect(checkoutSchema.safeParse({ ...base, paymentMethod: 'crypto' }).success).toBe(false)
    expect('total' in checkoutSchema.parse({ ...base, total: 1 })).toBe(false)
  })
})
