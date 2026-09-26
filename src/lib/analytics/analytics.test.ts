import { describe, expect, it } from 'vitest'
import { scrub } from './index'

describe('analytics scrub', () => {
  it('drops PII keys and PII-looking values', () => {
    expect(
      scrub({ bike: 'bike-re-classic-350', email: 'a@b.co', customer_name: 'X', note: 'call 9876543210', value_band: '1L-2.5L', missing: undefined }),
    ).toEqual({ bike: 'bike-re-classic-350', value_band: '1L-2.5L' })
  })
})
