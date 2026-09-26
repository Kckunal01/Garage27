import Link from 'next/link'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'ignite' | 'amber' | 'outline' | 'ghost'
interface Common {
  variant?: Variant
  size?: 'sm' | 'md'
  block?: boolean
  children: ReactNode
  className?: string
}

const cls = ({ variant = 'outline', size = 'md', block, className = '' }: Omit<Common, 'children'>) =>
  ['btn', variant !== 'outline' && `btn--${variant}`, size === 'sm' && 'btn--sm', block && 'btn--block', className].filter(Boolean).join(' ')

/** Link-styled garage button (navigation). */
export function GarageLink({ href, onClick, ...rest }: Common & { href: string; onClick?: () => void }) {
  return (
    <Link href={href} className={cls(rest)} onClick={onClick}>
      {rest.children}
    </Link>
  )
}

/** Action button. `busy` keeps the label width and announces progress. */
export function GarageButton({ variant, size, block, className, children, busy, ...props }: Common & ButtonHTMLAttributes<HTMLButtonElement> & { busy?: boolean }) {
  return (
    <button {...props} className={cls({ variant, size, block, className })} aria-busy={busy || undefined} disabled={props.disabled || busy}>
      {busy ? <span className="btn__spinner" aria-hidden="true" /> : null}
      {children}
    </button>
  )
}
