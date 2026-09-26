import type {
  Bike,
  BikeColour,
  BuildCategory,
  BuildConfiguration,
  CatalogueSnapshot,
  ComponentOption,
  Paise,
} from '@/types/catalogue'

/**
 * Build configuration engine. Pure functions only — shared by the browser
 * (instant estimate) and the quote route handler (authoritative re-check).
 */

export type BuildContext = Pick<CatalogueSnapshot, 'bikes' | 'colours' | 'options'>

export interface BikeBundle {
  bike: Bike
  colours: BikeColour[]
  options: ComponentOption[]
}

export const PRICING_RULES = {
  /** Bay labour applied once per slot changed from factory default. */
  bayChargePerModifiedSlot: 150_000 as Paise,
  currency: 'INR' as const,
  taxNote: 'Excl. GST. Final price confirmed in your quote.',
}

export const INVALID_OPTION_MESSAGE = "THIS OPTION DOESN'T FIT THIS BUILD."

export function getBikeBundle(ctx: BuildContext, bikeId: string): BikeBundle | null {
  const bike = ctx.bikes.find((b) => b.id === bikeId)
  if (!bike) return null
  return {
    bike,
    colours: ctx.colours.filter((c) => c.bikeId === bikeId),
    // Compatibility is derived from data: listed for this vehicle AND the
    // vehicle's model actually has the slot.
    options: ctx.options.filter((o) => o.compatibleBikeIds.includes(bikeId) && bike.slots.some((s) => s.id === o.slot)),
  }
}

/** Bike can open the interactive editor only when its data and model exist. */
export function isInteractive(bike: Bike): boolean {
  return bike.status === 'active' && !!bike.model3d && bike.slots.length > 0
}

export function slotsForCategory(bike: Bike, category: BuildCategory) {
  return bike.slots.filter((s) => s.category === category)
}

/** Only categories that have at least one slot on this bike are exposed. */
export function categoriesForBike(bike: Bike): BuildCategory[] {
  const seen = new Set<BuildCategory>()
  for (const s of bike.slots) seen.add(s.category)
  return [...seen]
}

export function createDefaultConfiguration(bundle: BikeBundle): BuildConfiguration {
  const colour =
    bundle.colours.find((c) => c.id === bundle.bike.defaultColourId && c.status === 'active') ??
    bundle.colours.find((c) => c.status === 'active')
  const components: BuildConfiguration['components'] = {}
  for (const slot of bundle.bike.slots) components[slot.id] = slot.defaultOptionId
  return { bikeId: bundle.bike.id, colourId: colour?.id ?? '', components }
}

export type CompatibilityResult =
  | { ok: true }
  | { ok: false; message: string; reason: string; conflictingOptionIds: string[] }

function selectedOptions(config: BuildConfiguration, bundle: BikeBundle, exceptSlot?: string) {
  const out: ComponentOption[] = []
  for (const [slot, optionId] of Object.entries(config.components)) {
    if (slot === exceptSlot || !optionId) continue
    const o = bundle.options.find((x) => x.id === optionId)
    if (o) out.push(o)
  }
  return out
}

/**
 * Before applying an option:
 * 1. bike compatibility  2. existing selections  3. requires / excludes.
 * Invalid combinations are reported, never silently overwritten.
 */
export function checkOption(config: BuildConfiguration, option: ComponentOption, bundle: BikeBundle): CompatibilityResult {
  const fail = (reason: string, ids: string[] = []): CompatibilityResult => ({
    ok: false,
    message: INVALID_OPTION_MESSAGE,
    reason,
    conflictingOptionIds: ids,
  })

  if (config.bikeId !== bundle.bike.id || !option.compatibleBikeIds.includes(bundle.bike.id)) return fail(`Doesn’t fit the ${bundle.bike.name}.`)
  if (option.status !== 'active') return fail('Still in the workshop — not available yet.')
  const slot = bundle.bike.slots.find((s) => s.id === option.slot)
  if (!slot) return fail('This bike has no slot for it.')

  const others = selectedOptions(config, bundle, option.slot)

  const excluded = others.filter((o) => option.excludes?.includes(o.id) || o.excludes?.includes(option.id))
  if (excluded.length) {
    return fail(`Clashes with ${excluded.map((o) => o.name).join(', ')}.`, excluded.map((o) => o.id))
  }

  const selectedIds = new Set(others.map((o) => o.id))
  const missing = (option.requires ?? []).filter((id) => !selectedIds.has(id))
  if (missing.length) {
    const names = missing.map((id) => bundle.options.find((o) => o.id === id)?.name ?? id)
    return fail(`Needs ${names.join(', ')} first.`, missing)
  }

  // Would removing the current occupant of this slot break another selection's requirement?
  const dependants = others.filter((o) => {
    const current = config.components[option.slot]
    return current && current !== option.id && o.requires?.includes(current)
  })
  if (dependants.length) {
    return fail(`${dependants.map((o) => o.name).join(', ')} depends on the current ${slot.label.toLowerCase()}.`, dependants.map((o) => o.id))
  }

  return { ok: true }
}

export function applyOption(config: BuildConfiguration, option: ComponentOption, bundle: BikeBundle) {
  const result = checkOption(config, option, bundle)
  if (!result.ok) return { config, result }
  return { config: { ...config, components: { ...config.components, [option.slot]: option.id } }, result }
}

export function applyColour(config: BuildConfiguration, colourId: string, bundle: BikeBundle): BuildConfiguration | null {
  const colour = bundle.colours.find((c) => c.id === colourId && c.status === 'active')
  if (!colour) return null
  return { ...config, colourId }
}

export interface ValidationIssue {
  slot?: string
  message: string
}

/** Validate a full configuration (used for restored drafts, presets and the server). */
export function validateConfiguration(config: BuildConfiguration, bundle: BikeBundle): ValidationIssue[] {
  const issues: ValidationIssue[] = []
  if (config.bikeId !== bundle.bike.id) issues.push({ message: 'Unknown bike.' })
  if (!bundle.colours.some((c) => c.id === config.colourId && c.status === 'active')) issues.push({ message: 'Unknown colour.' })

  const known = new Set(bundle.bike.slots.map((s) => s.id))
  for (const key of Object.keys(config.components)) if (!known.has(key)) issues.push({ slot: key, message: 'Unknown slot.' })

  for (const slot of bundle.bike.slots) {
    const id = config.components[slot.id]
    if (!id) {
      if (!slot.optional) issues.push({ slot: slot.id, message: 'Required slot is empty.' })
      continue
    }
    const option = bundle.options.find((o) => o.id === id)
    if (!option || option.slot !== slot.id) {
      issues.push({ slot: slot.id, message: 'Option does not belong to this slot.' })
      continue
    }
    if (option.status !== 'active') issues.push({ slot: slot.id, message: `${option.name} is not available.` })
    const others = selectedOptions(config, bundle, slot.id)
    const ids = new Set(others.map((o) => o.id))
    for (const r of option.requires ?? []) if (!ids.has(r)) issues.push({ slot: slot.id, message: `${option.name} requires ${r}.` })
    for (const e of option.excludes ?? []) if (ids.has(e)) issues.push({ slot: slot.id, message: `${option.name} excludes ${e}.` })
  }
  return issues
}

/**
 * Repair an untrusted configuration (localStorage draft, shared link, preset):
 * keep what is valid, fall back to defaults for the rest.
 */
export function sanitizeConfiguration(input: Partial<BuildConfiguration> | null | undefined, bundle: BikeBundle): BuildConfiguration {
  const base = createDefaultConfiguration(bundle)
  if (!input || input.bikeId !== bundle.bike.id) return base
  const colourOk = bundle.colours.some((c) => c.id === input.colourId && c.status === 'active')
  const config: BuildConfiguration = {
    ...base,
    colourId: colourOk ? input.colourId! : base.colourId,
    components: { ...base.components },
  }
  for (const slot of bundle.bike.slots) {
    const wanted = input.components?.[slot.id]
    const option = wanted ? bundle.options.find((o) => o.id === wanted && o.slot === slot.id && o.status === 'active') : undefined
    if (option) config.components[slot.id] = option.id
    else if (wanted === null && slot.optional) config.components[slot.id] = null
  }
  // Reset only the offending slots; if that still fails, fall back to factory.
  const issues = validateConfiguration(config, bundle)
  if (!issues.length) return config
  for (const issue of issues) if (issue.slot && issue.slot in base.components) config.components[issue.slot] = base.components[issue.slot]!
  return validateConfiguration(config, bundle).length ? base : config
}

export interface PriceLine {
  slot: string
  label: string
  optionId: string | null
  optionName: string
  delta: Paise
}

export interface BuildEstimate {
  base: Paise
  colour: { id: string; name: string; delta: Paise } | null
  lines: PriceLine[]
  bayCharge: Paise
  modifiedSlots: number
  total: Paise
  currency: 'INR'
}

/** base bike + colour delta + option deltas + applicable bay charges. */
export function estimateBuild(config: BuildConfiguration, bundle: BikeBundle): BuildEstimate {
  const colour = bundle.colours.find((c) => c.id === config.colourId) ?? null
  let modified = 0
  const lines: PriceLine[] = bundle.bike.slots.map((slot) => {
    const optionId = config.components[slot.id] ?? null
    const option = optionId ? bundle.options.find((o) => o.id === optionId) : undefined
    if ((optionId ?? null) !== slot.defaultOptionId) modified++
    return {
      slot: slot.id,
      label: slot.label,
      optionId,
      optionName: option?.name ?? 'NONE',
      delta: option?.priceDelta ?? 0,
    }
  })
  const bayCharge = modified * PRICING_RULES.bayChargePerModifiedSlot
  const total =
    bundle.bike.basePrice + (colour?.priceDelta ?? 0) + lines.reduce((sum, l) => sum + l.delta, 0) + bayCharge
  return {
    base: bundle.bike.basePrice,
    colour: colour ? { id: colour.id, name: colour.name, delta: colour.priceDelta } : null,
    lines,
    bayCharge,
    modifiedSlots: modified,
    total,
    currency: 'INR',
  }
}

/** Compact, URL-safe share code for a configuration (no PII). */
export function encodeConfiguration(config: BuildConfiguration): string {
  const json = JSON.stringify(config)
  const b64 = typeof btoa === 'function' ? btoa(json) : Buffer.from(json, 'utf8').toString('base64')
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export function decodeConfiguration(code: string): Partial<BuildConfiguration> | null {
  try {
    const b64 = code.replace(/-/g, '+').replace(/_/g, '/')
    const json = typeof atob === 'function' ? atob(b64) : Buffer.from(b64, 'base64').toString('utf8')
    const parsed = JSON.parse(json) as unknown
    if (!parsed || typeof parsed !== 'object') return null
    return parsed as Partial<BuildConfiguration>
  } catch {
    return null
  }
}
