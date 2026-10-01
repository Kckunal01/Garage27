'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRef, useState, type CSSProperties } from 'react'
import { BikeSilhouette, type Silhouette } from '@/components/media/BikeSilhouette'

export const BUILD_ENVIRONMENT = '/assets/environments/build-base.png'
const BAY = '/build/visualiser'

export interface LandingColour {
  id: string
  name: string
  swatch: string
  /** Second tone of a two-tone scheme. */
  accent?: string
}

export interface LandingModel {
  id: string
  brand: string
  name: string
  tagline?: string
  silhouette: Silhouette
  /** Featured photograph (large). */
  image?: string
  /** Catalogue-card photograph. */
  thumbnail?: string
  defaultColourId?: string
  colours: LandingColour[]
}

const defaultColour = (m: LandingModel) => m.colours.find((c) => c.id === m.defaultColourId) ?? m.colours[0]

/** The machine's picture: its photograph when delivered, else the line drawing (painted in the chosen colour). */
function BikeVisual({ model, src, paint, sizes, eager }: { model: LandingModel; src?: string; paint?: string; sizes: string; eager?: boolean }) {
  if (src) return <Image className="blnd-visual blnd-visual--photo" src={src} alt="" fill sizes={sizes} loading={eager ? 'eager' : 'lazy'} />
  return <BikeSilhouette className="blnd-visual" silhouette={model.silhouette} paint={paint} tone="amber" reflection={!!paint} />
}

/** Models grouped by manufacturer, in catalogue order. */
function byBrand(models: LandingModel[]): [string, LandingModel[]][] {
  const groups = new Map<string, LandingModel[]>()
  for (const m of models) groups.set(m.brand, [...(groups.get(m.brand) ?? []), m])
  return [...groups]
}

/**
 * BUILD — Choose your bike. The featured machine stands in the workshop with
 * its factory colours and BUILD NOW; below it, every model Garage 27 builds.
 * Only the featured machine shows colours. BUILD NOW opens the 3D bay with
 * the chosen model and colour. The page never names a bike: it is all data.
 */
export function BuildLanding({ models }: { models: LandingModel[] }) {
  const [selectedId, setSelectedId] = useState(models[0]?.id)
  const selected = models.find((m) => m.id === selectedId) ?? models[0]
  const [colourId, setColourId] = useState(selected ? defaultColour(selected)?.id : undefined)
  const feature = useRef<HTMLElement>(null)
  if (!selected) return null
  const colour = selected.colours.find((c) => c.id === colourId) ?? defaultColour(selected)
  const href = `${BAY}?bike=${encodeURIComponent(selected.id)}${colour ? `&colour=${encodeURIComponent(colour.id)}` : ''}`

  const choose = (m: LandingModel) => {
    setSelectedId(m.id)
    setColourId(defaultColour(m)?.id)
    const top = feature.current?.getBoundingClientRect().top ?? 0
    if (top < 0) feature.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="blnd">
      <section ref={feature} className="blnd__hero" aria-labelledby="blnd-title">
        <div className="blnd__env" aria-hidden="true">
          <Image className="blnd__envimg" src={BUILD_ENVIRONMENT} alt="" fill sizes="100vw" quality={90} preload />
          <div className="blnd__shade" />
        </div>

        <div className="blnd__intro">
          <p className="blnd__kicker">BUILD / VISUALIZER</p>
          <h1 id="blnd-title" className="blnd__title">
            CHOOSE
            <br />
            YOUR BIKE.
          </h1>
          <p className="blnd__lede">
            {models.length} motorcycles. Infinite possibilities.
            <br />
            Select a model to start customising.
          </p>
        </div>

        <div className="blnd__stage">
          <div className="blnd__bike" key={selected.id}>
            <BikeVisual model={selected} src={selected.image} paint={colour?.swatch} sizes="(width < 768px) 100vw, 60vw" eager />
          </div>
        </div>

        <div className="blnd__feature">
          <div className="blnd__id">
            <h2 className="blnd__name" aria-live="polite">
              {selected.name}
            </h2>
            {selected.tagline && <p className="blnd__tag">{selected.tagline}</p>}
          </div>
          <Link className="blnd__cta" href={href}>
            BUILD NOW
          </Link>
          {selected.colours.length > 0 && (
            <div className="blnd__colours">
              <div className="blnd__swatches" role="radiogroup" aria-label={`${selected.name} colours`}>
                {selected.colours.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    role="radio"
                    aria-checked={c.id === colour?.id}
                    aria-label={c.name}
                    title={c.name}
                    className={`blnd__swatch${c.id === colour?.id ? ' is-active' : ''}`}
                    style={{ '--sw': c.swatch, '--sw2': c.accent ?? c.swatch } as CSSProperties}
                    onClick={() => setColourId(c.id)}
                  />
                ))}
              </div>
              <p className="blnd__colour-name">{colour?.name}</p>
            </div>
          )}
        </div>
      </section>

      <section className="blnd__models" aria-label="Models by manufacturer">
        {byBrand(models).map(([brand, list]) => (
          <div key={brand} className="blnd__brand">
            <h2 className="blnd__all">{brand.toUpperCase()}</h2>
            <ul className="blnd__grid">
              {list.map((m) => {
                const active = m.id === selected.id
                return (
                  <li key={m.id}>
                    <button type="button" className={`bmodel${active ? ' is-active' : ''}`} aria-pressed={active} onClick={() => choose(m)}>
                      <span className="bmodel__art" aria-hidden="true">
                        <BikeVisual model={m} src={m.thumbnail} sizes="(width < 768px) 25vw, 12vw" />
                      </span>
                      <span className="bmodel__brand">{m.brand}</span>
                      <span className="bmodel__name">{m.name}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </section>
    </div>
  )
}
