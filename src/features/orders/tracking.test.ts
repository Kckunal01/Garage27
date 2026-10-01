import { describe, expect, it } from 'vitest'
import { estimatedDelivery, formatPlaced, formatWindow, headlineFor, timelineFor } from './tracking'

describe('timelineFor', () => {
  it('maps the recorded statuses onto the five steps', () => {
    expect(timelineFor('placed')).toEqual(['done', 'current', 'ahead', 'ahead', 'ahead'])
    expect(timelineFor('paid')).toEqual(['done', 'current', 'ahead', 'ahead', 'ahead'])
    expect(timelineFor('fulfilled')).toEqual(['done', 'done', 'current', 'ahead', 'ahead'])
    expect(timelineFor('awaiting_payment')).toEqual(['current', 'ahead', 'ahead', 'ahead', 'ahead'])
    expect(timelineFor('cancelled')).toEqual(['done', 'ahead', 'ahead', 'ahead', 'ahead'])
  })
})

describe('headlineFor', () => {
  it('only says "on its way" once the order is dispatched', () => {
    expect(headlineFor('fulfilled').lines.join(' ')).toBe('YOUR ORDER IS ON ITS WAY.')
    expect(headlineFor('paid').lines.join(' ')).not.toMatch(/ON ITS WAY/)
    expect(headlineFor('failed').sub).toBe('You have not been charged.')
  })
})

describe('estimatedDelivery', () => {
  it('is 5–12 business days from the order date (Shipping Policy), in India time', () => {
    // Thu 1 Oct 2026, 4:32 PM IST
    const w = estimatedDelivery('paid', '2026-10-01T11:02:00Z')!
    expect(w.from.toISOString().slice(0, 10)).toBe('2026-10-08') // Thu + 5 business days
    expect(w.to.toISOString().slice(0, 10)).toBe('2026-10-19') // + 12 business days
    expect(formatWindow(w)).toBe('8 – 19 Oct 2026')
  })
  it('uses the India date even when UTC is still the previous day', () => {
    // 11:30 PM UTC Fri 2 Oct = 5:00 AM IST Sat 3 Oct
    const w = estimatedDelivery('placed', '2026-10-02T23:30:00Z')!
    expect(w.from.toISOString().slice(0, 10)).toBe('2026-10-09')
  })
  it('is not shown without a placement time or for orders not being fulfilled', () => {
    expect(estimatedDelivery('paid', null)).toBeNull()
    expect(estimatedDelivery('awaiting_payment', '2026-10-01T11:02:00Z')).toBeNull()
    expect(estimatedDelivery('cancelled', '2026-10-01T11:02:00Z')).toBeNull()
  })
})

describe('formatting', () => {
  it('formats the placement time in India time', () => {
    expect(formatPlaced('2026-10-01T11:02:00Z')).toBe('1 Oct 2026, 4:32 PM')
  })
  it('spans months and years compactly', () => {
    expect(formatWindow({ from: new Date('2026-10-29T00:00:00Z'), to: new Date('2026-11-06T00:00:00Z') })).toBe('29 Oct – 6 Nov 2026')
    expect(formatWindow({ from: new Date('2026-12-29T00:00:00Z'), to: new Date('2027-01-08T00:00:00Z') })).toBe('29 Dec 2026 – 8 Jan 2027')
  })
})
