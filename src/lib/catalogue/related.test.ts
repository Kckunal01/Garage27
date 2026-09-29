import { describe, expect, it } from 'vitest'
import { localCatalogue } from '@/data/catalogue'
import { relatedParts } from './related'

const { parts } = localCatalogue
const bySlug = (slug: string) => parts.find((p) => p.slug === slug)!

describe('related parts', () => {
  it('never includes the same category, the part itself, or two from one category', () => {
    for (const part of parts) {
      const rel = relatedParts(part, parts)
      expect(rel.length, part.slug).toBeGreaterThan(0)
      expect(rel.length).toBeLessThanOrEqual(4)
      expect(rel.some((p) => p.category === part.category || p.id === part.id), part.slug).toBe(false)
      expect(new Set(rel.map((p) => p.category)).size, part.slug).toBe(rel.length)
    }
  })

  it('prefers parts that fit the same bike', () => {
    // Knee pads fit Classic + Jawa; everything suggested should fit one of them (or be universal).
    const pads = bySlug('leather-tank-knee-pads')
    for (const p of relatedParts(pads, parts)) {
      const fits = p.compatibleBikeIds.length === 0 || p.compatibleBikeIds.some((id) => pads.compatibleBikeIds.includes(id))
      expect(fits, p.slug).toBe(true)
    }
  })

  it('puts in-stock parts ahead of sold-out ones that fit equally well', () => {
    // The brass badge is universal but sold out: every in-stock universal/shared-bike part ranks above it.
    const headlight = bySlug('7-inch-chrome-headlight-bucket')
    const rel = relatedParts(headlight, parts, 8)
    const badge = rel.findIndex((p) => p.slug === 'garage-27-brass-tank-badge')
    expect(badge).toBeGreaterThan(-1)
    rel.slice(0, badge).forEach((p) => expect(p.stock, p.slug).toBeGreaterThan(0))
  })
})
