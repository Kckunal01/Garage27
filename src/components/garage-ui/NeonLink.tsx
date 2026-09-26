import Link from 'next/link'
import type { ReactNode } from 'react'

export function NeonLink({ href, children, onClick }: { href: string; children: ReactNode; onClick?: () => void }) {
  return (
    <Link href={href} className="neon-link" onClick={onClick}>
      {children}
    </Link>
  )
}
