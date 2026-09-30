'use client'

import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useRef } from 'react'
import { BikeSilhouette } from '@/components/media/BikeSilhouette'
import { useToast } from '@/components/garage-ui/Toast'
import { track } from '@/lib/analytics'
import { BUILD_ZONES } from '@/data/catalogue'
import type { BikeColour, Bike, ComponentOption, ShowcaseBuild } from '@/types/catalogue'
import { BuildNav } from './BuildNav'
import { BuildSummary } from './BuildSummary'
import { ColourPicker } from './ColourPicker'
import { createDefaultConfiguration, decodeConfiguration, INVALID_OPTION_MESSAGE, isInteractive, type BuildContext } from './engine'
import { OptionTray } from './OptionTray'
import { readLastBikeId, useBuildState } from './useBuildState'
import { BuildViewport } from './viewport/BuildViewport'
import { getZone, isZoneAvailable, zoneForSlot, zoneSlots } from './zones'

/** The clean Build plate: the product frame's workshop floor. The bike is never in it. */
const BUILD_ENVIRONMENT = '/assets/environments/build-base.png'
/** The bay's own route (the Build landing lives at /build). */
const BAY = '/build/visualiser'
const LEGAL = ['NO LEGAL ISSUES.', 'NO INSURANCE ISSUES.', 'NO RESALE ISSUES.']

interface Props {
  bikes: Bike[]
  colours: BikeColour[]
  options: ComponentOption[]
  presets: Pick<ShowcaseBuild, 'id' | 'name' | 'preset'>[]
  /** Option id → real product photograph (resolved on the server; only files that exist). */
  optionImages: Record<string, string>
}

/** The compact editorial head: house line, positioning, the three statements. */
function VisualiserHead() {
  return (
    <header className="vz-head">
      <h1 className="vz-head__title">
        <span className="sr-only">Build visualizer: </span>BUILT DIFFERENT. ALWAYS.
      </h1>
      <p className="vz-head__sub">CUSTOMISE WITHOUT COMPROMISING.</p>
      <ul className="vz-head__legal">
        {LEGAL.map((l) => (
          <li key={l}>{l}</li>
        ))}
      </ul>
    </header>
  )
}

/** The product frame: the workshop floor, with the bike (3D or preview) standing on it. */
function ProductFrame({ children }: { children?: React.ReactNode }) {
  return (
    <div className="vz-frame">
      <Image className="vz-frame__floor" src={BUILD_ENVIRONMENT} alt="" fill sizes="(width < 768px) 100vw, 64vw" quality={75} preload />
      <div className="vz-frame__shade" aria-hidden="true" />
      {children}
    </div>
  )
}

/** Server-renderable shell while the bay hydrates (and the Suspense fallback). */
export function BuildBayShell() {
  return (
    <div className="vz">
      <VisualiserHead />
      <div className="vz__main">
        <div className="vz__stage">
          <ProductFrame />
        </div>
      </div>
    </div>
  )
}

/**
 * THE BUILD VISUALIZER — one selected bike: the product frame, its identity,
 * and a single panel that is the build navigation (BIKE, PARTS → the chosen
 * part's colour and products) → REVIEW BUILD → REQUEST BUILD. Bikes are
 * chosen on /build; zones, options, colours and prices all come from the
 * catalogue — this file never names a bike, part or price.
 */
export function BuildBay({ bikes, colours, options, presets, optionImages }: Props) {
  const ctx: BuildContext = useMemo(() => ({ bikes, colours, options }), [bikes, colours, options])
  const { state, bundle, pickBike, selectColour, openZone, selectOption } = useBuildState(ctx)
  const router = useRouter()
  const params = useSearchParams()
  const toast = useToast()
  const booted = useRef(false)

  // Entry points: ?preset= (garage showcase), ?c= (shared build), ?saved=1, ?bike= (+ &colour= from the Build landing).
  // Without a bike there is nothing to build here: choosing one happens on /build.
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
      toast({ tone: 'error', title: 'THAT BUILD LINK MISFIRED.', body: 'Choose your bike to start fresh.' })
    }
    if (params.get('saved')) {
      const last = readLastBikeId()
      if (last && pickBike(last, { stage: 'editor', source: 'saved' })) return
    }
    if (bikeParam && pickBike(bikeParam, { source: params.get('colour') ? 'landing' : 'link', colourId: params.get('colour') ?? undefined })) return
    router.replace('/build')
  }, [params, presets, pickBike, toast, router])

  // Keep the URL shareable as the visitor moves between bikes.
  useEffect(() => {
    if (!booted.current || !state.bikeId) return
    const want = `${BAY}?bike=${state.bikeId}`
    if (`${window.location.pathname}${window.location.search}` !== want) router.replace(want, { scroll: false })
  }, [state.bikeId, router])

  if (!bundle || !state.config) return <BuildBayShell />

  const config = state.config
  const interactive = isInteractive(bundle.bike)
  // The panel always shows a part: the chosen one, else the first this bike has.
  const zone = getZone(state.zone) ?? BUILD_ZONES.find((z) => z.rail && isZoneAvailable(z, bundle)) ?? null
  const factory = createDefaultConfiguration(bundle)
  const modified = new Set<string>()
  for (const s of bundle.bike.slots) {
    if ((config.components[s.id] ?? null) !== s.defaultOptionId) {
      const z = zoneForSlot(s.id)
      if (z) modified.add(z.id)
    }
  }
  if (config.colourId !== factory.colourId) BUILD_ZONES.filter((z) => z.paint).forEach((z) => modified.add(z.id))
  const activeSlots = zone ? zoneSlots(zone, bundle).map((s) => s.id) : []
  const colour = bundle.colours.find((c) => c.id === config.colourId)
  const paint = colour?.material ?? { color: '#333', metalness: 0.4, roughness: 0.4 }

  const choose = (o: ComponentOption) => {
    const r = selectOption(o)
    if (!r.ok) toast({ tone: 'error', title: INVALID_OPTION_MESSAGE, body: r.reason })
  }

  return (
    <div className="vz">
      <VisualiserHead />
      <div className="vz__main">
        <div className="vz__stage">
          <ProductFrame>
            {interactive ? (
              <BuildViewport
                bike={bundle.bike}
                config={config}
                options={bundle.options}
                paint={paint}
                activeSlots={activeSlots}
                litSlot={state.litSlot}
                pulse={state.pulse}
                fallbackAction={
                  <a className="vz-link" href="#bsum-title">
                    REVIEW &amp; REQUEST
                  </a>
                }
              />
            ) : (
              <div className="vz-preview">
                <BikeSilhouette className="vz-preview__bike" silhouette={bundle.bike.silhouette} paint={colour?.swatch} title={`Preview of the ${bundle.bike.brand} ${bundle.bike.model}`} />
                <p className="vz-preview__note">INTERACTIVE 3D FOR THIS BIKE IS STILL IN THE WORKSHOP</p>
              </div>
            )}
          </ProductFrame>
          <p className="vz-id">
            <span className="vz-id__brand">{bundle.bike.brand.toUpperCase()}</span>
            <span className="vz-id__model">{bundle.bike.name}</span>
          </p>
        </div>

        <aside className="vz__panel" aria-label="Build controls">
          <BuildNav bikes={bikes} bundle={bundle} active={zone?.id ?? null} modified={modified} onBike={(id) => pickBike(id)} onZone={openZone} />
          {interactive && zone ? (
            <section className="vz-zone" aria-labelledby="vz-zone-title">
              <header className="vz-zone__head">
                <h2 id="vz-zone-title" className="vz-zone__title">
                  {zone.label}
                </h2>
                <p className="vz-zone__desc">{zone.descriptor}</p>
              </header>
              {zone.paint && <ColourPicker colours={bundle.colours} value={config.colourId} onChange={selectColour} />}
              <OptionTray bundle={bundle} config={config} zone={zone} blocked={state.blocked} images={optionImages} onSelect={choose} />
              {zoneSlots(zone, bundle).length === 0 && (
                <p className="vz-zone__note">
                  Paint only — no {zone.label.toLowerCase()} parts for the {bundle.bike.name} in the catalogue yet.
                </p>
              )}
            </section>
          ) : (
            <section className="vz-zone" aria-label="Colour">
              <ColourPicker colours={bundle.colours} value={config.colourId} onChange={selectColour} />
            </section>
          )}
          <BuildSummary bundle={bundle} config={config} />
        </aside>
      </div>
    </div>
  )
}
