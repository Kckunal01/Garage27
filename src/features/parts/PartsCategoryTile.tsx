import Link from 'next/link'
import type { CategoryMeta } from '@/types/catalogue'
import { CategoryPhoto } from './CategoryPhoto'

/** A section of the parts wall: its photograph over a dark signage bar. Opens the category page. */
export function PartsCategoryTile({ meta, href, count, eager, onNavigate }: { meta: CategoryMeta; href: string; count: number; eager?: boolean; onNavigate?: () => void }) {
  return (
    <Link href={href} className="ptile" aria-label={`${meta.label}: ${count} part${count === 1 ? '' : 's'}`} onClick={onNavigate}>
      <CategoryPhoto meta={meta} className="ptile__media" sizes="(width < 768px) 50vw, 25vw" eager={eager} />
      <span className="ptile__bar">
        <span className="ptile__label">{meta.label}</span>
        <span className="ptile__count" aria-hidden="true">
          {count}
        </span>
        <svg className="ptile__arrow" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 12h15M13 6l6 6-6 6" />
        </svg>
      </span>
    </Link>
  )
}
