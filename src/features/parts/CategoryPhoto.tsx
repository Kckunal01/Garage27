import Image from 'next/image'
import type { CSSProperties } from 'react'
import { CategoryGlyph } from '@/components/media/CategoryGlyph'
import type { CategoryMeta } from '@/types/catalogue'

/**
 * A category's photograph, cropped by its catalogue focus/zoom (so one
 * Garage 27 photograph can serve several categories). No photograph → the
 * category stencil on a lit bench plate.
 */
export function CategoryPhoto({ meta, sizes, eager, className = '' }: { meta: CategoryMeta; sizes: string; eager?: boolean; className?: string }) {
  if (!meta.image) {
    return (
      <span className={`cphoto cphoto--stencil ${className}`} aria-hidden="true">
        <CategoryGlyph category={meta.id} className="cphoto__glyph" />
      </span>
    )
  }
  const { src, focus = '50% 50%', zoom = 1 } = meta.image
  const style = { objectPosition: focus, transformOrigin: focus, '--zoom': zoom } as CSSProperties
  return (
    <span className={`cphoto ${className}`} aria-hidden="true">
      <Image className="cphoto__img" src={src} alt="" fill sizes={sizes} quality={75} loading={eager ? 'eager' : 'lazy'} style={style} />
    </span>
  )
}
