import Image from 'next/image'
import { CategoryGlyph } from '@/components/media/CategoryGlyph'
import type { CategoryMeta } from '@/types/catalogue'

/**
 * A category on the parts wall: its photograph (or, where Garage 27 has no
 * photograph yet, the category stencil) over a dark label bar with an arrow.
 */
export function PartsCategoryTile({ meta, count, active, eager, onSelect }: { meta: CategoryMeta; count: number; active: boolean; eager?: boolean; onSelect(): void }) {
  return (
    <button
      type="button"
      className={`ptile${active ? ' is-active' : ''}${meta.image ? '' : ' ptile--stencil'}`}
      aria-pressed={active}
      aria-label={`${meta.label}: ${count} part${count === 1 ? '' : 's'}`}
      onClick={onSelect}
    >
      <span className="ptile__media" aria-hidden="true">
        {meta.image ? (
          <Image className="ptile__img" src={meta.image.src} alt="" fill sizes="(width < 768px) 50vw, 25vw" quality={75} loading={eager ? 'eager' : 'lazy'} style={{ objectPosition: meta.image.focus ?? '50% 50%' }} />
        ) : (
          <CategoryGlyph category={meta.id} className="ptile__glyph" />
        )}
      </span>
      <span className="ptile__bar">
        <span className="ptile__label">{meta.label}</span>
        <span className="ptile__count" aria-hidden="true">
          {count}
        </span>
        <svg className="ptile__arrow" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 12h15M13 6l6 6-6 6" />
        </svg>
      </span>
    </button>
  )
}
