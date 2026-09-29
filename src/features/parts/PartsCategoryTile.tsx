import Link from 'next/link'
import type { CategoryMeta } from '@/types/catalogue'
import { CategoryPhoto } from './CategoryPhoto'

/**
 * A page of the parts catalogue: the category photograph full-bleed, a dark
 * gradient, then its number, name and one line. Opens /parts/<category>.
 */
export function PartsCategoryTile({ meta, index, href, count, eager, lead, onNavigate }: { meta: CategoryMeta; index: number; href: string; count: number; eager?: boolean; lead?: boolean; onNavigate?: () => void }) {
  return (
    <Link href={href} className={`ptile${lead ? ' ptile--lead' : ''}`} aria-label={`${meta.label} — ${meta.descriptor} ${count} part${count === 1 ? '' : 's'}.`} onClick={onNavigate}>
      <CategoryPhoto meta={meta} className="ptile__media" sizes={lead ? '(width < 768px) 100vw, 50vw' : '(width < 768px) 100vw, 34vw'} eager={eager} />
      <span className="ptile__shade" aria-hidden="true" />
      <span className="ptile__copy" aria-hidden="true">
        <span className="ptile__num">{String(index + 1).padStart(2, '0')}</span>
        <span className="ptile__label">{meta.label}</span>
        <span className="ptile__desc">{meta.descriptor}</span>
      </span>
      <svg className="ptile__arrow" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 12h15M13 6l6 6-6 6" />
      </svg>
    </Link>
  )
}
