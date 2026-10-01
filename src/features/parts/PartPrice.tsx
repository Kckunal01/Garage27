import { formatINR } from '@/lib/pricing/money'
import type { Part } from '@/types/catalogue'

/**
 * A part's price. When Garage 27 sets an original / reference price above the
 * selling price, it sits above it, crossed out — editorial, not a badge.
 */
export function PartPrice({ part, className }: { part: Pick<Part, 'price' | 'compareAtPrice'>; className: string }) {
  const was = part.compareAtPrice && part.compareAtPrice > part.price ? part.compareAtPrice : null
  return (
    <span className={`pprice ${className}`}>
      {was && (
        <s className="pprice__was">
          <span className="sr-only">Original price </span>
          {formatINR(was)}
        </s>
      )}
      <span className="pprice__now">
        {was && <span className="sr-only">Now </span>}
        {formatINR(part.price)}
      </span>
    </span>
  )
}
