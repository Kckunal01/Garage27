import { describe, expect, it } from 'vitest'
import { localCatalogue } from '@/data/catalogue'
import { breakdown, CHARGE_RULES, chargeRateFor, PAYMENT_RULES, priceCart as price, SHIPPING_RULES, type CartLineInput, type PaymentMethod } from './cart'
import { checkoutSchema, contactSchema } from '@/lib/validation/schemas'

const parts = localCatalogue.parts
const bikes = localCatalogue.bikes
const priceCart = (items: CartLineInput[], p = parts, method?: PaymentMethod) => price(items, p, bikes, method)

describe('priceCart', () => {
  it('prices lines from the catalogue, merging duplicates', () => {
    const r = priceCart([{ partId: 'part-bar-end-mirrors', quantity: 1 }, { partId: 'part-bar-end-mirrors', quantity: 2 }], parts)
    expect(r.lines).toHaveLength(1)
    expect(r.lines[0]!.quantity).toBe(3)
    expect(r.subtotal).toBe(960_000)
    expect(r.shipping).toBe(0)
  })

  it('total = products + 2.5% platform fee + charge + shipping', () => {
    const r = priceCart([{ partId: 'part-tail-light-frenched', quantity: 1 }], parts)
    expect(r.platformFee).toBe(7_250) // 2.5% of ₹2,900 = ₹72.50
    expect(r.charge).toBe(52_200) // 18% of ₹2,900
    expect(r.shipping).toBe(0) // ₹2,900 ≥ ₹1,999
    expect(r.total).toBe(290_000 + 7_250 + 52_200)
  })

  // Terms & Conditions 08–10
  it('ships free from ₹1,999 and charges ₹499 below it', () => {
    expect(SHIPPING_RULES.flat).toBe(49_900)
    expect(breakdown([{ price: 199_900, quantity: 1, chargeBp: 1_800 }]).shipping).toBe(0)
    expect(breakdown([{ price: 199_800, quantity: 1, chargeBp: 1_800 }]).shipping).toBe(49_900)
  })
  it('platform fee is 2.5% of the products, rounded to the paisa (₹1,999 → ₹49.98)', () => {
    expect(CHARGE_RULES.platformFeeBp).toBe(250)
    expect(breakdown([{ price: 199_900, quantity: 1, chargeBp: 1_800 }]).platformFee).toBe(4_998)
  })
  it('charge is on the product price only, per line', () => {
    const b = breakdown([{ price: 100_000, quantity: 2, chargeBp: 1_800 }, { price: 100_000, quantity: 1, chargeBp: 4_000 }], 'cod')
    expect(b.charge).toBe(36_000 + 40_000)
    expect(b.total).toBe(300_000 + 7_500 + 76_000 + 0 + PAYMENT_RULES.codFee)
  })
  it('40% only for bike-specific parts that fit a bike above 350cc; universal and ≤350cc parts are 18%', () => {
    expect(chargeRateFor({ compatibleBikeIds: [] }, bikes)).toBe(CHARGE_RULES.standardBp)
    expect(chargeRateFor({ compatibleBikeIds: ['bike-re-classic-350'] }, bikes)).toBe(1_800)
    expect(chargeRateFor({ compatibleBikeIds: ['bike-re-interceptor-650'] }, bikes)).toBe(4_000)
    expect(chargeRateFor({ compatibleBikeIds: ['bike-triumph-speed-400'] }, bikes)).toBe(4_000)
    expect(chargeRateFor({ compatibleBikeIds: ['bike-jawa-42'] }, bikes)).toBe(1_800)
  })
  it('every catalogue bike records its displacement', () => {
    expect(bikes.filter((b) => !b.engineCc).map((b) => b.id)).toEqual([])
  })

  it('flags unknown and out-of-stock parts instead of pricing them', () => {
    const r = priceCart([{ partId: 'nope', quantity: 1 }, { partId: 'part-tank-badge', quantity: 1 }], parts)
    expect(r.lines).toHaveLength(0)
    expect(r.problems.map((p) => p.problem).sort()).toEqual(['insufficient-stock', 'unknown'])
  })
})

describe('payment method pricing (server-side)', () => {
  const items = [{ partId: 'part-headlight-7-chrome', quantity: 1 }, { partId: 'part-knee-pads', quantity: 1 }]
  it('online: total = items + fee + charge + shipping, no COD fee', () => {
    const r = priceCart(items, parts, 'online')
    expect(r.codFee).toBe(0)
    expect(r.total).toBe(r.subtotal + r.platformFee + r.charge + r.shipping)
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
