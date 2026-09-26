import type { ReactNode } from 'react'

export function SectionHeading({ kicker, title, children, as: Tag = 'h2', align = 'left' }: { kicker?: string; title: ReactNode; children?: ReactNode; as?: 'h1' | 'h2' | 'h3'; align?: 'left' | 'center' }) {
  return (
    <header className={`sheading sheading--${align}`}>
      {kicker && <p className="label label--amber">{kicker}</p>}
      <Tag className="headline">{title}</Tag>
      {children && <div className="lede">{children}</div>}
    </header>
  )
}
