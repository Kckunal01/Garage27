'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { BikeSilhouette } from '@/components/media/BikeSilhouette'
import { GarageButton } from '@/components/garage-ui/GarageButton'
import { useToast } from '@/components/garage-ui/Toast'
import { BUILD_CATEGORY_META } from '@/data/catalogue'
import { QuoteForm } from '@/features/quotes/QuoteForm'
import { track } from '@/lib/analytics'
import { formatDelta } from '@/lib/pricing/money'
import type { BuildConfiguration } from '@/types/catalogue'
import { encodeConfiguration, type BikeBundle, type BuildEstimate } from './engine'
import { PriceSummary } from './PriceSummary'

export function BuildReview({ bundle, config, estimate, onBack, previewOnly }: { bundle: BikeBundle; config: BuildConfiguration; estimate: BuildEstimate; onBack(): void; previewOnly?: boolean }) {
  const [reference, setReference] = useState<string | null>(null)
  const toast = useToast()
  const headRef = useRef<HTMLHeadingElement>(null)
  const colour = bundle.colours.find((c) => c.id === config.colourId)

  useEffect(() => {
    headRef.current?.focus()
  }, [reference])

  const share = async () => {
    const url = `${window.location.origin}/build?c=${encodeConfiguration(config)}`
    track('build_saved', { bike: config.bikeId, method: 'link' })
    try {
      if (navigator.share) await navigator.share({ title: 'My Garage 27 build', url })
      else {
        await navigator.clipboard.writeText(url)
        toast({ tone: 'success', title: 'BUILD SAVED', body: 'Link copied. It rebuilds this exact bike.' })
      }
    } catch {
      /* share sheet dismissed */
    }
  }

  if (reference) {
    return (
      <div className="review review--done">
        <div className="confirm plate">
          <p className="label label--amber">QUOTE REQUESTED</p>
          <h1 className="headline" tabIndex={-1} ref={headRef}>
            Your build is on the board.
          </h1>
          <p className="lede">A Garage 27 builder will review your configuration and come back with a confirmed quote — usually within two working days.</p>
          <p className="confirm__ref">
            <span className="label">QUOTE REFERENCE</span> <strong>{reference}</strong>
          </p>
          <div className="confirm__ctas">
            <Link href="/garage" className="btn">
              EXPLORE BUILDS
            </Link>
            <Link href="/parts" className="btn btn--amber">
              SHOP PARTS
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="review">
      <div className="review__summary">
        <button type="button" className="neon-link review__back" onClick={onBack}>
          ← {previewOnly ? 'CHOOSE ANOTHER BIKE' : 'BACK TO THE BAY'}
        </button>
        <p className="label label--amber">{previewOnly ? 'PREVIEW + QUOTE' : 'REVIEW YOUR BUILD'}</p>
        <h1 className="headline" tabIndex={-1} ref={headRef}>
          {bundle.bike.brand} {bundle.bike.name}
        </h1>
        <BikeSilhouette className="review__art" silhouette={bundle.bike.silhouette} paint={colour?.swatch} title={`Preview of your ${bundle.bike.model}`} />
        {previewOnly && <p className="review__notice badge badge--amber">INTERACTIVE 3D FOR THIS BIKE IS STILL IN THE WORKSHOP</p>}
        <dl className="review__list">
          <div>
            <dt className="label">COLOUR</dt>
            <dd>
              {colour?.name ?? '—'} <span className="muted">{colour ? formatDelta(colour.priceDelta) : ''}</span>
            </dd>
          </div>
          {bundle.bike.slots.map((slot) => {
            const opt = bundle.options.find((o) => o.id === config.components[slot.id])
            return (
              <div key={slot.id}>
                <dt className="label">
                  {BUILD_CATEGORY_META[slot.category].label} · {slot.label}
                </dt>
                <dd>
                  {opt?.name ?? 'NONE'} <span className="muted">{opt ? formatDelta(opt.priceDelta) : ''}</span>
                </dd>
              </div>
            )
          })}
        </dl>
        <PriceSummary estimate={estimate} detailed />
        {!previewOnly && (
          <GarageButton type="button" variant="ghost" onClick={share}>
            SAVE / SHARE THIS BUILD
          </GarageButton>
        )}
      </div>
      <div className="review__form plate">
        <p className="title">SEND IT TO THE WORKSHOP</p>
        <QuoteForm configuration={config} estimate={estimate.total} onDone={setReference} />
      </div>
    </div>
  )
}
