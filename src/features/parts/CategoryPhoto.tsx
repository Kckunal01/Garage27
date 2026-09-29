import Image from 'next/image'
import { CategoryGlyph } from '@/components/media/CategoryGlyph'
import type { CategoryMeta } from '@/types/catalogue'

/** A category's photograph, framed on its catalogue focus point. No photograph → the category stencil. */
export function CategoryPhoto({ meta, sizes, eager, className = '' }: { meta: CategoryMeta; sizes: string; eager?: boolean; className?: string }) {
  if (!meta.image) {
    return (
      <span className={`cphoto cphoto--stencil ${className}`} aria-hidden="true">
        <CategoryGlyph category={meta.id} className="cphoto__glyph" />
      </span>
    )
  }
  return (
    <span className={`cphoto ${className}`} aria-hidden="true">
      <Image className="cphoto__img" src={meta.image.src} alt="" fill sizes={sizes} quality={75} loading={eager ? 'eager' : 'lazy'} style={{ objectPosition: meta.image.focus ?? '50% 50%' }} />
    </span>
  )
}
