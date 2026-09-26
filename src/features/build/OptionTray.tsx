'use client'

import { BUILD_CATEGORY_META } from '@/data/catalogue'
import { formatDelta } from '@/lib/pricing/money'
import type { BuildCategory, BuildConfiguration, ComponentOption } from '@/types/catalogue'
import { CategoryGlyph } from '@/components/media/CategoryGlyph'
import { checkOption, INVALID_OPTION_MESSAGE, type BikeBundle } from './engine'

interface Props {
  bundle: BikeBundle
  config: BuildConfiguration
  category: BuildCategory
  blocked: { optionId: string; reason: string } | null
  onSelect(option: ComponentOption): void
}

/**
 * The control surface for one category: every slot in it, every option for
 * that slot, with price delta, selected state and — crucially — a visible
 * "doesn't fit" state instead of silently overwriting other choices.
 */
export function OptionTray({ bundle, config, category, blocked, onSelect }: Props) {
  const meta = BUILD_CATEGORY_META[category]
  const slots = bundle.bike.slots.filter((s) => s.category === category)
  return (
    <section className="tray" aria-labelledby={`tray-${category}`}>
      <header className="tray__head">
        <h2 id={`tray-${category}`} className="tray__title">
          {meta.label}
        </h2>
        <p className="tray__desc">{meta.descriptor}</p>
      </header>
      {slots.map((slot) => {
        const opts = bundle.options.filter((o) => o.slot === slot.id && o.status !== 'retired')
        return (
          <div key={slot.id} className="tray__slot" role="radiogroup" aria-label={slot.label}>
            {slots.length > 1 && <p className="label">{slot.label}</p>}
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
                    aria-describedby={!check.ok ? `${o.id}-why` : undefined}
                  >
                    <span className="opt__thumb" aria-hidden="true">
                      <CategoryGlyph category={category} />
                    </span>
                    <span className="opt__name">{o.name}</span>
                    <span className="opt__desc">{o.descriptor}</span>
                    <span className="opt__delta">{soon ? 'COMING SOON' : formatDelta(o.priceDelta)}</span>
                    {!check.ok && !soon && (
                      <span className="opt__why" id={`${o.id}-why`}>
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
    </section>
  )
}
