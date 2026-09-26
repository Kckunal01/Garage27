import type { CategoryMeta } from '@/types/catalogue'
import { CategoryGlyph } from '@/components/media/CategoryGlyph'

export function CategoryTile({ meta, index, active, count, onSelect }: { meta: CategoryMeta; index: number; active?: boolean; count?: number; onSelect: () => void }) {
  return (
    <button type="button" className={`ctile${active ? ' is-active' : ''}`} aria-pressed={active} onClick={onSelect}>
      <span className="ctile__num">{String(index + 1).padStart(2, '0')}</span>
      <CategoryGlyph category={meta.id} className="ctile__glyph" />
      <span className="ctile__label">{meta.label}</span>
      <span className="ctile__desc">{meta.descriptor}</span>
      {count !== undefined && <span className="ctile__count">{count}</span>}
    </button>
  )
}
