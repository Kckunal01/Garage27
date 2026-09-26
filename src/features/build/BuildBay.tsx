'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useRef } from 'react'
import { GarageButton } from '@/components/garage-ui/GarageButton'
import { useToast } from '@/components/garage-ui/Toast'
import { track } from '@/lib/analytics'
import { formatINR } from '@/lib/pricing/money'
import type { BikeColour, Bike, BuildCategory, ComponentOption, ShowcaseBuild } from '@/types/catalogue'
import { BikePicker } from './BikePicker'
import { BuildReview } from './BuildReview'
import { CategoryRail } from './CategoryRail'
import { ColourPicker } from './ColourPicker'
import { categoriesForBike, decodeConfiguration, INVALID_OPTION_MESSAGE, isInteractive, type BuildContext } from './engine'
import { OptionTray } from './OptionTray'
import { PriceSummary } from './PriceSummary'
import { readLastBikeId, useBuildState } from './useBuildState'
import { BuildViewport } from './viewport/BuildViewport'

interface Props {
  bikes: Bike[]
  colours: BikeColour[]
  options: ComponentOption[]
  presets: Pick<ShowcaseBuild, 'id' | 'name' | 'preset'>[]
}

/**
 * SELECT BIKE → SELECT COLOUR → EDITOR (category → option → live price) → REVIEW → QUOTE.
 * One state machine; the CSS decides whether it reads as a mobile build bay
 * (viewport, chips, tray, sticky price) or a desktop one (rail | viewport | panel).
 */
export function BuildBay({ bikes, colours, options, presets }: Props) {
  const ctx: BuildContext = useMemo(() => ({ bikes, colours, options }), [bikes, colours, options])
  const { state, bundle, estimate, pickBike, selectColour, openCategory, selectOption, setStage, resetToBikes, resetBuild } = useBuildState(ctx)
  const router = useRouter()
  const params = useSearchParams()
  const toast = useToast()
  const booted = useRef(false)

  // Entry points: ?preset= (garage showcase), ?c= (shared build), ?saved=1, ?bike=
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
    if (bikeParam) pickBike(bikeParam, { source: 'link' })
  }, [params, presets, pickBike, toast])

  // Keep the URL shareable as the visitor moves between bikes.
  useEffect(() => {
    if (!booted.current) return
    const want = state.bikeId ? `/build?bike=${state.bikeId}` : '/build'
    const current = `${window.location.pathname}${window.location.search}`
    if (current !== want && !(state.bikeId === null && current === '/build')) router.replace(want, { scroll: false })
  }, [state.bikeId, router])

  // Scroll to top on stage change (mobile especially).
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [state.stage])

  const onPick = (id: string) => pickBike(id)

  if (!bundle || !state.config || !estimate || state.stage === 'bikes') {
    return (
      <div className="wrap section--tight">
        <BikePicker bikes={bikes} onPick={onPick} />
      </div>
    )
  }

  if (state.stage === 'review' || state.stage === 'preview') {
    return (
      <div className="wrap section--tight">
        <BuildReview
          bundle={bundle}
          config={state.config}
          estimate={estimate}
          previewOnly={state.stage === 'preview'}
          onBack={() => (state.stage === 'preview' || !isInteractive(bundle.bike) ? resetToBikes() : setStage('editor'))}
        />
      </div>
    )
  }

  const categories = categoriesForBike(bundle.bike)
  const modified = new Set<BuildCategory>(
    bundle.bike.slots.filter((s) => (state.config!.components[s.id] ?? null) !== s.defaultOptionId).map((s) => s.category),
  )
  const config = state.config
  const paint = bundle.colours.find((c) => c.id === config.colourId)?.material ?? { color: '#333', metalness: 0.4, roughness: 0.4 }
  const inEditor = state.stage === 'editor'

  const choose = (o: ComponentOption) => {
    const r = selectOption(o)
    if (!r.ok) toast({ tone: 'error', title: INVALID_OPTION_MESSAGE, body: r.reason })
  }

  const reviewButton = (
    <GarageButton variant="ignite" onClick={() => setStage('review')} block className="bay__panel-cta">
      REVIEW BUILD
    </GarageButton>
  )

  return (
    <div className={`bay bay--${state.stage}`}>
      <header className="bay__bar">
        <button type="button" className="neon-link" onClick={resetToBikes}>
          ← BIKES
        </button>
        <p className="bay__bike">
          <span className="label">{bundle.bike.brand.toUpperCase()}</span> <strong>{bundle.bike.name}</strong>
        </p>
        <p className="label bay__step">{inEditor ? 'STEP 03 · CUSTOMISE' : 'STEP 02 · COLOUR'}</p>
      </header>

      {inEditor && (
        <div className="bay__rail">
          <CategoryRail categories={categories} active={state.category} modified={modified} onPick={openCategory} />
        </div>
      )}

      <div className="bay__stage">
        <BuildViewport
          bike={bundle.bike}
          config={state.config}
          options={bundle.options}
          paint={paint}
          activeCategory={inEditor ? state.category : null}
          litSlot={state.litSlot}
          pulse={state.pulse}
          conflictSlots={state.blocked?.conflicts ?? []}
          showHotspots={inEditor}
          onHotspot={openCategory}
          fallbackAction={
            <GarageButton variant="amber" size="sm" onClick={() => setStage('review')}>
              REVIEW & REQUEST QUOTE
            </GarageButton>
          }
        />
      </div>

      <aside className="bay__panel" aria-label={inEditor ? 'Options' : 'Colour'}>
        {inEditor ? (
          <>
            <ColourPicker colours={bundle.colours} value={state.config.colourId} onChange={selectColour} compact />
            {state.category && <OptionTray bundle={bundle} config={state.config} category={state.category} blocked={state.blocked} onSelect={choose} />}
            <div className="bay__summary">
              <PriceSummary estimate={estimate} detailed />
              {reviewButton}
              <button type="button" className="neon-link bay__reset" onClick={resetBuild}>
                RESET TO FACTORY
              </button>
            </div>
          </>
        ) : (
          <div className="bay__colour">
            <p className="label label--amber">STEP 02 · SELECT COLOUR</p>
            <h1 className="headline">Pick your paint.</h1>
            <ColourPicker colours={bundle.colours} value={state.config.colourId} onChange={selectColour} />
            <PriceSummary estimate={estimate} />
            <GarageButton variant="ignite" block className="bay__panel-cta" onClick={() => setStage('editor')}>
              ENTER THE EDITOR
            </GarageButton>
          </div>
        )}
      </aside>

      {/* Mobile sticky price bar — sits above the universal nav, never under it. */}
      <div className="bay__dock">
        <div className="bay__dock-price">
          <span className="label">EST. BUILD VALUE</span>
          <span className="bay__dock-total" aria-live="polite">
            {formatINR(estimate.total)}
          </span>
        </div>
        {inEditor ? (
          <GarageButton variant="ignite" size="sm" onClick={() => setStage('review')}>
            REVIEW
          </GarageButton>
        ) : (
          <GarageButton variant="ignite" size="sm" onClick={() => setStage('editor')}>
            CUSTOMISE
          </GarageButton>
        )}
      </div>
    </div>
  )
}
