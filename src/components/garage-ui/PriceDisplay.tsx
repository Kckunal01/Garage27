import { formatINR } from '@/lib/pricing/money'

/** Price with the approved language. Build values are always "estimated". */
export function PriceDisplay({ value, label, estimated, size = 'md', note }: { value: number; label?: string; estimated?: boolean; size?: 'sm' | 'md' | 'lg'; note?: string }) {
  return (
    <div className={`price price--${size}`}>
      {(label || estimated) && <p className="label">{label ?? 'ESTIMATED BUILD VALUE'}</p>}
      <p className="price__value" aria-live="polite">
        {formatINR(value)}
      </p>
      {note && <p className="price__note">{note}</p>}
    </div>
  )
}
