import { PART_CATEGORIES, type Part } from '@/types/catalogue'

/** Two parts can go on the same bike when either is universal or they share a bike. */
const shareABike = (a: Part, b: Part) =>
  a.compatibleBikeIds.length === 0 || b.compatibleBikeIds.length === 0 || a.compatibleBikeIds.some((id) => b.compatibleBikeIds.includes(id))

/**
 * "Related" = the rest of the build, never more of the same: parts from OTHER
 * categories only, at most one per category. Priority: fits the same bike →
 * in stock → catalogue category order.
 */
export function relatedParts(part: Part, all: Part[], limit = 4): Part[] {
  const rank = (p: Part) => [shareABike(part, p) ? 0 : 1, p.status === 'active' && p.stock > 0 ? 0 : 1, PART_CATEGORIES.indexOf(p.category)]
  const candidates = all
    .filter((p) => p.id !== part.id && p.category !== part.category && p.status !== 'retired')
    .sort((a, b) => {
      const ra = rank(a)
      const rb = rank(b)
      for (let i = 0; i < ra.length; i++) if (ra[i] !== rb[i]) return ra[i]! - rb[i]!
      return 0
    })
  const seen = new Set<string>()
  const out: Part[] = []
  for (const p of candidates) {
    if (seen.has(p.category)) continue
    seen.add(p.category)
    out.push(p)
    if (out.length === limit) break
  }
  return out
}
