'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { TextField } from '@/components/forms/FormField'
import { CopyCode } from '@/components/garage-ui/CopyCode'
import { GarageButton } from '@/components/garage-ui/GarageButton'
import { CONTACT } from '@/components/navigation/nav-config'
import { PART_CATEGORY_META } from '@/data/catalogue'
import { CategoryPhoto } from '@/features/parts/CategoryPhoto'
import { PartPrice } from '@/features/parts/PartPrice'
import { formatINR } from '@/lib/pricing/money'
import type { Paise, PartCategory } from '@/types/catalogue'
import { estimatedDelivery, formatPlaced, formatStamp, formatWindow, headlineFor, TIMELINE, timelineFor } from './tracking'

interface OrderView {
  reference: string
  status: string
  total: number
  placedAt?: string | null
  items: { partId?: string; name: string; quantity: number; unitPrice: number }[]
}

/** The catalogue facts the result page shows beside an order (from the server). */
export interface TrackPart {
  id: string
  slug: string
  name: string
  category: PartCategory
  price: Paise
  compareAtPrice?: Paise
  inStock: boolean
  image?: string
  fit: string
}

const HERO = '/assets/about/01-hero-garage.webp'

/** Looks up an order by its unguessable reference via the existing status API, then shows where it stands. */
export function TrackOrder({ catalogue }: { catalogue: TrackPart[] }) {
  const [ref, setRef] = useState('')
  const [error, setError] = useState<string>()
  const [order, setOrder] = useState<OrderView | null>(null)
  const [busy, setBusy] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const reference = ref.trim().toUpperCase()
    setOrder(null)
    if (!/^G27-O-[A-Z0-9]{8}$/.test(reference)) {
      setError('Use the reference from your confirmation, e.g. G27-O-7KX3M9QD.')
      return
    }
    setError(undefined)
    setBusy(true)
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(reference)}`, { cache: 'no-store' })
      if (res.status === 404) setError('We couldn’t find that order. Check the reference and try again.')
      else if (!res.ok) setError('SOMETHING MISFIRED. TRY AGAIN.')
      else setOrder((await res.json()) as OrderView)
    } catch {
      setError('No signal. Check your connection and try again.')
    } finally {
      setBusy(false)
    }
  }

  if (order) return <TrackResult order={order} catalogue={catalogue} onBack={() => setOrder(null)} />

  return (
    <div className="wrap section--tight doc-page">
      <p className="doc-page__kicker">TRACK ORDER</p>
      <h1 className="doc-page__title">Where’s my order?</h1>
      <p className="lede">Enter the reference from your order confirmation.</p>
      <div className="track">
        <form className="track__form" onSubmit={submit} noValidate>
          <TextField label="Order reference" placeholder="G27-O-XXXXXXXX" autoCapitalize="characters" autoComplete="off" value={ref} onChange={(e) => setRef(e.target.value)} error={error} />
          <GarageButton type="submit" variant="ignite" block busy={busy}>
            TRACK ORDER
          </GarageButton>
        </form>
      </div>
    </div>
  )
}

function TrackResult({ order, catalogue, onBack }: { order: OrderView; catalogue: TrackPart[]; onBack(): void }) {
  const heading = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    window.scrollTo({ top: 0 })
    heading.current?.focus({ preventScroll: true })
  }, [])

  const { lines, sub } = headlineFor(order.status)
  const steps = timelineFor(order.status)
  const window_ = estimatedDelivery(order.status, order.placedAt)
  const part = (id?: string) => catalogue.find((p) => p.id === id)
  const count = order.items.reduce((n, i) => n + i.quantity, 0)
  const ordered = new Set(order.items.map((i) => i.partId))
  const more = catalogue.filter((p) => p.inStock && !ordered.has(p.id)).slice(0, 4)

  return (
    <div className="tro">
      <section className="tro-hero">
        <div className="tro-hero__media" aria-hidden="true">
          <Image className="tro-hero__img" src={HERO} alt="" fill sizes="100vw" quality={75} preload />
          <span className="tro-hero__shade" />
        </div>
        <div className="tro-hero__copy">
          <button type="button" className="tro-back" onClick={onBack}>
            <span aria-hidden="true">←</span> Track another order
          </button>
          <h1 className="tro-hero__title" ref={heading} tabIndex={-1}>
            {lines[0]}
            <br />
            {lines[1]}
          </h1>
          <p className="tro-hero__sub">{sub}</p>
        </div>
      </section>

      <div className="tro__body">
        <section className="tro-info" aria-label="Order details">
          <div className="tro-info__cell">
            <CopyCode code={order.reference} label="ORDER REFERENCE" variant="display" />
            {order.placedAt && <p className="tro-info__meta">Placed on {formatPlaced(order.placedAt)}</p>}
          </div>
          <div className="tro-info__cell tro-info__cell--eta">
            <p className="tro-info__label">ESTIMATED DELIVERY</p>
            {window_ ? (
              <>
                <p className="tro-info__value">
                  <svg className="tro-info__cal" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
                    <rect x="3.5" y="5" width="17" height="15.5" rx="1.5" />
                    <path d="M3.5 9.5h17M8 3v4M16 3v4M8 13h.01M12 13h.01M16 13h.01M8 16.5h.01M12 16.5h.01" />
                  </svg>
                  {formatWindow(window_)}
                </p>
                <p className="tro-info__meta">
                  Indicative, per our{' '}
                  <Link href="/shipping#delivery-time" className="tro-info__link">
                    Shipping Policy
                  </Link>
                </p>
              </>
            ) : (
              <>
                <p className="tro-info__value tro-info__value--none">—</p>
                <p className="tro-info__meta">{order.status === 'pending' || order.status === 'awaiting_payment' ? 'Shown once payment is confirmed.' : 'Not applicable to this order.'}</p>
              </>
            )}
          </div>
        </section>

        <ol className="tro-steps" aria-label="Order status">
          {TIMELINE.map((label, i) => (
            <li key={label} className={`tro-step is-${steps[i]}`} aria-current={steps[i] === 'current' ? 'step' : undefined}>
              <span className="tro-step__dot" aria-hidden="true">
                {steps[i] === 'done' && (
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3.5 8.5l3 3 6-7" />
                  </svg>
                )}
              </span>
              <span className="tro-step__label">{label}</span>
              <span className="tro-step__time">{i === 0 && order.placedAt ? formatStamp(order.placedAt) : '—'}</span>
              <span className="sr-only">{steps[i] === 'done' ? ' (complete)' : steps[i] === 'current' ? ' (current)' : ''}</span>
            </li>
          ))}
        </ol>

        <section className="tro-items" aria-labelledby="tro-items-title">
          <header className="tro-items__head">
            <h2 id="tro-items-title" className="tro-label">
              ORDER ITEMS
            </h2>
            <span className="tro-label">
              {count} ITEM{count === 1 ? '' : 'S'}
            </span>
          </header>
          <ul className="tro-items__list">
            {order.items.map((i) => {
              const p = part(i.partId)
              const was = p?.compareAtPrice && p.compareAtPrice > i.unitPrice ? p.compareAtPrice : null
              return (
                <li key={`${i.partId ?? i.name}`} className="tro-item">
                  <span className="tro-item__img">
                    {p?.image ? (
                      // eslint-disable-next-line @next/next/no-img-element -- catalogue images are pre-optimised at delivery size
                      <img src={p.image} alt="" loading="lazy" decoding="async" />
                    ) : p ? (
                      <CategoryPhoto meta={PART_CATEGORY_META[p.category]} sizes="72px" />
                    ) : null}
                  </span>
                  <span className="tro-item__text">
                    <span className="tro-item__name">{i.name}</span>
                    {p && <span className="tro-item__fit">{p.fit}</span>}
                  </span>
                  <span className="tro-item__qty">Qty: {i.quantity}</span>
                  <span className="tro-item__price">
                    <span>{formatINR(i.unitPrice * i.quantity)}</span>
                    {was && (
                      <s className="tro-item__was">
                        <span className="sr-only">Original price </span>
                        {formatINR(was * i.quantity)}
                      </s>
                    )}
                  </span>
                </li>
              )
            })}
          </ul>
        </section>

        <section className="tro-help" aria-labelledby="tro-help-title">
          <svg className="tro-help__icon" viewBox="0 0 32 32" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 4C9 4 4 8.7 4 14.5c0 3 1.4 5.7 3.6 7.6L6.5 27.5l5.3-2.7c1.3.4 2.7.6 4.2.6 7 0 12-4.7 12-10.9S23 4 16 4z" />
            <path d="M11 14.8h.01M16 14.8h.01M21 14.8h.01" strokeWidth="2.2" />
          </svg>
          <div className="tro-help__copy">
            <p className="tro-label tro-label--red">NEED HELP?</p>
            <h2 id="tro-help-title" className="tro-help__title">
              We’re here for you.
            </h2>
            <p className="tro-help__text">Have a question about your order? Our team usually replies within a few hours.</p>
          </div>
          <a className="tro-help__cta" href={`mailto:${CONTACT.email}?subject=${encodeURIComponent(`Order ${order.reference}`)}`}>
            Contact Support <span aria-hidden="true">→</span>
          </a>
        </section>

        {more.length > 0 && (
          <section className="tro-more" aria-labelledby="tro-more-title">
            <header className="tro-more__head">
              <div>
                <h2 id="tro-more-title" className="tro-label tro-label--red">
                  STILL NOT SATISFIED?
                </h2>
                <p className="tro-more__sub">Check out our bestsellers while you wait.</p>
              </div>
              <Link href="/parts" className="tro-more__all">
                View All Parts <span aria-hidden="true">→</span>
              </Link>
            </header>
            <ul className="tro-more__grid">
              {more.map((p) => (
                <li key={p.id}>
                  <Link href={`/parts/${p.slug}`} className="tro-card">
                    <span className="tro-card__img">
                      {p.image ? (
                        // eslint-disable-next-line @next/next/no-img-element -- catalogue images are pre-optimised at delivery size
                        <img src={p.image} alt="" loading="lazy" decoding="async" />
                      ) : (
                        <CategoryPhoto meta={PART_CATEGORY_META[p.category]} sizes="(width < 768px) 50vw, 25vw" />
                      )}
                    </span>
                    <span className="tro-card__name">{p.name}</span>
                    <PartPrice part={p} className="tro-card__price" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  )
}
