'use client'

import { useCallback, useEffect, useMemo, useReducer } from 'react'
import { track } from '@/lib/analytics'
import { valueBand } from '@/lib/pricing/money'
import type { BuildConfiguration, ComponentOption } from '@/types/catalogue'
import {
  applyColour,
  applyOption,
  createDefaultConfiguration,
  estimateBuild,
  getBikeBundle,
  isInteractive,
  sanitizeConfiguration,
  type BikeBundle,
  type BuildContext,
  type CompatibilityResult,
} from './engine'
import { firstZone, getZone, zoneSlots } from './zones'

export type BuildStage = 'bikes' | 'editor' | 'review' | 'preview'

interface State {
  stage: BuildStage
  bikeId: string | null
  config: BuildConfiguration | null
  /** Open build zone (TANK, FRONT…). */
  zone: string | null
  /** Slot that should visually "light up" (last touched). */
  litSlot: string | null
  /** Bumped on every change so the 3D lamp can re-pulse. */
  pulse: number
  blocked: { optionId: string; conflicts: string[]; reason: string } | null
}

type Action =
  | { type: 'pick-bike'; bundle: BikeBundle; config?: BuildConfiguration; stage?: BuildStage }
  | { type: 'reset-bikes' }
  | { type: 'colour'; config: BuildConfiguration }
  | { type: 'stage'; stage: BuildStage }
  | { type: 'zone'; zone: string | null; slot?: string | null }
  | { type: 'apply'; config: BuildConfiguration; slot: string }
  | { type: 'blocked'; optionId: string; conflicts: string[]; reason: string; slot: string }
  | { type: 'restore'; config: BuildConfiguration }

const initial: State = { stage: 'bikes', bikeId: null, config: null, zone: null, litSlot: null, pulse: 0, blocked: null }

function reducer(state: State, a: Action): State {
  switch (a.type) {
    case 'pick-bike': {
      const interactive = isInteractive(a.bundle.bike)
      return {
        ...initial,
        bikeId: a.bundle.bike.id,
        config: a.config ?? createDefaultConfiguration(a.bundle),
        stage: a.stage ?? (interactive ? 'editor' : 'preview'),
        zone: interactive ? firstZone(a.bundle) : null,
      }
    }
    case 'reset-bikes':
      return initial
    case 'colour':
      return { ...state, config: a.config, pulse: state.pulse + 1, litSlot: 'tank', blocked: null }
    case 'stage':
      return { ...state, stage: a.stage, blocked: null }
    case 'zone':
      return { ...state, zone: a.zone, litSlot: a.slot ?? state.litSlot, blocked: null }
    case 'apply':
      return { ...state, config: a.config, litSlot: a.slot, pulse: state.pulse + 1, blocked: null }
    case 'blocked':
      return { ...state, blocked: { optionId: a.optionId, conflicts: a.conflicts, reason: a.reason }, litSlot: a.slot }
    case 'restore':
      return { ...state, config: a.config }
  }
}

const draftKey = (bikeId: string) => `g27.build.draft.${bikeId}`
const LAST_KEY = 'g27.build.last'

export function readDraft(bikeId: string): Partial<BuildConfiguration> | null {
  try {
    const raw = localStorage.getItem(draftKey(bikeId))
    return raw ? (JSON.parse(raw) as Partial<BuildConfiguration>) : null
  } catch {
    return null
  }
}
export function readLastBikeId(): string | null {
  try {
    return localStorage.getItem(LAST_KEY)
  } catch {
    return null
  }
}

/**
 * Build bay state: one reducer drives both the mobile and desktop layouts.
 * Every mutation goes through the engine's compatibility check; drafts are
 * persisted locally as configuration JSON (never a screenshot).
 */
export function useBuildState(ctx: BuildContext) {
  const [state, dispatch] = useReducer(reducer, initial)
  const bundle = useMemo(() => (state.bikeId ? getBikeBundle(ctx, state.bikeId) : null), [ctx, state.bikeId])
  const estimate = useMemo(() => (bundle && state.config ? estimateBuild(state.config, bundle) : null), [bundle, state.config])

  // Persist drafts for logged-out visitors.
  useEffect(() => {
    if (!state.config || !state.bikeId || !bundle || !isInteractive(bundle.bike)) return
    try {
      localStorage.setItem(draftKey(state.bikeId), JSON.stringify(state.config))
      localStorage.setItem(LAST_KEY, state.bikeId)
    } catch {
      /* storage unavailable — build still works in memory */
    }
  }, [state.config, state.bikeId, bundle])

  const pickBike = useCallback(
    (bikeId: string, opts: { config?: Partial<BuildConfiguration> | null; stage?: BuildStage; source?: string } = {}) => {
      const b = getBikeBundle(ctx, bikeId)
      if (!b || b.bike.status === 'coming-soon' || b.bike.status === 'retired') return false
      const wanted = opts.config ?? (isInteractive(b.bike) ? readDraft(bikeId) : null)
      const config = wanted ? sanitizeConfiguration(wanted, b) : createDefaultConfiguration(b)
      dispatch({ type: 'pick-bike', bundle: b, config, stage: opts.stage })
      track('build_bike_selected', { bike: bikeId, interactive: isInteractive(b.bike), source: opts.source ?? 'picker' })
      return true
    },
    [ctx],
  )

  const selectColour = useCallback(
    (colourId: string) => {
      if (!bundle || !state.config) return
      const next = applyColour(state.config, colourId, bundle)
      if (!next) return
      dispatch({ type: 'colour', config: next })
      track('build_colour_selected', { bike: bundle.bike.id, colour: colourId })
      track('build_configuration_changed', { bike: bundle.bike.id, change: 'colour', value_band: valueBand(estimateBuild(next, bundle).total) })
    },
    [bundle, state.config],
  )

  const openZone = useCallback(
    (zoneId: string | null) => {
      const zone = getZone(zoneId)
      const slot = zone && bundle ? (zoneSlots(zone, bundle)[0]?.id ?? null) : null
      dispatch({ type: 'zone', zone: zone?.id ?? null, slot })
      if (zone) track('build_category_opened', { bike: bundle?.bike.id, category: zone.id })
    },
    [bundle],
  )

  const selectOption = useCallback(
    (option: ComponentOption): CompatibilityResult => {
      if (!bundle || !state.config) return { ok: false, message: '', reason: 'No bike', conflictingOptionIds: [] }
      const { config, result } = applyOption(state.config, option, bundle)
      if (!result.ok) {
        const conflictSlots = result.conflictingOptionIds.map((id) => bundle.options.find((o) => o.id === id)?.slot).filter((s): s is string => !!s)
        dispatch({ type: 'blocked', optionId: option.id, conflicts: conflictSlots, reason: result.reason, slot: option.slot })
        track('build_option_blocked', { bike: bundle.bike.id, option: option.id, slot: option.slot })
        return result
      }
      dispatch({ type: 'apply', config, slot: option.slot })
      track('build_option_selected', { bike: bundle.bike.id, category: option.category, slot: option.slot, option: option.id })
      track('build_configuration_changed', { bike: bundle.bike.id, change: option.slot, value_band: valueBand(estimateBuild(config, bundle).total) })
      return result
    },
    [bundle, state.config],
  )

  const setStage = useCallback((stage: BuildStage) => dispatch({ type: 'stage', stage }), [])
  const resetToBikes = useCallback(() => dispatch({ type: 'reset-bikes' }), [])
  const resetBuild = useCallback(() => {
    if (!bundle) return
    dispatch({ type: 'restore', config: createDefaultConfiguration(bundle) })
  }, [bundle])

  return { state, bundle, estimate, pickBike, selectColour, openZone, selectOption, setStage, resetToBikes, resetBuild }
}
