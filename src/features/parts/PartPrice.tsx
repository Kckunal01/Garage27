import { discountOf } from '@/lib/pricing/discount'
import { formatINR } from '@/lib/pricing/money'
import type { Part } from '@/types/catalogue'

/**
 * A part's price. When Garage 27 sets an original / reference price above the
 * selling price, it sits above it, crossed out, with the saving in small red
 * type — editorial, not a badge. The selling price is what checkout charges.
 */
export function PartPrice({ part, className }: { part: Pick<Part, 'price' | 'compareAtPrice'>; className: string }) {
  const d = discountOf(part)
  return (
    <span className={`pprice ${className}`}>
      {d && (
        <span className="pprice__was-row">
          <s className="pprice__was">
            <span className="sr-only">Original price </span>
            {formatINR(d.was)}
          </s>
          <span className="pprice__off">{d.percent}% OFF</span>
        </span>
      )}
      <span className="pprice__now">
        {d && <span className="sr-only">Now </span>}
        {formatINR(part.price)}
      </span>
    </span>
  )
}
