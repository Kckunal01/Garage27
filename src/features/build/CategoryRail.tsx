'use client'

import { CategoryGlyph } from '@/components/media/CategoryGlyph'
import { BUILD_CATEGORY_META } from '@/data/catalogue'
import type { BuildCategory } from '@/types/catalogue'

/** Desktop: vertical rail. Mobile: horizontal chip strip. Same data, same state. */
export function CategoryRail({ categories, active, modified, onPick }: { categories: BuildCategory[]; active: BuildCategory | null; modified: Set<BuildCategory>; onPick(c: BuildCategory): void }) {
  return (
    <nav className="crail" aria-label="Build categories">
      <ul className="crail__list">
        {categories.map((c, i) => (
          <li key={c}>
            <button type="button" className={`crail__btn${active === c ? ' is-active' : ''}`} aria-pressed={active === c} onClick={() => onPick(c)}>
              <span className="crail__n">{String(i + 1).padStart(2, '0')}</span>
              <CategoryGlyph category={c} className="crail__glyph" />
              <span className="crail__label">{BUILD_CATEGORY_META[c].label}</span>
              {modified.has(c) && <span className="crail__mod" aria-label="customised" />}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}
