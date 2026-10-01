import Link from 'next/link'

export interface SubNavItem {
  href: string
  label: string
}

/**
 * Related pages of one section (a parent and its sub-pages), set below the
 * page's top section: a single typographic row over a hairline, the current
 * page in red. Not a navbar, not cards.
 */
export function SubNav({ label, items, current }: { label: string; items: SubNavItem[]; current: string }) {
  return (
    <nav className="subnav" aria-label={label}>
      <ul className="subnav__list">
        {items.map((it) => (
          <li key={it.href}>
            <Link href={it.href} className={`subnav__link${it.href === current ? ' is-current' : ''}`} aria-current={it.href === current ? 'page' : undefined}>
              {it.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
