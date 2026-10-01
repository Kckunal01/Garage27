'use client'

import Image from 'next/image'
import { formatINR, formatPrice } from '@/lib/pricing/money'
import type { BuildConfiguration, BuildZone, ComponentOption } from '@/types/catalogue'
import { checkOption, INVALID_OPTION_MESSAGE, type BikeBundle } from './engine'
import { zoneSlots } from './zones'

interface Props {
  bundle: BikeBundle
  config: BuildConfiguration
  zone: BuildZone
  blocked: { optionId: string; reason: string } | null
  /** Option id → real product photograph (only files that exist). */
  images: Record<string, string>
  onSelect(option: ComponentOption): void
}

/**
 * The products for one part of the bike. Each slot starts with NONE (the
 * factory part, no addition); every other option is a product with its real
 * photograph (or an empty frame until one exists), name and price. Clicking
 * the selected product deselects it, back to NONE.
 */
export function OptionTray({ bundle, config, zone, blocked, images, onSelect }: Props) {
  const slots = zoneSlots(zone, bundle)
  return (
    <div className="tray">
      {slots.map((slot) => {
        const stock = bundle.options.find((o) => o.id === slot.defaultOptionId)
        const products = bundle.options.filter((o) => o.slot === slot.id && o.id !== slot.defaultOptionId && o.status !== 'retired')
        const current = config.components[slot.id] ?? slot.defaultOptionId
        const none = current === slot.defaultOptionId
        return (
          <div key={slot.id} className="tray__slot" role="radiogroup" aria-label={slot.label}>
            <p className="tray__slot-label">{slot.label}</p>
            <div className="tray__grid">
              <button type="button" role="radio" aria-checked={none} className={`vzp vzp--none${none ? ' is-selected' : ''}`} onClick={() => !none && stock && onSelect(stock)}>
                <span className="vzp__name">NONE</span>
                <span className="vzp__desc">No additional component</span>
                <span className="vzp__price">{formatINR(0)}</span>
              </button>
              {products.map((o) => {
                const selected = current === o.id
                const check = selected ? { ok: true as const } : checkOption(config, o, bundle)
                const soon = o.status === 'coming-soon'
                const isBlocked = blocked?.optionId === o.id
                const image = images[o.id]
                return (
                  <button
                    key={o.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    aria-disabled={soon || undefined}
                    className={`vzp${selected ? ' is-selected' : ''}${!check.ok ? ' is-unfit' : ''}${isBlocked ? ' is-blocked' : ''}`}
                    onClick={() => {
                      if (soon) return
                      if (selected) {
                        if (stock) onSelect(stock) // deselect → NONE
                      } else onSelect(o)
                    }}
                    title={!check.ok && !soon ? check.reason : o.descriptor}
                    aria-describedby={!check.ok ? `${o.id}-why` : undefined}
                  >
                    <span className={`vzp__img${image ? '' : ' vzp__img--pending'}`} aria-hidden="true">
                      {image && <Image src={image} alt="" fill sizes="(width < 768px) 44vw, 160px" />}
                    </span>
                    <span className="vzp__name">{o.name}</span>
                    <span className="vzp__price">{soon ? 'COMING SOON' : formatPrice(o.priceDelta)}</span>
                    {!check.ok && !soon && (
                      <span className="sr-only" id={`${o.id}-why`}>
                        {check.reason}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
      {blocked && (
        <p className="tray__blocked" role="alert">
          <strong>{INVALID_OPTION_MESSAGE}</strong> {blocked.reason}
        </p>
      )}
    </div>
  )
}
