'use client'

import { formatDelta } from '@/lib/pricing/money'
import type { BuildConfiguration, BuildZone, ComponentOption } from '@/types/catalogue'
import { CategoryGlyph } from '@/components/media/CategoryGlyph'
import { checkOption, INVALID_OPTION_MESSAGE, type BikeBundle } from './engine'
import { zoneSlots } from './zones'

interface Props {
  bundle: BikeBundle
  config: BuildConfiguration
  zone: BuildZone
  blocked: { optionId: string; reason: string } | null
  onSelect(option: ComponentOption): void
}

/**
 * The options for one zone: every slot the vehicle has in it, every catalogue
 * option for that slot, with price delta, selected state and a visible
 * "doesn't fit" state instead of silently overwriting other choices.
 */
export function OptionTray({ bundle, config, zone, blocked, onSelect }: Props) {
  const slots = zoneSlots(zone, bundle)
  return (
    <div className="tray">
      {slots.map((slot) => {
        const opts = bundle.options.filter((o) => o.slot === slot.id && o.status !== 'retired')
        return (
          <div key={slot.id} className="tray__slot" role="radiogroup" aria-label={slot.label}>
            {slots.length > 1 && <p className="label tray__slot-label">{slot.label}</p>}
            <div className="tray__options">
              {opts.map((o) => {
                const selected = config.components[slot.id] === o.id
                const check = selected ? { ok: true as const } : checkOption(config, o, bundle)
                const soon = o.status === 'coming-soon'
                const isBlocked = blocked?.optionId === o.id
                return (
                  <button
                    key={o.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    aria-disabled={soon || undefined}
                    className={`opt${selected ? ' is-selected' : ''}${!check.ok ? ' is-unfit' : ''}${isBlocked ? ' is-blocked' : ''}`}
                    onClick={() => !selected && onSelect(o)}
                    title={!check.ok && !soon ? check.reason : o.descriptor}
                    aria-describedby={!check.ok ? `${o.id}-why` : undefined}
                  >
                    <span className="opt__thumb" aria-hidden="true">
                      <CategoryGlyph category={zone.glyph} />
                    </span>
                    <span className="opt__name">{o.name}</span>
                    <span className="opt__delta">{soon ? 'SOON' : formatDelta(o.priceDelta)}</span>
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
