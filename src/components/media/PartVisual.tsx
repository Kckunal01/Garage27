import { CategoryGlyph } from './CategoryGlyph'

/** Product image, or a lit bench plate with the category stencil until photography exists. */
export function PartVisual({ src, alt, category, eager, className = '' }: { src?: string; alt: string; category: string; eager?: boolean; className?: string }) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element -- catalogue images are pre-optimised WebP/AVIF at delivery size
    return <img className={`pvis pvis--img ${className}`} src={src} alt={alt} loading={eager ? 'eager' : 'lazy'} decoding="async" />
  }
  return (
    <div className={`pvis pvis--plate ${className}`} role="img" aria-label={alt}>
      <CategoryGlyph category={category} className="pvis__glyph" />
    </div>
  )
}
