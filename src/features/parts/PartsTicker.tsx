import { SHIPPING_RULES } from '@/lib/pricing/cart'
import { formatINR } from '@/lib/pricing/money'

const ITEMS = ['MONEYBACK', `FREE SHIPPING (ABOVE ${formatINR(SHIPPING_RULES.freeAbove)})`, 'COD AVAILABLE', 'PAN INDIA DELIVERY']

/**
 * A thin rolling line of Garage 27's Parts promises across the top of /parts.
 * The track holds the list twice and slides by one copy, so the loop is
 * seamless; the copy is read once by assistive tech. Still for reduced motion.
 */
export function PartsTicker() {
  const run = (hidden?: boolean) => (
    <ul className="prt-ticker__run" aria-hidden={hidden || undefined}>
      {ITEMS.map((t) => (
        <li key={t} className="prt-ticker__item">
          {t}
        </li>
      ))}
    </ul>
  )
  return (
    <div className="prt-ticker" role="region" aria-label="Parts promises">
      <div className="prt-ticker__track">
        {run()}
        {run(true)}
      </div>
    </div>
  )
}
