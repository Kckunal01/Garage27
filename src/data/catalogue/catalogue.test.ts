import { describe, expect, it } from 'vitest'
import { localCatalogue } from '@/data/catalogue'
import { PROCEDURAL_VARIANTS } from '@/features/build/viewport/ProceduralBike'
import { getBikeBundle, isInteractive, validateConfiguration, createDefaultConfiguration } from '@/features/build/engine'
import { BUILD_CATEGORIES, PART_CATEGORIES } from '@/types/catalogue'
import { BUILD_ZONES } from '@/data/catalogue'
import { isZoneAvailable, unzonedSlots } from '@/features/build/zones'

/**
 * Catalogue QA gate — the "8. QA" step of adding a bike. Run before activating
 * any catalogue change: `npm run catalogue:check`.
 */
const { bikes, colours, options, parts, showcase } = localCatalogue

describe('catalogue integrity', () => {
  it('ids are unique', () => {
    for (const list of [bikes, colours, options, parts, showcase]) {
      const ids = list.map((x) => x.id)
      expect(new Set(ids).size).toBe(ids.length)
    }
  })

  for (const bike of bikes.filter(isInteractive)) {
    describe(bike.name, () => {
      const bundle = getBikeBundle(localCatalogue, bike.id)!
      it('fixed (non-configurable) nodes are renderable and never also a slot', () => {
        for (const [node, variant] of Object.entries(bike.model3d?.fixedNodes ?? {})) {
          expect(PROCEDURAL_VARIANTS, node).toContain(variant)
          expect(bike.slots.some((sl) => `bike.${sl.id}` === node), node).toBe(false)
        }
      })

      it('has an active default colour', () => {
        expect(bundle.colours.some((c) => c.id === bike.defaultColourId && c.status === 'active')).toBe(true)
      })
      it('every slot has a valid default and a hotspot', () => {
        for (const slot of bike.slots) {
          expect(BUILD_CATEGORIES).toContain(slot.category)
          const def = bundle.options.find((o) => o.id === slot.defaultOptionId)
          expect(def, slot.id).toBeDefined()
          expect(def!.slot).toBe(slot.id)
          expect(bike.hotspots.some((h) => h.slot === slot.id), `hotspot for ${slot.id}`).toBe(true)
        }
        expect(validateConfiguration(createDefaultConfiguration(bundle), bundle)).toEqual([])
      })
      it('every option maps to a real slot, renderable asset, stable nodes and known rule targets', () => {
        // Rules may reference options another vehicle has — inert here, but they must exist.
        const ids = new Set(options.map((o) => o.id))
        for (const o of bundle.options) {
          const slot = bike.slots.find((s) => s.id === o.slot)
          expect(slot, o.id).toBeDefined()
          expect(slot!.category).toBe(o.category)
          if (o.modelAsset.kind === 'procedural') expect(PROCEDURAL_VARIANTS, o.id).toContain(o.modelAsset.variant)
          if (o.modelAsset.kind === 'procedural') expect(bike.model3d?.kind, `${o.id} is procedural but ${bike.id} is not`).toBe('procedural')
          expect(o.affectedNodes.length, `${o.id} affectedNodes`).toBeGreaterThan(0)
          for (const n of o.affectedNodes) expect(n, o.id).toMatch(/^bike\.[a-zA-Z]+/)
          for (const r of [...(o.requires ?? []), ...(o.excludes ?? [])]) expect(ids.has(r), `${o.id} → ${r}`).toBe(true)
          if (o.partId) expect(parts.some((p) => p.id === o.partId), o.partId).toBe(true)
        }
      })
    })
  }

  it('every slot on an interactive vehicle belongs to a build zone (or it could never be edited)', () => {
    for (const bike of bikes.filter(isInteractive)) {
      const bundle = getBikeBundle(localCatalogue, bike.id)!
      expect(unzonedSlots(bundle), bike.id).toEqual([])
      expect(BUILD_ZONES.some((z) => z.rail && isZoneAvailable(z, bundle)), bike.id).toBe(true)
    }
    const ids = BUILD_ZONES.flatMap((z) => z.slots)
    expect(new Set(ids).size, 'a slot id may belong to only one zone').toBe(ids.length)
  })

  it('product-page copy is complete where present (3–4 benefits, a headline, no empty spec rows)', () => {
    for (const p of parts) {
      if (!p.page) continue
      expect(p.page.headline.length, p.slug).toBeGreaterThan(0)
      expect(p.page.benefits.length, p.slug).toBeGreaterThanOrEqual(3)
      expect(p.page.benefits.length, p.slug).toBeLessThanOrEqual(4)
      for (const s of p.page.specs ?? []) expect(s.label && s.value, `${p.slug} spec`).toBeTruthy()
    }
  })

  it('no part slug collides with a category page (/parts/<category>)', () => {
    for (const p of parts) expect(PART_CATEGORIES as readonly string[], p.slug).not.toContain(p.slug)
  })

  it('parts reference real bikes and categories, with valid prices', () => {
    for (const p of parts) {
      expect(PART_CATEGORIES).toContain(p.category)
      expect(Number.isInteger(p.price) && p.price > 0).toBe(true)
      for (const b of p.compatibleBikeIds) expect(bikes.some((x) => x.id === b), `${p.id} → ${b}`).toBe(true)
    }
  })

  it('showcase numbers are unique and sequential', () => {
    const nums = showcase.map((s) => s.number).sort((a, b) => a - b)
    expect(nums).toEqual(nums.map((_, i) => i + 1))
  })
})
