'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useRef } from 'react'
import { GarageButton } from '@/components/garage-ui/GarageButton'
import { useToast } from '@/components/garage-ui/Toast'
import { track } from '@/lib/analytics'
import { BUILD_ZONES } from '@/data/catalogue'
import { formatINR } from '@/lib/pricing/money'
import type { BikeColour, Bike, ComponentOption, ShowcaseBuild } from '@/types/catalogue'
import { BikePicker } from './BikePicker'
import { BuildEnvironment } from './BuildEnvironment'
import { BuildReview } from './BuildReview'
import { CategoryRail } from './CategoryRail'
import { ColourPicker } from './ColourPicker'
import { createDefaultConfiguration, decodeConfiguration, INVALID_OPTION_MESSAGE, isInteractive, type BuildContext } from './engine'
import { OptionTray } from './OptionTray'
import { readLastBikeId, useBuildState } from './useBuildState'
import { BuildViewport } from './viewport/BuildViewport'
import { getZone, zoneForSlot, zoneSlots } from './zones'

interface Props {
  bikes: Bike[]
  colours: BikeColour[]
  options: ComponentOption[]
  presets: Pick<ShowcaseBuild, 'id' | 'name' | 'preset'>[]
}

/**
 * SELECT BIKE → EDITOR (zone → colour / option → live 3D + price) → REVIEW → QUOTE.
 * Everything happens inside the Build environment photograph; the 3D bike
 * stands on its floor. Zones, options, colours and prices all come from the
 * catalogue — this file never names a bike, part or price.
 */
/** The bay's own route (the Build landing lives at /build). */
const BAY = '/build/visualiser'

export function BuildBay({ bikes, colours, options, presets }: Props) {
  const ctx: BuildContext = useMemo(() => ({ bikes, colours, options }), [bikes, colours, options])
  const { state, bundle, estimate, pickBike, selectColour, openZone, selectOption, setStage, resetToBikes, resetBuild } = useBuildState(ctx)
  const router = useRouter()
  const params = useSearchParams()
  const toast = useToast()
  const booted = useRef(false)

  // Entry points: ?preset= (garage showcase), ?c= (shared build), ?saved=1, ?bike= (+ &colour= from the Build landing)
  useEffect(() => {
    if (booted.current) return
    booted.current = true
    track('build_started', { entry: params.get('preset') ? 'preset' : params.get('c') ? 'share' : params.get('bike') ? 'bike' : 'direct' })
    const presetId = params.get('preset')
    const code = params.get('c')
    const bikeParam = params.get('bike')
    if (presetId) {
      const p = presets.find((x) => x.id === presetId)
      if (p?.preset && pickBike(p.preset.bikeId, { config: p.preset, stage: 'editor', source: 'preset' })) {
        toast({ tone: 'info', title: `BUILD ${p.name} LOADED`, body: 'Keep what you love. Change the rest.' })
        return
      }
    }
    if (code) {
      const decoded = decodeConfiguration(code)
      if (decoded?.bikeId && pickBike(decoded.bikeId, { config: decoded, stage: 'editor', source: 'share' })) return
      toast({ tone: 'error', title: 'THAT BUILD LINK MISFIRED.', body: 'Starting you fresh.' })
    }
    if (params.get('saved')) {
      const last = readLastBikeId()
      if (last && pickBike(last, { stage: 'editor', source: 'saved' })) return
      toast({ tone: 'info', title: 'NO SAVED BUILD YET.', body: 'Pick a bike to start one.' })
    }
    if (bikeParam) pickBike(bikeParam, { source: params.get('colour') ? 'landing' : 'link', colourId: params.get('colour') ?? undefined })
  }, [params, presets, pickBike, toast])

  // Keep the URL shareable as the visitor moves between bikes.
  useEffect(() => {
    if (!booted.current) return
    const want = state.bikeId ? `${BAY}?bike=${state.bikeId}` : BAY
    const current = `${window.location.pathname}${window.location.search}`
    if (current !== want && !(state.bikeId === null && current === BAY)) router.replace(want, { scroll: false })
  }, [state.bikeId, router])

  // Scroll to top on stage change (mobile especially).
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [state.stage])

  const onPick = (id: string) => pickBike(id)

  if (!bundle || !state.config || !estimate || state.stage === 'bikes') {
    return (
      <BuildEnvironment stage="picker">
        <BikePicker bikes={bikes} onPick={onPick} />
      </BuildEnvironment>
    )
  }

  if (state.stage === 'review' || state.stage === 'preview') {
    return (
      <BuildEnvironment stage="review" title={false}>
        <div className="bbay__sheet">
          <BuildReview
            bundle={bundle}
            config={state.config}
            estimate={estimate}
            previewOnly={state.stage === 'preview'}
            onBack={() => (state.stage === 'preview' || !isInteractive(bundle.bike) ? resetToBikes() : setStage('editor'))}
          />
        </div>
      </BuildEnvironment>
    )
  }

  const config = state.config
  const zone = getZone(state.zone)
  const factory = createDefaultConfiguration(bundle)
  const modified = new Set<string>()
  for (const s of bundle.bike.slots) {
    if ((config.components[s.id] ?? null) !== s.defaultOptionId) {
      const z = zoneForSlot(s.id)
      if (z) modified.add(z.id)
    }
  }
  if (config.colourId !== factory.colourId) BUILD_ZONES.filter((z) => z.paint).forEach((z) => modified.add(z.id))
  const hotspotLabels: Record<string, string> = {}
  for (const h of bundle.bike.hotspots) {
    const z = zoneForSlot(h.slot)
    if (z) hotspotLabels[h.slot] = z.label
  }
  const activeSlots = zone ? zoneSlots(zone, bundle).map((s) => s.id) : []
  const paint = bundle.colours.find((c) => c.id === config.colourId)?.material ?? { color: '#333', metalness: 0.4, roughness: 0.4 }

  const choose = (o: ComponentOption) => {
    const r = selectOption(o)
    if (!r.ok) toast({ tone: 'error', title: INVALID_OPTION_MESSAGE, body: r.reason })
  }

  const vehicle = (
    <p className="bbay__vehicle">
      <span>
        {bundle.bike.brand.toUpperCase()} · <strong>{bundle.bike.name}</strong>
      </span>
      <button type="button" className="bbay__change" onClick={resetToBikes}>
        CHANGE BIKE
      </button>
    </p>
  )

  return (
    <BuildEnvironment stage="editor" head={vehicle}>
      <div className="bbay__stage">
        <div className="bbay__rail">
          <CategoryRail bundle={bundle} active={zone?.id ?? null} modified={modified} onPick={openZone} />
        </div>
        <div className="bbay__viewport">
          <BuildViewport
            bike={bundle.bike}
            config={config}
            options={bundle.options}
            paint={paint}
            activeSlots={activeSlots}
            hotspotLabels={hotspotLabels}
            litSlot={state.litSlot}
            pulse={state.pulse}
            conflictSlots={state.blocked?.conflicts ?? []}
            showHotspots
            onHotspot={(slot) => openZone(zoneForSlot(slot)?.id ?? null)}
            fallbackAction={
              <GarageButton variant="amber" size="sm" onClick={() => setStage('review')}>
                REVIEW & REQUEST QUOTE
              </GarageButton>
            }
          />
        </div>
      </div>

      <section className="bbay__panel" aria-labelledby="bbay-zone">
        {zone && (
          <header className="bbay__panel-head">
            <h2 id="bbay-zone" className="bbay__zone">
              {zone.label}
            </h2>
            <p className="bbay__zone-desc">{zone.descriptor}</p>
          </header>
        )}
        <div className="bbay__panel-body">
          {zone && <OptionTray bundle={bundle} config={config} zone={zone} blocked={state.blocked} onSelect={choose} />}
          {zone?.paint && <ColourPicker colours={bundle.colours} value={config.colourId} onChange={selectColour} />}
          {zone && zoneSlots(zone, bundle).length === 0 && <p className="bbay__note">PAINT ONLY — NO {zone.label} PARTS FOR THE {bundle.bike.name} IN THE CATALOGUE YET.</p>}
        </div>
        <footer className="bbay__panel-foot">
          <div className="bbay__price">
            <span className="bbay__price-label">ESTIMATED BUILD VALUE</span>
            <span className="bbay__price-total" aria-live="polite" aria-atomic="true">
              {formatINR(estimate.total)}
            </span>
          </div>
          <button type="button" className="bbay__reset" onClick={resetBuild}>
            RESET
          </button>
          <GarageButton variant="ignite" size="sm" onClick={() => setStage('review')}>
            REVIEW BUILD
          </GarageButton>
        </footer>
      </section>
    </BuildEnvironment>
  )
}
