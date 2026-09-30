import { describe, expect, it } from 'vitest'
import { localCatalogue } from '@/data/catalogue'
import {
  applyColour,
  categoriesForBike,
  applyOption,
  createDefaultConfiguration,
  decodeConfiguration,
  encodeConfiguration,
  estimateBuild,
  getBikeBundle,
  INVALID_OPTION_MESSAGE,
  isInteractive,
  PRICING_RULES,
  sanitizeConfiguration,
  validateConfiguration,
} from './engine'

const bundle = getBikeBundle(localCatalogue, 'bike-re-classic-350')!
const opt = (id: string) => bundle.options.find((o) => o.id === id)!

describe('build engine — vertical slice', () => {
  it('initialises defaults for every slot and a valid colour', () => {
    const config = createDefaultConfiguration(bundle)
    expect(config.colourId).toBe('col-classic-gunmetal')
    expect(Object.keys(config.components)).toHaveLength(bundle.bike.slots.length)
    expect(validateConfiguration(config, bundle)).toEqual([])
  })

  it('base estimate equals the bike base price', () => {
    const est = estimateBuild(createDefaultConfiguration(bundle), bundle)
    expect(est.total).toBe(bundle.bike.basePrice!)
    expect(est.modifiedSlots).toBe(0)
  })

  it('colour + option deltas + bay charge update the estimate', () => {
    let config = createDefaultConfiguration(bundle)
    config = applyColour(config, 'col-classic-oxblood', bundle)!
    const { config: next, result } = applyOption(config, opt('opt-headlight-chrome-7'), bundle)
    expect(result.ok).toBe(true)
    const est = estimateBuild(next, bundle)
    expect(est.total).toBe(
      bundle.bike.basePrice! + 1_200_000 + 850_000 + PRICING_RULES.bayChargePerModifiedSlot,
    )
  })

  it('blocks an option whose requirement is missing, without mutating state', () => {
    const config = createDefaultConfiguration(bundle)
    const { config: after, result } = applyOption(config, opt('opt-bar-clipon'), bundle)
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.message).toBe(INVALID_OPTION_MESSAGE)
      expect(result.conflictingOptionIds).toContain('opt-seat-solo')
    }
    expect(after).toBe(config)
  })

  it('allows the requirement chain in the right order and protects dependants', () => {
    let config = createDefaultConfiguration(bundle)
    config = applyOption(config, opt('opt-seat-solo'), bundle).config
    const clip = applyOption(config, opt('opt-bar-clipon'), bundle)
    expect(clip.result.ok).toBe(true)
    // Swapping the seat away would orphan the clip-ons.
    const swap = applyOption(clip.config, opt('opt-seat-bench'), bundle)
    expect(swap.result.ok).toBe(false)
  })

  it('enforces exclusions in both directions', () => {
    let config = createDefaultConfiguration(bundle)
    config = applyOption(config, opt('opt-luggage-rack'), bundle).config
    expect(applyOption(config, opt('opt-fender-bobbed'), bundle).result.ok).toBe(false)
    expect(applyOption(config, opt('opt-seat-solo'), bundle).result.ok).toBe(false)
  })

  it('refuses coming-soon options and foreign-bike options', () => {
    const config = createDefaultConfiguration(bundle)
    expect(applyOption(config, opt('opt-fender-flat-track'), bundle).result.ok).toBe(false)
    expect(applyOption(config, { ...opt('opt-headlight-caged'), compatibleBikeIds: ['bike-jawa-42'] }, bundle).result.ok).toBe(false)
  })

  it('sanitises tampered drafts back to a valid build', () => {
    const tampered = {
      bikeId: bundle.bike.id,
      colourId: 'col-nope',
      components: { headlight: 'opt-headlight-caged', handlebar: 'opt-bar-clipon', ghost: 'x' },
    }
    const clean = sanitizeConfiguration(tampered, bundle)
    expect(validateConfiguration(clean, bundle)).toEqual([])
  })

  it('round-trips share codes', () => {
    const config = createDefaultConfiguration(bundle)
    expect(decodeConfiguration(encodeConfiguration(config))).toEqual(config)
    expect(decodeConfiguration('%%%')).toBeNull()
  })

  it('every showcase preset is a valid build', () => {
    for (const build of localCatalogue.showcase) {
      if (!build.preset) continue
      const b = getBikeBundle(localCatalogue, build.preset.bikeId)!
      expect(validateConfiguration(build.preset, b), build.name).toEqual([])
    }
  })

  it('only interactive bikes open the 3D editor', () => {
    expect(isInteractive(bundle.bike)).toBe(true)
    expect(isInteractive(getBikeBundle(localCatalogue, 'bike-yezdi-roadster')!.bike)).toBe(false)
  })
})

describe('multi-vehicle compatibility (derived from catalogue data)', () => {
  const classic = getBikeBundle(localCatalogue, 'bike-re-classic-350')!
  const jawa = getBikeBundle(localCatalogue, 'bike-jawa-42')!
  const ids = (b: typeof classic) => new Set(b.options.map((o) => o.id))

  it('each vehicle only exposes options listed as compatible AND whose slot it has', () => {
    for (const b of [classic, jawa]) {
      for (const o of b.options) {
        expect(o.compatibleBikeIds, o.id).toContain(b.bike.id)
        expect(b.bike.slots.some((s) => s.id === o.slot), o.id).toBe(true)
      }
    }
  })

  it('vehicles differ: shared upgrades appear on both, specific parts on one', () => {
    expect(ids(jawa).has('opt-seat-solo') && ids(classic).has('opt-seat-solo')).toBe(true)
    expect(ids(jawa).has('opt-bar-clipon')).toBe(false) // Classic-only
    expect(ids(classic).has('opt-jawa-seat-stock')).toBe(false) // Jawa-only
  })

  it('categories follow the vehicle\'s slots (Jawa has no BODY or LUGGAGE)', () => {
    expect(categoriesForBike(jawa.bike)).not.toContain('body')
    expect(categoriesForBike(jawa.bike)).not.toContain('luggage')
    expect(categoriesForBike(classic.bike)).toContain('body')
  })

  it('a Classic-only option is refused on the Jawa even if forced', () => {
    const cfg = createDefaultConfiguration(jawa)
    const clip = classic.options.find((o) => o.id === 'opt-bar-clipon')!
    expect(applyOption(cfg, clip, jawa).result.ok).toBe(false)
  })

  it('the same engine prices each vehicle from its own base + options', () => {
    let cfg = createDefaultConfiguration(jawa)
    expect(estimateBuild(cfg, jawa).total).toBe(jawa.bike.basePrice!)
    cfg = applyOption(cfg, jawa.options.find((o) => o.id === 'opt-seat-solo')!, jawa).config
    expect(estimateBuild(cfg, jawa).total).toBe(jawa.bike.basePrice! + 1_250_000 + PRICING_RULES.bayChargePerModifiedSlot)
  })
})
