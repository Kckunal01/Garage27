'use client'

import { formatDelta, formatINR } from '@/lib/pricing/money'
import { PRICING_RULES, type BuildEstimate } from './engine'

export function PriceSummary({ estimate, detailed }: { estimate: BuildEstimate; detailed?: boolean }) {
  return (
    <div className="psum">
      <p className="label">ESTIMATED BUILD VALUE</p>
      <p className="psum__total" aria-live="polite" aria-atomic="true">
        {estimate.priced ? formatINR(estimate.total) : 'PRICE ON REQUEST'}
      </p>
      {detailed && (
        <dl className="psum__lines">
          <div>
            <dt>Base bike</dt>
            <dd>{estimate.priced ? formatINR(estimate.base) : 'On request'}</dd>
          </div>
          {estimate.colour && (
            <div>
              <dt>{estimate.colour.name}</dt>
              <dd>{formatDelta(estimate.colour.delta)}</dd>
            </div>
          )}
          {estimate.lines
            .filter((l) => l.delta !== 0)
            .map((l) => (
              <div key={l.slot}>
                <dt>{l.optionName}</dt>
                <dd>{formatDelta(l.delta)}</dd>
              </div>
            ))}
          {estimate.bayCharge > 0 && (
            <div>
              <dt>Bay labour · {estimate.modifiedSlots} change{estimate.modifiedSlots === 1 ? '' : 's'}</dt>
              <dd>{formatDelta(estimate.bayCharge)}</dd>
            </div>
          )}
        </dl>
      )}
      <p className="psum__note">{PRICING_RULES.taxNote}</p>
    </div>
  )
}
